const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination, buildMeta } = require("../utils/pagination");

const includeRelations = {
  department: { select: { id: true, name: true } },
  teacher: { select: { id: true, firstName: true, lastName: true } },
};

// GET /api/subjects?departmentId=&teacherId=
const listSubjects = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const where = {};
  if (req.query.departmentId) where.departmentId = Number(req.query.departmentId);
  if (req.query.teacherId) where.teacherId = Number(req.query.teacherId);

  const [items, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { name: "asc" },
      include: includeRelations,
    }),
    prisma.subject.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: buildMeta(pagination, total) });
});

// GET /api/subjects/:id
const getSubject = asyncHandler(async (req, res) => {
  const subject = await prisma.subject.findUnique({
    where: { id: req.params.id },
    include: includeRelations,
  });
  if (!subject) throw ApiError.notFound("Subject not found");
  res.json({ success: true, data: subject });
});

// POST /api/subjects
const createSubject = asyncHandler(async (req, res) => {
  const subject = await prisma.subject.create({ data: req.body, include: includeRelations });
  res.status(201).json({ success: true, data: subject });
});

// PATCH /api/subjects/:id
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await prisma.subject.update({
    where: { id: req.params.id },
    data: req.body,
    include: includeRelations,
  });
  res.json({ success: true, data: subject });
});

// DELETE /api/subjects/:id
const deleteSubject = asyncHandler(async (req, res) => {
  await prisma.subject.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = { listSubjects, getSubject, createSubject, updateSubject, deleteSubject };
