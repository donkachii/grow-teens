import type { Request, Response } from "express";
import prisma from "../prismaClient.ts";
import fetch from "node-fetch";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type CanvasCourse = { id: number; name: string; public_description?: string; [key: string]: unknown };
type CanvasEnrollment = { user: { id: number; login_id?: string; email?: string }; enrollment_state: string };

type CanvasModule = {
  id: number;
  name: string;
  position: number;
  items_count: number;
  [key: string]: unknown;
};

type CanvasModuleItem = {
  id: number;
  title: string;
  position: number;
  type: string; // "Page" | "File" | "Assignment" | "Quiz" | "ExternalUrl" | "ExternalTool" | "SubHeader" | "Discussion"
  page_url?: string;
  external_url?: string;
  content_id?: number;
  [key: string]: unknown;
};

type CanvasQuiz = {
  id: number;
  title: string;
  description?: string;
  time_limit?: number;
  allowed_attempts: number;
  scoring_policy?: string;
  shuffle_answers: boolean;
  show_correct_answers: boolean;
  assignment_id?: number;
  assignment_group_id?: number;
  [key: string]: unknown;
};

type CanvasQuizQuestion = {
  id: number;
  question_name: string;
  question_text: string;
  question_type: string;
  points_possible: number;
  position: number;
  answers?: { id: number; text: string; weight: number; [key: string]: unknown }[];
  correct_comments?: string;
  [key: string]: unknown;
};

type CanvasAssignment = {
  id: number;
  name: string;
  description?: string;
  points_possible: number;
  due_at?: string;
  submission_types: string[];
  course_id: number;
  [key: string]: unknown;
};

const slugify = (title: string): string =>
  String(title)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

async function uniqueCourseSlug(title: string): Promise<string> {
  const base = slugify(title);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? base : `${base}-${n}`;
    const existing = await prisma.course.findFirst({ where: { slug: candidate } });
    if (!existing) return candidate;
    n += 1;
  }
}

async function getActiveConfig() {
  const config = await prisma.canvasConfig.findFirst({ where: { isActive: true } });
  if (!config) throw new Error("Canvas is not configured. Add your Canvas domain and API token first.");
  return config;
}

