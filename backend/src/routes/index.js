const { Router } = require("express");

const authRoutes = require("./auth.routes");
const departmentRoutes = require("./department.routes");
const subjectRoutes = require("./subject.routes");
const studentRoutes = require("./student.routes");
const teacherRoutes = require("./teacher.routes");
const examRoutes = require("./exam.routes");
const { feeStructures, feePayments } = require("./fee.routes");

const router = Router();

router.get("/health", (req, res) => res.json({ success: true, message: "API is healthy" }));

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/subjects", subjectRoutes);
router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/exams", examRoutes);
router.use("/fees", feeStructures);
router.use("/fee-payments", feePayments);

module.exports = router;
