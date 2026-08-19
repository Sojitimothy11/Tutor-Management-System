const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination, buildMeta } = require("../utils/pagination");

const includeRelations = {
  department: { select: { id: true, name: true } },
  user: { select: { id: true, name: true, email: true } },
};

// GET /api/students?departmentId=&status=&search=  (ADMIN, TEACHER)
const listStudents = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const where = {};
  if (req.query.departmentId) where.departmentId = Number(req.query.departmentId);
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) {
    where.OR = [
      { firstName: { contains: req.query.search } },
      { lastName: { contains: req.query.search } },
      { admissionNo: { contains: req.query.search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
      include: includeRelations,
    }),
    prisma.student.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: buildMeta(pagination, total) });
});

// GET /api/students/me  (STUDENT)
const getMyProfile = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
    include: includeRelations,
  });
  if (!student) throw ApiError.notFound("No student profile is linked to this account");
  res.json({ success: true, data: student });
});

// PATCH /api/students/me  (STUDENT)
const updateMyProfile = asyncHandler(async (req, res) => {
  const existing = await prisma.student.findUnique({ where: { userId: req.user.id } });
  if (!existing) throw ApiError.notFound("No student profile is linked to this account");

  const student = await prisma.student.update({
    where: { id: existing.id },
    data: req.body,
    include: includeRelations,
  });
  res.json({ success: true, data: student });
});

// GET /api/students/:id  (ADMIN, TEACHER: any. STUDENT: only their own record)
const getStudent = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: includeRelations,
  });
  if (!student) throw ApiError.notFound("Student not found");

  if (req.user.role === "STUDENT" && student.userId !== req.user.id) {
    throw ApiError.forbidden("You can only view your own student record");
  }

  res.json({ success: true, data: student });
});

// POST /api/students  (ADMIN)
const createStudent = asyncHandler(async (req, res) => {
  const student = await prisma.student.create({ data: req.body, include: includeRelations });
  res.status(201).json({ success: true, data: student });
});

// PATCH /api/students/:id  (ADMIN)
const updateStudent = asyncHandler(async (req, res) => {
  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: req.body,
    include: includeRelations,
  });
  res.json({ success: true, data: student });
});

// DELETE /api/students/:id  (ADMIN)
const deleteStudent = asyncHandler(async (req, res) => {
  await prisma.student.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = {
  listStudents,
  getMyProfile,
  updateMyProfile,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
