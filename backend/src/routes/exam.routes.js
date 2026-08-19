const { Router } = require("express");
const ctrl = require("../controllers/exam.controller");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const {
  createExamSchema,
  updateExamSchema,
  createExamResultSchema,
  updateExamResultSchema,
} = require("../validators/exam.validator");
const {
  idParamSchema,
  examIdParamSchema,
  examResultParamsSchema,
} = require("../validators/common.validator");

const router = Router();

router.use(protect);

// Student's own results — registered before the ":examId/results" shape
// below so "results" is never mistaken for an :examId value.
router.get("/results/me", authorize("STUDENT"), ctrl.listMyResults);

router.get("/", ctrl.listExams);
router.get("/:id", validate(idParamSchema, "params"), ctrl.getExam);
router.post("/", authorize("ADMIN", "TEACHER"), validate(createExamSchema), ctrl.createExam);
router.patch(
  "/:id",
  authorize("ADMIN", "TEACHER"),
  validate(idParamSchema, "params"),
  validate(updateExamSchema),
  ctrl.updateExam
);
router.delete("/:id", authorize("ADMIN"), validate(idParamSchema, "params"), ctrl.deleteExam);

router.get(
  "/:examId/results",
  authorize("ADMIN", "TEACHER"),
  validate(examIdParamSchema, "params"),
  ctrl.listExamResults
);
router.post(
  "/:examId/results",
  authorize("ADMIN", "TEACHER"),
  validate(examIdParamSchema, "params"),
  validate(createExamResultSchema),
  ctrl.createExamResult
);
router.patch(
  "/:examId/results/:resultId",
  authorize("ADMIN", "TEACHER"),
  validate(examResultParamsSchema, "params"),
  validate(updateExamResultSchema),
  ctrl.updateExamResult
);
router.delete(
  "/:examId/results/:resultId",
  authorize("ADMIN", "TEACHER"),
  validate(examResultParamsSchema, "params"),
  ctrl.deleteExamResult
);

module.exports = router;
