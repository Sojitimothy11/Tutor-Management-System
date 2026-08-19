const { Router } = require("express");
const ctrl = require("../controllers/teacher.controller");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const {
  createTeacherSchema,
  updateTeacherSchema,
  updateOwnTeacherSchema,
} = require("../validators/teacher.validator");
const { idParamSchema } = require("../validators/common.validator");

const router = Router();

router.use(protect);

router.get("/", ctrl.listTeachers);
router.get("/me", authorize("TEACHER"), ctrl.getMyProfile);
router.patch("/me", authorize("TEACHER"), validate(updateOwnTeacherSchema), ctrl.updateMyProfile);

router.get("/:id", validate(idParamSchema, "params"), ctrl.getTeacher);

router.post("/", authorize("ADMIN"), validate(createTeacherSchema), ctrl.createTeacher);
router.patch(
  "/:id",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateTeacherSchema),
  ctrl.updateTeacher
);
router.delete("/:id", authorize("ADMIN"), validate(idParamSchema, "params"), ctrl.deleteTeacher);

module.exports = router;
