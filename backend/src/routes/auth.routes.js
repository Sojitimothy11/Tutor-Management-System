const { Router } = require("express");
const ctrl = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");

const router = Router();

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login", validate(loginSchema), ctrl.login);
router.get("/me", protect, ctrl.getMe);
router.patch("/change-password", protect, validate(changePasswordSchema), ctrl.changePassword);

// Admin-only provisioning of TEACHER/ADMIN accounts.
router.post(
  "/admin/create-user",
  protect,
  authorize("ADMIN"),
  validate(registerSchema),
  ctrl.createUserAsAdmin
);

module.exports = router;
