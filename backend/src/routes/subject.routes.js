const { Router } = require("express");
const ctrl = require("../controllers/subject.controller");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const { createSubjectSchema, updateSubjectSchema } = require("../validators/subject.validator");
const { idParamSchema } = require("../validators/common.validator");

const router = Router();

router.use(protect);

router.get("/", ctrl.listSubjects);
router.get("/:id", validate(idParamSchema, "params"), ctrl.getSubject);

router.post("/", authorize("ADMIN"), validate(createSubjectSchema), ctrl.createSubject);
router.patch(
  "/:id",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateSubjectSchema),
  ctrl.updateSubject
);
router.delete("/:id", authorize("ADMIN"), validate(idParamSchema, "params"), ctrl.deleteSubject);

module.exports = router;
