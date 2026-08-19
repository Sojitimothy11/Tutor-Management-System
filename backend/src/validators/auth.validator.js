const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // Only an authenticated admin is allowed to set this to TEACHER/ADMIN
  // (enforced in the controller, not here) — public sign-up is always STUDENT.
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };
