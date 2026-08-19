const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination, buildMeta } = require("../utils/pagination");

// GET /api/departments
const listDepartments = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const [items, total] = await Promise.all([
    prisma.department.findMany({
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { name: "asc" },
      include: { _count: { select: { students: true, teachers: true, subjects: true } } },
    }),
    prisma.department.count(),
  ]);
  res.json({ success: true, data: items, meta: buildMeta(pagination, total) });
});

// GET /api/departments/:id
const getDepartment = asyncHandler(async (req, res) => {
  const department = await prisma.department.findUnique({
    where: { id: req.params.id },
    include: { subjects: true },
  });
  if (!department) throw ApiError.notFound("Department not found");
  res.json({ success: true, data: department });
});

// POST /api/departments
const createDepartment = asyncHandler(async (req, res) => {
  const department = await prisma.department.create({ data: req.body });
  res.status(201).json({ success: true, data: department });
});

// PATCH /api/departments/:id
// Note: Prisma throws P2025 for a missing record and P2002 for a unique
// clash — both are translated into proper HTTP errors by the central
// error handler, so no manual existence check is needed here.
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await prisma.department.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ success: true, data: department });
});

// DELETE /api/departments/:id
const deleteDepartment = asyncHandler(async (req, res) => {
  await prisma.department.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