async function canvasRequest<T = unknown>(
  domain: string,
  token: string,
  method: string,
  path: string,
  body: unknown = null
): Promise<T> {
  const url = `https://${domain}/api/v1${path}`;
  const options: { method: string; headers: Record<string, string>; body?: string } = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Canvas API ${method} ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const getCanvasConfig = async (req: Request, res: Response) => {
  try {
    const config = await prisma.canvasConfig.findFirst();
    if (!config) return res.json({ configured: false });
    res.json({
      configured: true,
      id: config.id,
      domain: config.domain,
      accountId: config.accountId,
      isActive: config.isActive,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const saveCanvasConfig = async (req: Request, res: Response) => {
  const { domain, apiToken, accountId = "1" } = req.body as { domain: string; apiToken: string; accountId?: string };
  if (!domain || !apiToken) {
    return res.status(400).json({ error: "domain and apiToken are required" });
  }
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  try {
    await canvasRequest(cleanDomain, apiToken, "GET", "/accounts");

    const existing = await prisma.canvasConfig.findFirst();
    let config;
    if (existing) {
      config = await prisma.canvasConfig.update({
        where: { id: existing.id },
        data: { domain: cleanDomain, apiToken, accountId, isActive: true },
      });
    } else {
      config = await prisma.canvasConfig.create({
        data: { domain: cleanDomain, apiToken, accountId },
      });
    }
    res.json({
      message: "Canvas configuration saved successfully",
      domain: config.domain,
      accountId: config.accountId,
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// ---------------------------------------------------------------------------
// Canvas course list
// ---------------------------------------------------------------------------

export const getCanvasCourses = async (req: Request, res: Response) => {
  try {
    const config = await getActiveConfig();
    const page = String(req.query.page || "1");
    const per_page = String(req.query.per_page || "30");
    const courses = await canvasRequest<CanvasCourse[]>(
      config.domain,
      config.apiToken,
      "GET",
      `/accounts/${config.accountId}/courses?per_page=${per_page}&page=${page}&state[]=available&state[]=unpublished`
    );
    const canvasIds = courses.map((c) => String(c.id));
    const linked = await prisma.course.findMany({
      where: { canvasId: { in: canvasIds } },
      select: { canvasId: true, id: true, title: true },
    });
    const linkedMap = Object.fromEntries(linked.map((c) => [c.canvasId, c]));
    const annotated = courses.map((c) => ({
      ...c,
      growTeensCourse: linkedMap[String(c.id)] || null,
    }));
    res.json({ data: annotated });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ---------------------------------------------------------------------------
// Import: Canvas → GrowTeens
// ---------------------------------------------------------------------------

export const importCoursesFromCanvas = async (req: Request, res: Response) => {
  const log = await prisma.canvasSyncLog.create({
    data: { operation: "IMPORT_COURSES", status: "RUNNING" },
  });
  try {
    const config = await getActiveConfig();
    const { courseIds } = req.body as { courseIds?: number[] };

    let canvasCourses: CanvasCourse[];
    if (courseIds && courseIds.length > 0) {
      canvasCourses = await Promise.all(
        courseIds.map((id) =>
          canvasRequest<CanvasCourse>(config.domain, config.apiToken, "GET", `/courses/${id}`)
        )
      );
    } else {
      canvasCourses = await canvasRequest<CanvasCourse[]>(
        config.domain,
        config.apiToken,
        "GET",
        `/accounts/${config.accountId}/courses?per_page=50&state[]=available&state[]=unpublished`
      );
    }

    let defaultCategory = await prisma.category.findFirst({
      where: { slug: "canvas-import" },
    });
    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: { name: "Canvas Import", slug: "canvas-import" },
      });
    }

    let imported = 0;
    let updated = 0;
    for (const cc of canvasCourses) {
      const canvasIdStr = String(cc.id);
      const existing = await prisma.course.findFirst({
        where: { canvasId: canvasIdStr },
      });
      if (existing) {
        await prisma.course.update({
          where: { id: existing.id },
          data: {
            title: cc.name,
            description: cc.public_description || existing.description,
          },
        });
        updated++;
      } else {
        const slug = await uniqueCourseSlug(cc.name);
        await prisma.course.create({
          data: {
            title: cc.name,
            slug,
            description: cc.public_description || cc.name,
            categoryId: defaultCategory.id,
            canvasId: canvasIdStr,
          },
        });
        imported++;
      }
    }

    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: {
        status: "COMPLETED",
        recordCount: imported + updated,
        completedAt: new Date(),
        details: `Imported: ${imported}, Updated: ${updated}`,
      },
    });
    res.json({ message: `Imported ${imported}, updated ${updated} courses`, imported, updated });
  } catch (error) {
    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: { status: "FAILED", error: (error as Error).message, completedAt: new Date() },
    });
    res.status(500).json({ error: (error as Error).message });
  }
};

// ---------------------------------------------------------------------------
// Push: GrowTeens → Canvas
// ---------------------------------------------------------------------------

export const pushCourseToCanvas = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const log = await prisma.canvasSyncLog.create({
    data: { operation: "PUSH_COURSE", status: "RUNNING" },
  });
  try {
    const config = await getActiveConfig();
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });
    if (!course) throw new Error("Course not found");

    const payload = {
      course: {
        name: course.title,
        course_code: course.slug,
        public_description: course.description,
        is_public: course.isPublished,
      },
    };

    let canvasCourse: CanvasCourse;
    if (course.canvasId) {
      canvasCourse = await canvasRequest<CanvasCourse>(
        config.domain, config.apiToken, "PUT", `/courses/${course.canvasId}`, payload
      );
    } else {
      canvasCourse = await canvasRequest<CanvasCourse>(
        config.domain, config.apiToken, "POST", `/accounts/${config.accountId}/courses`, payload
      );
      await prisma.course.update({
        where: { id: course.id },
        data: { canvasId: String(canvasCourse.id) },
      });
    }

    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: {
        status: "COMPLETED",
        recordCount: 1,
        completedAt: new Date(),
        details: `"${course.title}" → Canvas course ID ${canvasCourse.id}`,
      },
    });
    res.json({
      message: "Course pushed to Canvas successfully",
      canvasCourseId: canvasCourse.id,
    });
  } catch (error) {
    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: { status: "FAILED", error: (error as Error).message, completedAt: new Date() },
    });
    res.status(500).json({ error: (error as Error).message });
  }
};

// ---------------------------------------------------------------------------
// Sync enrollments: Canvas → GrowTeens
// ---------------------------------------------------------------------------

