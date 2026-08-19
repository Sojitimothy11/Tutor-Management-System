const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination, buildMeta } = require("../utils/pagination");

const includeRelations = {
  department: { select: { id: true, name: true } },
  user: { select: { id: true, name: true, email: true } },
  subjects: { select: { id: true, name: true, code: true } },
};

// GET /api/teachers?departmentId=&status=&search=  (any authenticated user — directory view)
const listTeachers = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const where = {};
  if (req.query.departmentId) where.departmentId = Number(req.query.departmentId);
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) {
    where.OR = [
      { firstName: { contains: req.query.search } },
      { lastName: { contains: req.query.search } },
      { employeeId: { contains: req.query.search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
      include: includeRelations,
    }),
    prisma.teacher.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: buildMeta(pagination, total) });
});

// GET /api/teachers/me  (TEACHER)
const getMyProfile = asyncHandler(async (req, res) => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId: req.user.id },
    include: includeRelations,
  });
  if (!teacher) throw ApiError.notFound("No teacher profile is linked to this account");
  res.json({ success: true, data: teacher });
});

// PATCH /api/teachers/me  (TEACHER)
const updateMyProfile = asyncHandler(async (req, res) => {
  const existing = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
  if (!existing) throw ApiError.notFound("No teacher profile is linked to this account");

  const teacher = await prisma.teacher.update({
    where: { id: existing.id },
    data: req.body,
    include: includeRelations,
  });
  res.json({ success: true, data: teacher });
});

// GET /api/teachers/:id  (any authenticated user)
const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: req.params.id },
    include: includeRelations,
  });
  if (!teacher) throw ApiError.notFound("Teacher not found");
  res.json({ success: true, data: teacher });
});

// POST /api/teachers  (ADMIN)
const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.teacher.create({ data: req.body, include: includeRelations });
  res.status(201).json({ success: true, data: teacher });
});

// PATCH /api/teachers/:id  (ADMIN)
const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.teacher.update({
    where: { id: req.params.id },
    data: req.body,
    include: includeRelations,
  });
  res.json({ success: true, data: teacher });
});

// DELETE /api/teachers/:id  (ADMIN)
const deleteTeacher = asyncHandler(async (req, res) => {
  await prisma.teacher.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = {
  listTeachers,
  getMyProfile,
  updateMyProfile,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
