const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination, buildMeta } = require("../utils/pagination");

// ---------- Fee Structures ----------

// GET /api/fees?departmentId=&academicYear=
const listFeeStructures = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const where = {};
  if (req.query.departmentId) where.departmentId = Number(req.query.departmentId);
  if (req.query.academicYear) where.academicYear = req.query.academicYear;

  const [items, total] = await Promise.all([
    prisma.feeStructure.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
      include: { department: { select: { id: true, name: true } } },
    }),
    prisma.feeStructure.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: buildMeta(pagination, total) });
});

// GET /api/fees/:id
const getFeeStructure = asyncHandler(async (req, res) => {
  const fee = await prisma.feeStructure.findUnique({
    where: { id: req.params.id },
    include: { department: { select: { id: true, name: true } } },
  });
  if (!fee) throw ApiError.notFound("Fee structure not found");
  res.json({ success: true, data: fee });
});

// POST /api/fees  (ADMIN)
const createFeeStructure = asyncHandler(async (req, res) => {
  const fee = await prisma.feeStructure.create({ data: req.body });
  res.status(201).json({ success: true, data: fee });
});

// PATCH /api/fees/:id  (ADMIN)
const updateFeeStructure = asyncHandler(async (req, res) => {
  const fee = await prisma.feeStructure.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: fee });
});

// DELETE /api/fees/:id  (ADMIN)
const deleteFeeStructure = asyncHandler(async (req, res) => {
  await prisma.feeStructure.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ---------- Fee Payments (collections) ----------

const paymentInclude = {
  student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
  feeStructure: { select: { id: true, name: true, amount: true, academicYear: true } },
};

// GET /api/fee-payments?studentId=&status=  (ADMIN, TEACHER)
const listFeePayments = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const where = {};
  if (req.query.studentId) where.studentId = Number(req.query.studentId);
  if (req.query.feeStructureId) where.feeStructureId = Number(req.query.feeStructureId);
  if (req.query.status) where.status = req.query.status;

  const [items, total] = await Promise.all([
    prisma.feePayment.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { paymentDate: "desc" },
      include: paymentInclude,
    }),
    prisma.feePayment.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: buildMeta(pagination, total) });
});

// GET /api/fee-payments/me  (STUDENT)
const listMyFeePayments = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
  if (!student) throw ApiError.notFound("No student profile is linked to this account");

  const payments = await prisma.feePayment.findMany({
    where: { studentId: student.id },
    orderBy: { paymentDate: "desc" },
    include: paymentInclude,
  });
  res.json({ success: true, data: payments });
});

// GET /api/fee-payments/:id  (ADMIN, TEACHER: any. STUDENT: only their own)
const getFeePayment = asyncHandler(async (req, res) => {
  const payment = await prisma.feePayment.findUnique({
    where: { id: req.params.id },
    include: paymentInclude,
  });
  if (!payment) throw ApiError.notFound("Fee payment not found");

  if (req.user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student || student.id !== payment.studentId) {
      throw ApiError.forbidden("You can only view your own fee payments");
    }
  }

  res.json({ success: true, data: payment });
});

// POST /api/fee-payments  (ADMIN)
const createFeePayment = asyncHandler(async (req, res) => {
  const payment = await prisma.feePayment.create({ data: req.body, include: paymentInclude });
  res.status(201).json({ success: true, data: payment });
});

// PATCH /api/fee-payments/:id  (ADMIN)
const updateFeePayment = asyncHandler(async (req, res) => {
  const payment = await prisma.feePayment.update({
    where: { id: req.params.id },
    data: req.body,
    include: paymentInclude,
  });
  res.json({ success: true, data: payment });
});

// DELETE /api/fee-payments/:id  (ADMIN)
const deleteFeePayment = asyncHandler(async (req, res) => {
  await prisma.feePayment.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = {
  listFeeStructures,
  getFeeStructure,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  listFeePayments,
  listMyFeePayments,
  getFeePayment,
  createFeePayment,
  updateFeePayment,
  deleteFeePayment,
};