export const syncEnrollments = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const log = await prisma.canvasSyncLog.create({
    data: { operation: "SYNC_ENROLLMENTS", status: "RUNNING" },
  });
  try {
    const config = await getActiveConfig();
    const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } });
    if (!course) throw new Error("Course not found");
    if (!course.canvasId) throw new Error("This course is not linked to a Canvas course");

    const canvasEnrollments = await canvasRequest<CanvasEnrollment[]>(
      config.domain,
      config.apiToken,
      "GET",
      `/courses/${course.canvasId}/enrollments?per_page=100&type[]=StudentEnrollment`
    );

    let synced = 0;
    let skipped = 0;
    for (const enrollment of canvasEnrollments) {
      const cu = enrollment.user;
      const email = cu.login_id || cu.email;
      if (!email) { skipped++; continue; }

      const gtUser = await prisma.user.findFirst({
        where: { OR: [{ canvasId: String(cu.id) }, { email }] },
      });

      if (!gtUser) { skipped++; continue; }

      if (!gtUser.canvasId) {
        await prisma.user.update({
          where: { id: gtUser.id },
          data: { canvasId: String(cu.id) },
        });
      }

      const enrollmentStatus = enrollment.enrollment_state === "completed" ? "COMPLETED" : "ACTIVE";
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: gtUser.id, courseId: course.id } },
        create: { userId: gtUser.id, courseId: course.id, status: enrollmentStatus },
        update: { status: enrollmentStatus },
      });
      synced++;
    }

    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: {
        status: "COMPLETED",
        recordCount: synced,
        completedAt: new Date(),
        details: `Synced: ${synced}, Skipped (no matching user): ${skipped}`,
      },
    });
    res.json({ message: `Synced ${synced} enrollments`, synced, skipped });
  } catch (error) {
    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: { status: "FAILED", error: (error as Error).message, completedAt: new Date() },
    });
    res.status(500).json({ error: (error as Error).message });
  }
};

// ---------------------------------------------------------------------------
// Sync logs
// ---------------------------------------------------------------------------

export const getSyncLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.canvasSyncLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.canvasSyncLog.count(),
    ]);
    res.json({
      data: logs,
      pagination: { total, page, limit },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ---------------------------------------------------------------------------
// Import modules: Canvas → CourseModule + ContentUnit
// ---------------------------------------------------------------------------

function canvasItemTypeToContentType(type: string): string | null {
  switch (type) {
    case "Page": return "TEXT";
    case "File": return "RESOURCE";
    case "ExternalUrl": return "RESOURCE";
    case "ExternalTool": return "INTERACTIVE";
    case "Assignment": return "ASSIGNMENT";
    case "Discussion": return "TEXT";
    case "SubHeader": return null; // skip
    default: return "RESOURCE";
  }
}

export const importModules = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const log = await prisma.canvasSyncLog.create({
    data: { operation: "IMPORT_MODULES", status: "RUNNING" },
  });
  try {
    const config = await getActiveConfig();
    const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } });
    if (!course) throw new Error("Course not found");
    if (!course.canvasId) throw new Error("This course is not linked to a Canvas course");

    const canvasModules = await canvasRequest<CanvasModule[]>(
      config.domain, config.apiToken, "GET",
      `/courses/${course.canvasId}/modules?per_page=50&include[]=items`
    );

    let modulesImported = 0;
    let modulesUpdated = 0;
    let unitsImported = 0;
    let unitsUpdated = 0;

    for (const cm of canvasModules) {
      const canvasModuleId = String(cm.id);
      const existing = await prisma.courseModule.findFirst({
        where: { courseId: course.id, canvasId: canvasModuleId },
      });

      let module;
      if (existing) {
        module = await prisma.courseModule.update({
          where: { id: existing.id },
          data: { title: cm.name, orderNumber: cm.position },
        });
        modulesUpdated++;
      } else {
        // Resolve orderNumber conflict: if position is taken, use next available
        const taken = await prisma.courseModule.findFirst({
          where: { courseId: course.id, orderNumber: cm.position },
        });
        const orderNumber = taken
          ? (await prisma.courseModule.count({ where: { courseId: course.id } })) + 1
          : cm.position;

        module = await prisma.courseModule.create({
          data: {
            courseId: course.id,
            title: cm.name,
            orderNumber,
            canvasId: canvasModuleId,
          },
        });
        modulesImported++;
      }

      // Fetch items for this module
      const items = await canvasRequest<CanvasModuleItem[]>(
        config.domain, config.apiToken, "GET",
        `/courses/${course.canvasId}/modules/${cm.id}/items?per_page=50`
      );

      for (const item of items) {
        const contentType = canvasItemTypeToContentType(item.type);
        if (!contentType) continue; // skip SubHeader

        const canvasItemId = String(item.id);
        // Store Canvas item ID in the content field as a metadata prefix
        const contentValue = item.external_url || item.page_url || `canvas-item:${item.id}`;

        const existingUnit = await prisma.contentUnit.findFirst({
          where: { moduleId: module.id, content: { startsWith: `canvas-item:${item.id}` } },
        });

        if (existingUnit) {
          await prisma.contentUnit.update({
            where: { id: existingUnit.id },
            data: {
              title: item.title,
              contentType: contentType as any,
              orderNumber: item.position,
              content: contentValue,
            },
          });
          unitsUpdated++;
        } else {
          const takenUnit = await prisma.contentUnit.findFirst({
            where: { moduleId: module.id, orderNumber: item.position },
          });
          const orderNumber = takenUnit
            ? (await prisma.contentUnit.count({ where: { moduleId: module.id } })) + 1
            : item.position;

          await prisma.contentUnit.create({
            data: {
              moduleId: module.id,
              title: item.title,
              contentType: contentType as any,
              orderNumber,
              content: contentValue,
            },
          });
          unitsImported++;
        }
      }
    }

    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: {
        status: "COMPLETED",
        recordCount: modulesImported + modulesUpdated + unitsImported + unitsUpdated,
        completedAt: new Date(),
        details: `Modules: imported ${modulesImported}, updated ${modulesUpdated}. Units: imported ${unitsImported}, updated ${unitsUpdated}.`,
      },
    });
    res.json({ message: "Modules imported", modulesImported, modulesUpdated, unitsImported, unitsUpdated });
  } catch (error) {
    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: { status: "FAILED", error: (error as Error).message, completedAt: new Date() },
    });
    res.status(500).json({ error: (error as Error).message });
  }
};

