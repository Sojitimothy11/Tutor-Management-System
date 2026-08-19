const { Router } = require("express");
const ctrl = require("../controllers/student.controller");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const {
  createStudentSchema,
  updateStudentSchema,
  updateOwnStudentSchema,
} = require("../validators/student.validator");
const { idParamSchema } = require("../validators/common.validator");

const router = Router();

router.use(protect);

router.get("/", authorize("ADMIN", "TEACHER"), ctrl.listStudents);
router.get("/me", authorize("STUDENT"), ctrl.getMyProfile);
router.patch("/me", authorize("STUDENT"), validate(updateOwnStudentSchema), ctrl.updateMyProfile);

// Any authenticated role may hit this; the controller enforces that a
// STUDENT can only fetch their own record.
router.get("/:id", validate(idParamSchema, "params"), ctrl.getStudent);

router.post("/", authorize("ADMIN"), validate(createStudentSchema), ctrl.createStudent);
router.patch(
  "/:id",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateStudentSchema),
  ctrl.updateStudent
);
router.delete("/:id", authorize("ADMIN"), validate(idParamSchema, "params"), ctrl.deleteStudent);

module.exports = router;
