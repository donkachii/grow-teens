import prisma from "../prismaClient.js";

const slugify = (title) => {
  const s = String(title || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "program";
};

/** Resolves a unique slug; optionally exclude a program id when updating. */
async function uniqueProgramSlugFromTitle(title, { excludeId } = {}) {
  const base = slugify(title);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? base : `${base}-${n}`;
    const existing = await prisma.program.findFirst({
      where: {
        slug: candidate,
        ...(excludeId != null ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    n += 1;
  }
}

const programIncludeList = {
  courses: {
    orderBy: { orderNumber: "asc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
        },
      },
    },
  },
};

const programIncludeDetail = {
  courses: {
    orderBy: { orderNumber: "asc" },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { orderNumber: "asc" },
          },
        },
      },
    },
  },
};

function flattenModules(program) {
  if (!program.courses?.length) return [];
  const sortedLinks = [...program.courses].sort(
    (a, b) => a.orderNumber - b.orderNumber
  );
  return sortedLinks.flatMap((pc) =>
    [...(pc.course?.modules || [])]
      .sort((a, b) => a.orderNumber - b.orderNumber)
      .map((m) => ({
        ...m,
        content: JSON.stringify(
          m.description ? [m.description] : [`Module: ${m.title}`]
        ),
      }))
  );
}

function serializeProgram(program, { withModules = false } = {}) {
  const modules = withModules ? flattenModules(program) : undefined;
  const { courses, ...rest } = program;
  const out = {
    ...rest,
    courses,
    image: program.thumbnail ?? null,
    type: null,
  };
  if (modules) out.modules = modules;
  return out;
}

export const createProgram = async (req, res) => {
  const { title, description } = req.body;

  try {
    if (
      [title, description].some((field) => !field || String(field).trim() === "")
    ) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    if (!req.cloudinaryUrl) {
      return res
        .status(400)
        .json({ error: "Program thumbnail image is required" });
    }

    const slug = await uniqueProgramSlugFromTitle(title);

    const program = await prisma.program.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        slug,
        thumbnail: req.cloudinaryUrl,
        isPublished: false,
      },
      include: programIncludeList,
    });

    res.status(201).json(serializeProgram(program));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProgram = async (req, res) => {
  const { id } = req.params;
  const { title, description, isPublished: isPublishedRaw } = req.body;

  try {
    const existing = await prisma.program.findUnique({
      where: { id: +id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Program not found" });
    }

    const data = {};
    if (title !== undefined && String(title).trim() !== "") {
      data.title = String(title).trim();
      data.slug = await uniqueProgramSlugFromTitle(title, {
        excludeId: existing.id,
      });
    }
    if (description !== undefined) {
      data.description = String(description).trim();
    }
    if (isPublishedRaw !== undefined) {
      data.isPublished =
        isPublishedRaw === true ||
        isPublishedRaw === "true" ||
        isPublishedRaw === "1";
    }
    if (req.cloudinaryUrl) {
      data.thumbnail = req.cloudinaryUrl;
    }

    const program = await prisma.program.update({
      where: { id: +id },
      data,
      include: programIncludeDetail,
    });
    res.status(200).json(serializeProgram(program, { withModules: true }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProgram = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.program.delete({ where: { id: +id } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgramById = async (req, res) => {
  const { id } = req.params;
  try {
    const program = await prisma.program.findFirst({
      where: { id: +id },
      include: programIncludeDetail,
    });
    if (!program) return res.status(404).json({ error: "Program not found" });
    res.status(200).json(serializeProgram(program, { withModules: true }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Program not found" });
  }
};

export const getPrograms = async (req, res) => {
  try {
    const count = await prisma.program.count();
    const take = Math.min(Number(req.query.take) || 10, 100);
    const programs = await prisma.program.findMany({
      include: programIncludeList,
      skip: Number(req.query.skip) || 0,
      take,
    });
    res.status(200).json({
      count,
      data: programs.map((p) => serializeProgram(p)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const addCourseToProgram = async (req, res) => {
  const { id } = req.params;
  const { courseId, orderNumber } = req.body;

  if (!courseId) return res.status(400).json({ error: "courseId is required" });

  try {
    const program = await prisma.program.findUnique({ where: { id: +id } });
    if (!program) return res.status(404).json({ error: "Program not found" });

    const course = await prisma.course.findUnique({ where: { id: +courseId } });
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Auto-assign orderNumber if not provided
    let order = orderNumber != null ? +orderNumber : null;
    if (order == null) {
      const last = await prisma.programCourse.findFirst({
        where: { programId: +id },
        orderBy: { orderNumber: "desc" },
      });
      order = (last?.orderNumber ?? 0) + 1;
    }

    const link = await prisma.programCourse.create({
      data: { programId: +id, courseId: +courseId, orderNumber: order },
      include: { course: { select: { id: true, title: true, slug: true, thumbnail: true } } },
    });

    res.status(201).json(link);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Course is already in this program" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const removeCourseFromProgram = async (req, res) => {
  const { id, courseId } = req.params;

  try {
    await prisma.programCourse.deleteMany({
      where: { programId: +id, courseId: +courseId },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
