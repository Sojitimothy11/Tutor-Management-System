const { z } = require("zod");

const idNumber = z.coerce.number().int().positive();

const createStudentSchema = z.object({
  admissionNo: z.string().trim().min(1, "Admission number is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dob: z.coerce.date().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  admissionDate: z.coerce.date().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  departmentId: idNumber.optional(),
  // Links this profile to an existing login account (created via /auth/register or /auth/admin/create-user).
  userId: idNumber.optional(),
});

const updateStudentSchema = createStudentSchema.partial();

// Fields a STUDENT is allowed to edit on their own profile — no admissionNo,
// department, status, or account-linking changes.
const updateOwnStudentSchema = z.object({
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
});

module.exports = { createStudentSchema, updateStudentSchema, updateOwnStudentSchema };
