const { z } = require("zod");

const idNumber = z.coerce.number().int().positive();

const createExamSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  subjectId: idNumber,
  examDate: z.coerce.date(),
  totalMarks: z.coerce.number().positive("Total marks must be greater than 0"),
  passingMarks: z.coerce.number().nonnegative("Passing marks cannot be negative"),
});

const updateExamSchema = createExamSchema.partial();

const createExamResultSchema = z.object({
  studentId: idNumber,
  marksObtained: z.coerce.number().nonnegative("Marks obtained cannot be negative"),
  grade: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
});

const updateExamResultSchema = createExamResultSchema.partial().omit({ studentId: true });

module.exports = {
  createExamSchema,
  updateExamSchema,
  createExamResultSchema,
  updateExamResultSchema,
};