// ---------------------------------------------------------------------------
// Import quizzes: Canvas → Quiz + QuizQuestion
// ---------------------------------------------------------------------------

function canvasQuestionTypeToEnum(type: string): string {
  switch (type) {
    case "multiple_choice_question":
    case "multiple_answers_question": return "MULTIPLE_CHOICE";
    case "true_false_question": return "TRUE_FALSE";
    case "short_answer_question":
    case "fill_in_multiple_blanks_question":
    case "fill_in_the_blank_question": return "SHORT_ANSWER";
    case "essay_question": return "ESSAY";
    case "file_upload_question": return "FILE_UPLOAD";
    default: return "SHORT_ANSWER";
  }
}

export const importQuizzes = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const log = await prisma.canvasSyncLog.create({
    data: { operation: "IMPORT_QUIZZES", status: "RUNNING" },
  });
  try {
    const config = await getActiveConfig();
    const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } });
    if (!course) throw new Error("Course not found");
    if (!course.canvasId) throw new Error("This course is not linked to a Canvas course");

    const canvasQuizzes = await canvasRequest<CanvasQuiz[]>(
      config.domain, config.apiToken, "GET",
      `/courses/${course.canvasId}/quizzes?per_page=50`
    );

    let quizzesImported = 0;
    let quizzesUpdated = 0;
    let questionsImported = 0;

    for (const cq of canvasQuizzes) {
      const canvasQuizId = String(cq.id);

      // Find the linked CourseModule — Canvas quiz may have a module_id; fall back to first module
      let module = await prisma.courseModule.findFirst({
        where: { courseId: course.id, canvasId: String((cq as any).module_id ?? "") },
      });
      if (!module) {
        module = await prisma.courseModule.findFirst({ where: { courseId: course.id } });
      }
      if (!module) {
        // Create a default module if none exists
        const count = await prisma.courseModule.count({ where: { courseId: course.id } });
        module = await prisma.courseModule.create({
          data: { courseId: course.id, title: "Quizzes", orderNumber: count + 1 },
        });
      }

      const allowRetakes = cq.allowed_attempts === -1 || cq.allowed_attempts > 1;
      const maxAttempts = cq.allowed_attempts === -1 ? null : cq.allowed_attempts;

      const existingQuiz = await prisma.quiz.findFirst({
        where: { moduleId: module.id, canvasId: canvasQuizId },
      });

      let quiz;
      if (existingQuiz) {
        quiz = await prisma.quiz.update({
          where: { id: existingQuiz.id },
          data: {
            title: cq.title,
            description: cq.description ?? null,
            timeLimit: cq.time_limit ?? null,
            allowRetakes,
            maxAttempts,
            randomizeQuestions: cq.shuffle_answers,
            showCorrectAnswers: cq.show_correct_answers,
            canvasAssignmentId: cq.assignment_id ? String(cq.assignment_id) : null,
          },
        });
        quizzesUpdated++;
      } else {
        const orderNumber =
          (await prisma.quiz.count({ where: { moduleId: module.id } })) + 1;
        quiz = await prisma.quiz.create({
          data: {
            moduleId: module.id,
            title: cq.title,
            description: cq.description ?? null,
            timeLimit: cq.time_limit ?? null,
            allowRetakes,
            maxAttempts,
            randomizeQuestions: cq.shuffle_answers,
            showCorrectAnswers: cq.show_correct_answers,
            orderNumber,
            canvasId: canvasQuizId,
            canvasAssignmentId: cq.assignment_id ? String(cq.assignment_id) : null,
          },
        });
        quizzesImported++;
      }

      // Fetch questions
      const questions = await canvasRequest<CanvasQuizQuestion[]>(
        config.domain, config.apiToken, "GET",
        `/courses/${course.canvasId}/quizzes/${cq.id}/questions?per_page=100`
      );

      // Delete old questions on re-import to keep them in sync
      if (existingQuiz) {
        await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
      }

      for (const qq of questions) {
        const questionType = canvasQuestionTypeToEnum(qq.question_type);
        const options = qq.answers ? JSON.stringify(qq.answers.map((a) => a.text)) : null;
        const correctAnswer = qq.answers
          ? JSON.stringify(qq.answers.filter((a) => a.weight > 0).map((a) => a.text))
          : null;

        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: qq.question_text,
            questionType: questionType as any,
            points: qq.points_possible,
            orderNumber: qq.position,
            options,
            correctAnswer,
            explanation: qq.correct_comments ?? null,
          },
        });
        questionsImported++;
      }
    }

    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: {
        status: "COMPLETED",
        recordCount: quizzesImported + quizzesUpdated,
        completedAt: new Date(),
        details: `Quizzes: imported ${quizzesImported}, updated ${quizzesUpdated}. Questions imported: ${questionsImported}.`,
      },
    });
    res.json({ message: "Quizzes imported", quizzesImported, quizzesUpdated, questionsImported });
  } catch (error) {
    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: { status: "FAILED", error: (error as Error).message, completedAt: new Date() },
    });
    res.status(500).json({ error: (error as Error).message });
  }
};

