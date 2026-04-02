import prisma from "../prismaClient.js";

const slugify = (title) =>
  String(title)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

async function uniqueCourseSlug(title, { excludeId } = {}) {
  const base = slugify(title);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? base : `${base}-${n}`;
    const existing = await prisma.course.findFirst({
      where: {
        slug: candidate,
        ...(excludeId != null ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    n += 1;
  }
}

const toBool = (val) =>
  val === true || val === "true" || val === "1" || val === 1;

// ---------------------------------------------------------------------------
// COURSES
// ---------------------------------------------------------------------------

export const createCourse = async (req, res) => {
  const instructorId = req.user.id;
  const {
    title,
    description,
    categoryId,
    difficulty,
    durationHours,
    isPublished: isPublishedRaw,
    isFeatured: isFeaturedRaw,
  } = req.body;

  if (!title || !description || !categoryId) {
    return res.status(400).json({
      error: "title, description, and categoryId are required",
    });
  }

  try {
    const slug = await uniqueCourseSlug(title);

    const course = await prisma.course.create({
      data: {
        title,
        description,
        slug,
        categoryId: parseInt(categoryId),
        instructorId,
        difficulty: difficulty || undefined,
        durationHours: durationHours ? parseInt(durationHours) : null,
        thumbnail: req.cloudinaryUrl || null,
        isPublished: toBool(isPublishedRaw),
        isFeatured: toBool(isFeaturedRaw),
      },
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, profileImage: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { enrollments: true, reviews: true, modules: true } },
      },
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to create course", details: error.message });
  }
};

export const getCourses = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    categoryId,
    difficulty,
    search,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { isPublished: true };
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const validSortFields = ["createdAt", "title", "difficulty"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: order === "asc" ? "asc" : "desc" },
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true, profileImage: true },
          },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.status(200).json({
      courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error) {
    console.error("Public courses fetch error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, profileImage: true, bio: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        modules: {
          orderBy: { orderNumber: "asc" },
          select: { id: true, title: true, orderNumber: true, description: true },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true, rating: true, comment: true, createdAt: true,
            user: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
          },
        },
        _count: { select: { enrollments: true, reviews: true, modules: true } },
      },
    });

    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!course.isPublished) return res.status(403).json({ error: "This course is not available" });

    res.status(200).json(course);
  } catch (error) {
    console.error("Course fetch error:", error);
    res.status(500).json({ error: "Failed to retrieve course", details: error.message });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    categoryId,
    difficulty,
    instructorId,
    durationHours,
    isPublished: isPublishedRaw,
    isFeatured: isFeaturedRaw,
  } = req.body;

  try {
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId);
    if (difficulty !== undefined) data.difficulty = difficulty;
    if (instructorId !== undefined) data.instructorId = parseInt(instructorId);
    if (durationHours !== undefined) data.durationHours = durationHours ? parseInt(durationHours) : null;
    if (req.cloudinaryUrl) data.thumbnail = req.cloudinaryUrl;
    if (isPublishedRaw !== undefined) data.isPublished = toBool(isPublishedRaw);
    if (isFeaturedRaw !== undefined) data.isFeatured = toBool(isFeaturedRaw);

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data,
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, profileImage: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { enrollments: true, reviews: true, modules: true } },
      },
    });

    res.status(200).json(course);
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Course not found" });
    res.status(500).json({ error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.course.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Course not found" });
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------------

export const getAdminCourses = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    categoryId,
    difficulty,
    search,
    isPublished,
    isFeatured,
  } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};

    if (categoryId) where.categoryId = parseInt(categoryId);
    if (difficulty) where.difficulty = difficulty;
    if (isPublished === "true") where.isPublished = true;
    if (isPublished === "false") where.isPublished = false;
    if (isFeatured === "true") where.isFeatured = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true, profileImage: true },
          },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { enrollments: true, reviews: true, modules: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.status(200).json({
      data: courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error) {
    console.error("Admin courses fetch error:", error);
    res.status(500).json({ error: "Failed to fetch courses", details: error.message });
  }
};

export const toggleCoursePublish = async (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  if (isPublished === undefined) {
    return res.status(400).json({ error: "isPublished is required" });
  }

  try {
    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: { isPublished: toBool(isPublished) },
    });

    res.status(200).json({
      message: course.isPublished ? "Course published" : "Course unpublished",
      course,
    });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Course not found" });
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------------------------------------------------------
// MODULES
// ---------------------------------------------------------------------------

export const createModule = async (req, res) => {
  const { title, description, courseId, estimatedHours, orderNumber } = req.body;

  if (!title || !courseId) {
    return res.status(400).json({ error: "title and courseId are required" });
  }

  try {
    const module = await prisma.courseModule.create({
      data: {
        title,
        description: description || null,
        courseId: parseInt(courseId),
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
        orderNumber: orderNumber ? parseInt(orderNumber) : 1,
      },
    });
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateModule = async (req, res) => {
  const { id } = req.params;
  const { title, description, estimatedHours, isPublished, orderNumber } = req.body;

  try {
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (estimatedHours !== undefined) data.estimatedHours = estimatedHours ? parseInt(estimatedHours) : null;
    if (isPublished !== undefined) data.isPublished = toBool(isPublished);
    if (orderNumber !== undefined) data.orderNumber = parseInt(orderNumber);

    const module = await prisma.courseModule.update({
      where: { id: parseInt(id) },
      data,
    });
    res.status(200).json(module);
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Module not found" });
    res.status(500).json({ error: error.message });
  }
};

export const deleteModule = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.courseModule.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Module not found" });
    res.status(500).json({ error: error.message });
  }
};

export const getModuleById = async (req, res) => {
  const { id } = req.params;
  try {
    const module = await prisma.courseModule.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: true,
        units: { orderBy: { orderNumber: "asc" } },
        quizzes: { orderBy: { orderNumber: "asc" } },
        exercises: { orderBy: { orderNumber: "asc" } },
      },
    });
    if (!module) return res.status(404).json({ error: "Module not found" });
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getModules = async (req, res) => {
  const { courseId, page = 1, limit = 10 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = courseId ? { courseId: parseInt(courseId) } : {};

    const [modules, total] = await Promise.all([
      prisma.courseModule.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { orderNumber: "asc" },
        include: {
          course: { select: { id: true, title: true } },
          _count: { select: { units: true } },
        },
      }),
      prisma.courseModule.count({ where }),
    ]);

    res.status(200).json({
      modules,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------------------------------------------------------
// CONTENT UNITS
// ---------------------------------------------------------------------------

export const createContentUnit = async (req, res) => {
  const {
    title,
    description,
    moduleId,
    contentType,
    content,
    estimatedMinutes,
    orderNumber,
    isRequired,
  } = req.body;

  if (!title || !moduleId || !contentType) {
    return res.status(400).json({ error: "title, moduleId, and contentType are required" });
  }

  try {
    // For file uploads (RESOURCE, VIDEO, AUDIO), cloudinaryUrl takes precedence
    const resolvedContent = req.cloudinaryUrl || content || null;

    const unit = await prisma.contentUnit.create({
      data: {
        title,
        description: description || null,
        moduleId: parseInt(moduleId),
        contentType,
        content: resolvedContent,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        orderNumber: orderNumber ? parseInt(orderNumber) : 1,
        isRequired: isRequired !== undefined ? toBool(isRequired) : true,
      },
    });
    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getContentUnitsByModule = async (req, res) => {
  const { moduleId } = req.params;
  try {
    const units = await prisma.contentUnit.findMany({
      where: { moduleId: parseInt(moduleId) },
      orderBy: { orderNumber: "asc" },
    });
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve content units" });
  }
};

export const getContentUnitById = async (req, res) => {
  const { id } = req.params;
  try {
    const unit = await prisma.contentUnit.findUnique({
      where: { id: parseInt(id) },
      include: { attachments: true },
    });
    if (!unit) return res.status(404).json({ error: "Content unit not found" });
    res.status(200).json(unit);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve content unit" });
  }
};

export const updateContentUnit = async (req, res) => {
  const { id } = req.params;
  const { title, description, orderNumber, contentType, content, estimatedMinutes, isRequired } = req.body;

  try {
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (orderNumber !== undefined) data.orderNumber = parseInt(orderNumber);
    if (contentType !== undefined) data.contentType = contentType;
    if (content !== undefined || req.cloudinaryUrl) data.content = req.cloudinaryUrl || content;
    if (estimatedMinutes !== undefined) data.estimatedMinutes = parseInt(estimatedMinutes);
    if (isRequired !== undefined) data.isRequired = toBool(isRequired);

    const unit = await prisma.contentUnit.update({
      where: { id: parseInt(id) },
      data,
    });
    res.status(200).json({ message: "Content unit updated", unit });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Content unit not found" });
    res.status(500).json({ error: "Failed to update content unit" });
  }
};

export const deleteContentUnit = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.contentUnit.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Content unit not found" });
    res.status(500).json({ error: "Failed to delete content unit" });
  }
};

// ---------------------------------------------------------------------------
// ENROLLMENT
// ---------------------------------------------------------------------------

export const enrollInCourse = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  if (!courseId) return res.status(400).json({ error: "courseId is required" });

  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      select: { id: true, isPublished: true },
    });

    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!course.isPublished) return res.status(403).json({ error: "Cannot enroll in an unpublished course" });

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: parseInt(courseId) } },
    });

    if (existing) {
      return res.status(409).json({ error: "Already enrolled in this course", enrollment: existing });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId: parseInt(courseId), status: "ACTIVE", progressPercentage: 0 },
      include: { course: { select: { id: true, title: true, slug: true } } },
    });

    res.status(201).json({ message: "Successfully enrolled", enrollment });
  } catch (error) {
    res.status(500).json({ error: "Failed to enroll", details: error.message });
  }
};

