const { z } = require("zod");

const idNumber = z.coerce.number().int().positive();

const createSubjectSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  code: z.string().trim().min(1, "Code is required"),
  departmentId: idNumber.optional(),
  teacherId: idNumber.optional(),
});

const updateSubjectSchema = createSubjectSchema.partial();

module.exports = { createSubjectSchema, updateSubjectSchema };