// ---------------------------------------------------------------------------
// Import assignments: Canvas → Exercise (module-level) or Assessment (course-level)
// ---------------------------------------------------------------------------

function submissionTypeToExerciseType(types: string[]): string | null {
  if (types.includes("online_text_entry")) return "WRITTEN";
  if (types.includes("online_upload")) return "FILE_UPLOAD";
  if (types.includes("online_url") || types.includes("media_recording")) return "PROJECT";
  return null; // treat as Assessment
}

export const importAssignments = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const log = await prisma.canvasSyncLog.create({
    data: { operation: "IMPORT_ASSIGNMENTS", status: "RUNNING" },
  });
  try {
    const config = await getActiveConfig();
    const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } });
    if (!course) throw new Error("Course not found");
    if (!course.canvasId) throw new Error("This course is not linked to a Canvas course");

    const assignments = await canvasRequest<CanvasAssignment[]>(
      config.domain, config.apiToken, "GET",
      `/courses/${course.canvasId}/assignments?per_page=50`
    );

    let exercisesImported = 0;
    let exercisesUpdated = 0;
    let assessmentsImported = 0;
    let assessmentsUpdated = 0;

    for (const ca of assignments) {
      const canvasAssignmentId = String(ca.id);
      const exerciseType = submissionTypeToExerciseType(ca.submission_types);

      if (exerciseType) {
        // Map to Exercise linked to a CourseModule
        let module = await prisma.courseModule.findFirst({ where: { courseId: course.id } });
        if (!module) {
          module = await prisma.courseModule.create({
            data: { courseId: course.id, title: "Assignments", orderNumber: 1 },
          });
        }

        const existing = await prisma.exercise.findFirst({
          where: { moduleId: module.id, canvasId: canvasAssignmentId },
        });

        const description = ca.description ?? ca.name;
        const dueDate = ca.due_at ? new Date(ca.due_at) : null;

        if (existing) {
          await prisma.exercise.update({
            where: { id: existing.id },
            data: {
              title: ca.name,
              description,
              instructions: description,
              maxScore: Math.round(ca.points_possible) || 100,
              dueDate,
            },
          });
          exercisesUpdated++;
        } else {
          const orderNumber =
            (await prisma.exercise.count({ where: { moduleId: module.id } })) + 1;
          await prisma.exercise.create({
            data: {
              moduleId: module.id,
              title: ca.name,
              description,
              instructions: description,
              exerciseType: exerciseType as any,
              orderNumber,
              maxScore: Math.round(ca.points_possible) || 100,
              dueDate,
              canvasId: canvasAssignmentId,
            },
          });
          exercisesImported++;
        }
      } else {
        // Map to Assessment (course-level)
        const totalPoints = Math.round(ca.points_possible) || 100;
        const passingPoints = Math.round(totalPoints * 0.8);
        const description = ca.description ?? ca.name;

        const existing = await prisma.assessment.findFirst({
          where: { courseId: course.id, canvasId: canvasAssignmentId },
        });

        if (existing) {
          await prisma.assessment.update({
            where: { id: existing.id },
            data: { title: ca.name, description, totalPoints, passingPoints },
          });
          assessmentsUpdated++;
        } else {
          await prisma.assessment.create({
            data: {
              courseId: course.id,
              title: ca.name,
              description,
              totalPoints,
              passingPoints,
              canvasId: canvasAssignmentId,
            },
          });
          assessmentsImported++;
        }
      }
    }

    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: {
        status: "COMPLETED",
        recordCount: exercisesImported + exercisesUpdated + assessmentsImported + assessmentsUpdated,
        completedAt: new Date(),
        details: `Exercises: imported ${exercisesImported}, updated ${exercisesUpdated}. Assessments: imported ${assessmentsImported}, updated ${assessmentsUpdated}.`,
      },
    });
    res.json({
      message: "Assignments imported",
      exercisesImported, exercisesUpdated,
      assessmentsImported, assessmentsUpdated,
    });
  } catch (error) {
    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: { status: "FAILED", error: (error as Error).message, completedAt: new Date() },
    });
    res.status(500).json({ error: (error as Error).message });
  }
};