export const unenrollFromCourse = async (req, res) => {
  const { courseId, reason } = req.body;
  const userId = req.user.id;

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: parseInt(courseId) } },
    });

    if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
    if (enrollment.status === "UNENROLLED") {
      return res.status(400).json({ error: "Already unenrolled from this course" });
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "UNENROLLED", unenrollmentDate: new Date(), unenrollmentReason: reason },
    });

    res.status(200).json({ message: "Unenrolled successfully", enrollment: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEnrolledCourses = async (req, res) => {
  const userId = req.user.id;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, status: { not: "UNENROLLED" } },
      orderBy: { enrollmentDate: "desc" },
      include: {
        course: {
          select: {
            id: true, title: true, slug: true, thumbnail: true, difficulty: true,
            category: { select: { id: true, name: true } },
            instructor: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve enrolled courses", details: error.message });
  }
};

// ---------------------------------------------------------------------------
// PROGRESS
// ---------------------------------------------------------------------------

export const updateUnitProgress = async (req, res) => {
  const { unitId, completed, timeSpentMinutes, lastPosition } = req.body;
  const userId = req.user.id;

  try {
    const unit = await prisma.contentUnit.findUnique({
      where: { id: parseInt(unitId) },
      select: { moduleId: true },
    });
    if (!unit) return res.status(404).json({ error: "Unit not found" });

    const module = await prisma.courseModule.findUnique({
      where: { id: unit.moduleId },
      select: { courseId: true },
    });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: module.courseId } },
    });
    if (!enrollment) return res.status(404).json({ error: "You are not enrolled in this course" });

    let unitProgress = await prisma.unitProgress.findUnique({
      where: { enrollmentId_unitId: { enrollmentId: enrollment.id, unitId: parseInt(unitId) } },
    });

    if (!unitProgress) {
      unitProgress = await prisma.unitProgress.create({
        data: {
          enrollmentId: enrollment.id,
          unitId: parseInt(unitId),
          userId,
          timeSpentMinutes: timeSpentMinutes || 0,
          lastPosition: lastPosition || null,
          completedAt: completed ? new Date() : null,
        },
      });
    } else {
      unitProgress = await prisma.unitProgress.update({
        where: { id: unitProgress.id },
        data: {
          timeSpentMinutes: { increment: timeSpentMinutes || 0 },
          lastPosition: lastPosition || undefined,
          completedAt: completed ? new Date() : unitProgress.completedAt,
        },
      });
    }

    await updateModuleAndCourseProgress(enrollment.id, module.courseId);

    res.status(200).json(unitProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function updateModuleAndCourseProgress(enrollmentId, courseId) {
  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    include: { units: { select: { id: true } } },
  });

  for (const module of modules) {
    const unitIds = module.units.map((u) => u.id);
    if (unitIds.length === 0) continue;

    const completedCount = await prisma.unitProgress.count({
      where: { enrollmentId, unitId: { in: unitIds }, completedAt: { not: null } },
    });

    const progressPercentage = Math.round((completedCount / unitIds.length) * 100);

    await prisma.moduleProgress.upsert({
      where: { enrollmentId_moduleId: { enrollmentId, moduleId: module.id } },
      update: { progressPercentage, completedAt: progressPercentage === 100 ? new Date() : null },
      create: {
        enrollmentId,
        moduleId: module.id,
        userId: (await prisma.enrollment.findUnique({ where: { id: enrollmentId } })).userId,
        progressPercentage,
        completedAt: progressPercentage === 100 ? new Date() : null,
      },
    });
  }

  const totalUnits = await prisma.contentUnit.count({ where: { module: { courseId } } });
  const completedUnits = await prisma.unitProgress.count({
    where: { enrollmentId, completedAt: { not: null }, unit: { module: { courseId } } },
  });

  const courseProgress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPercentage: courseProgress,
      completionDate: courseProgress === 100 ? new Date() : null,
      status: courseProgress === 100 ? "COMPLETED" : "ACTIVE",
    },
  });
}
