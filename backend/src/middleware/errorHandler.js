const { Prisma } = require("@prisma/client");
const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Translates known Prisma error codes into sane HTTP responses instead
// of leaking a 500 with a raw Prisma stack trace.
function fromPrismaError(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const fields = (err.meta && err.meta.target) || [];
        return ApiError.conflict(`A record with this ${[].concat(fields).join(", ")} already exists`);
      }
      case "P2025":
        return ApiError.notFound("Record not found");
      case "P2003":
        return ApiError.badRequest("Invalid reference to a related record");
      default:
        return null;
    }
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return ApiError.badRequest("Invalid data sent to the database");
  }
  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const translated = fromPrismaError(err) || err;
  const statusCode = translated.statusCode || 500;
  const isOperational = translated.isOperational === true;

  if (!isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? translated.message : "Internal server error",
    details: translated.details,
  });
}

module.exports = { notFound, errorHandler };