// ---------------------------------------------------------------------------
// Sync quiz result: GrowTeens → Canvas grade book
// ---------------------------------------------------------------------------

export const syncQuizResult = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { attemptId } = req.body as { attemptId: number };
  const log = await prisma.canvasSyncLog.create({
    data: { operation: "SYNC_QUIZ_RESULT", status: "RUNNING" },
  });
  try {
    if (!attemptId) throw new Error("attemptId is required");

    const config = await getActiveConfig();

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: Number(attemptId) },
      include: {
        quiz: true,
        enrollment: { include: { course: true } },
      },
    });
    if (!attempt) throw new Error("Quiz attempt not found");
    if (attempt.score === null || attempt.score === undefined) throw new Error("Quiz attempt has no score yet");

    const { quiz, enrollment } = attempt;
    if (!quiz.canvasAssignmentId) throw new Error("This quiz is not linked to a Canvas assignment");

    const course = enrollment.course;
    if (!course.canvasId) throw new Error("The course is not linked to a Canvas course");

    // Fetch user to get their canvasId
    const user = await prisma.user.findUnique({ where: { id: attempt.userId } });
    if (!user) throw new Error("User not found");
    if (!user.canvasId) throw new Error("User does not have a linked Canvas account");

    await canvasRequest(
      config.domain,
      config.apiToken,
      "PUT",
      `/courses/${course.canvasId}/assignments/${quiz.canvasAssignmentId}/submissions/${user.canvasId}`,
      { submission: { posted_grade: String(attempt.score) } }
    );

    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: {
        status: "COMPLETED",
        recordCount: 1,
        completedAt: new Date(),
        details: `Quiz attempt ${attemptId}: score ${attempt.score} pushed to Canvas assignment ${quiz.canvasAssignmentId} for user ${user.canvasId}`,
      },
    });
    res.json({
      message: "Quiz result synced to Canvas",
      attemptId: attempt.id,
      score: attempt.score,
      canvasAssignmentId: quiz.canvasAssignmentId,
    });
  } catch (error) {
    await prisma.canvasSyncLog.update({
      where: { id: log.id },
      data: { status: "FAILED", error: (error as Error).message, completedAt: new Date() },
    });
    res.status(500).json({ error: (error as Error).message });
  }
};
