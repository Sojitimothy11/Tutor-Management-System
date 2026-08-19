const { Router } = require("express");
const ctrl = require("../controllers/fee.controller");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const {
  createFeeStructureSchema,
  updateFeeStructureSchema,
  createFeePaymentSchema,
  updateFeePaymentSchema,
} = require("../validators/fee.validator");
const { idParamSchema } = require("../validators/common.validator");

const feeStructures = Router();
feeStructures.use(protect);

feeStructures.get("/", ctrl.listFeeStructures);
feeStructures.get("/:id", validate(idParamSchema, "params"), ctrl.getFeeStructure);
feeStructures.post("/", authorize("ADMIN"), validate(createFeeStructureSchema), ctrl.createFeeStructure);
feeStructures.patch(
  "/:id",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateFeeStructureSchema),
  ctrl.updateFeeStructure
);
feeStructures.delete(
  "/:id",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  ctrl.deleteFeeStructure
);

const feePayments = Router();
feePayments.use(protect);

feePayments.get("/", authorize("ADMIN", "TEACHER"), ctrl.listFeePayments);
feePayments.get("/me", authorize("STUDENT"), ctrl.listMyFeePayments);
feePayments.get("/:id", validate(idParamSchema, "params"), ctrl.getFeePayment);
feePayments.post("/", authorize("ADMIN"), validate(createFeePaymentSchema), ctrl.createFeePayment);
feePayments.patch(
  "/:id",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateFeePaymentSchema),
  ctrl.updateFeePayment
);
feePayments.delete(
  "/:id",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  ctrl.deleteFeePayment
);

module.exports = { feeStructures, feePayments };
