const { z } = require("zod");

// Validates an :id route param and coerces it to a number.
const idParamSchema = z.object({
  id: z.coerce.number().int().positive("id must be a positive integer"),
});

// Validates a nested :examId route param.
const examIdParamSchema = z.object({
  examId: z.coerce.number().int().positive("examId must be a positive integer"),
});

// Validates nested :examId/:resultId route params together.
const examResultParamsSchema = z.object({
  examId: z.coerce.number().int().positive("examId must be a positive integer"),
  resultId: z.coerce.number().int().positive("resultId must be a positive integer"),
});

module.exports = { idParamSchema, examIdParamSchema, examResultParamsSchema };
