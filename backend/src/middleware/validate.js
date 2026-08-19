const ApiError = require("../utils/ApiError");

/**
 * Validates req.body (or another part of the request) against a Zod
 * schema. On success, replaces the source with the parsed/coerced data
 * so downstream handlers get clean, typed values.
 *
 * Usage: router.post('/', validate(createStudentSchema), handler)
 */
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return next(ApiError.badRequest("Validation failed", details));
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
