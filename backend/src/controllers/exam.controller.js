const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination, buildMeta } = require("../utils/pagination");

const examInclude = {
  subject: { select: { id: true, name: true, code: true } },
  _count: { select: { results: true } },
};

// ---------- Exams ----------

// GET /api/exams?subjectId=
const listExams = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const where = {};
  if (req.query.subjectId) where.subjectId = Number(req.query.subjectId);

  const [items, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { examDate: "desc" },
      include: examInclude,
    }),
    prisma.exam.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: buildMeta(pagination, total) });
});

// GET /api/exams/:id
const getExam = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.params.id }, include: examInclude });
  if (!exam) throw ApiError.notFound("Exam not found");
  res.json({ success: true, data: exam });
});

// POST /api/exams  (ADMIN, TEACHER)
const createExam = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.create({ data: req.body, include: examInclude });
  res.status(201).json({ success: true, data: exam });
});

// PATCH /api/exams/:id  (ADMIN, TEACHER)
const updateExam = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.update({
    where: { id: req.params.id },
    data: req.body,
    include: examInclude,
  });
  res.json({ success: true, data: exam });
});

// DELETE /api/exams/:id  (ADMIN)
const deleteExam = asyncHandler(async (req, res) => {
  await prisma.exam.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ---------- Exam Results ----------

const resultInclude = {
  student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
  exam: { select: { id: true, name: true, totalMarks: true, passingMarks: true } },
};

// GET /api/exams/:examId/results  (ADMIN, TEACHER)
const listExamResults = asyncHandler(async (req, res) => {
  const results = await prisma.examResult.findMany({
    where: { examId: req.params.examId },
    orderBy: { marksObtained: "desc" },
    include: resultInclude,
  });
  res.json({ success: true, data: results });
});

// GET /api/exams/results/me  (STUDENT) — all of the student's own results
const listMyResults = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
  if (!student) throw ApiError.notFound("No student profile is linked to this account");

  const results = await prisma.examResult.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
    include: resultInclude,
  });
  res.json({ success: true, data: results });
});

// POST /api/exams/:examId/results  (ADMIN, TEACHER)
const createExamResult = asyncHandler(async (req, res) => {
  const result = await prisma.examResult.create({
    data: { ...req.body, examId: req.params.examId },
    include: resultInclude,
  });
  res.status(201).json({ success: true, data: result });
});

// PATCH /api/exams/:examId/results/:resultId  (ADMIN, TEACHER)
const updateExamResult = asyncHandler(async (req, res) => {
  const result = await prisma.examResult.update({
    where: { id: req.params.resultId },
    data: req.body,
    include: resultInclude,
  });
  res.json({ success: true, data: result });
});

// DELETE /api/exams/:examId/results/:resultId  (ADMIN, TEACHER)
const deleteExamResult = asyncHandler(async (req, res) => {
  await prisma.examResult.delete({ where: { id: req.params.resultId } });
  res.status(204).send();
});

module.exports = {
  listExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  listExamResults,
  listMyResults,
  createExamResult,
  updateExamResult,
  deleteExamResult,
};
