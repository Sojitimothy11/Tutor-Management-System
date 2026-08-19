const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken } = require("../utils/token");
const prisma = require("../lib/prisma");

/**
 * Requires a valid `Authorization: Bearer <token>` header. Attaches the
 * authenticated user (minus password) to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing or invalid Authorization header");
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user) {
    throw ApiError.unauthorized("User belonging to this token no longer exists");
  }

  const { password, ...safeUser } = user;
  req.user = safeUser;
  next();
});

/**
 * Restricts a route to one or more roles. Must run after `protect`.
 * Usage: router.post('/', protect, authorize('ADMIN'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden(`Role '${req.user.role}' is not permitted to perform this action`);
  }
  next();
};

module.exports = { protect, authorize };
