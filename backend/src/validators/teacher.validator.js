const { z } = require("zod");

const idNumber = z.coerce.number().int().positive();

const createTeacherSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  qualification: z.string().trim().optional(),
  joiningDate: z.coerce.date().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  departmentId: idNumber.optional(),
  userId: idNumber.optional(),
});

const updateTeacherSchema = createTeacherSchema.partial();

const updateOwnTeacherSchema = z.object({
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  qualification: z.string().trim().optional(),
});

module.exports = { createTeacherSchema, updateTeacherSchema, updateOwnTeacherSchema };
