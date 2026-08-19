const { Router } = require("express");
const ctrl = require("../controllers/department.controller");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const { createDepartmentSchema, updateDepartmentSchema } = require("../validators/department.validator");
const { idParamSchema } = require("../validators/common.validator");

const router = Router();

router.use(protect);

router.get("/", ctrl.listDepartments);
router.get("/:id", validate(idParamSchema, "params"), ctrl.getDepartment);

router.post("/", authorize("ADMIN"), validate(createDepartmentSchema), ctrl.createDepartment);
router.patch(
  "/:id",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateDepartmentSchema),
  ctrl.updateDepartment
);
router.delete("/:id", authorize("ADMIN"), validate(idParamSchema, "params"), ctrl.deleteDepartment);

module.exports = router;
