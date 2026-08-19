const { z } = require("zod");

const idNumber = z.coerce.number().int().positive();

const createFeeStructureSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  academicYear: z.string().trim().min(1, "Academic year is required"),
  dueDate: z.coerce.date().optional(),
  departmentId: idNumber.optional(),
});

const updateFeeStructureSchema = createFeeStructureSchema.partial();

const createFeePaymentSchema = z.object({
  studentId: idNumber,
  feeStructureId: idNumber,
  amountPaid: z.coerce.number().positive("Amount paid must be greater than 0"),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.string().trim().optional(),
  status: z.enum(["PENDING", "PARTIAL", "PAID"]).optional(),
});

const updateFeePaymentSchema = z.object({
  amountPaid: z.coerce.number().positive().optional(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.string().trim().optional(),
  status: z.enum(["PENDING", "PARTIAL", "PAID"]).optional(),
});

module.exports = {
  createFeeStructureSchema,
  updateFeeStructureSchema,
  createFeePaymentSchema,
  updateFeePaymentSchema,
};
