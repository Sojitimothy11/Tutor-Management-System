const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/token");

const SALT_ROUNDS = 10;

function toAuthResponse(user) {
  const { password, ...safeUser } = user;
  const token = signToken({ sub: user.id, role: user.role });
  return { user: safeUser, token };
}

// POST /api/auth/register — public sign-up, always creates a STUDENT account.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "STUDENT" },
  });

  res.status(201).json({ success: true, data: toAuthResponse(user) });
});

// POST /api/auth/admin/create-user — admin-only, can set any role
// (used to provision TEACHER and ADMIN accounts).
const createUserAsAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role || "STUDENT" },
  });

  res.status(201).json({ success: true, data: toAuthResponse(user) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  res.json({ success: true, data: toAuthResponse(user) });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { student: true, teacher: true },
  });
  const { password, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

// PATCH /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  res.json({ success: true, message: "Password updated successfully" });
});

module.exports = { register, createUserAsAdmin, login, getMe, changePassword };
