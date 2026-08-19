(function () {
  if (TMS_CURRENT_USER.role !== "STUDENT") {
    window.location.href = TMS.dashboardForRole(TMS_CURRENT_USER.role);
    return;
  }

  function set(fieldId, value) {
    const el = document.getElementById(fieldId);
    if (el) el.textContent = value === null || value === undefined || value === "" ? "-" : value;
  }

  async function load() {
    try {
      const profile = await TMS.apiFetch("/students/me");
      const s = profile.data;
      set("student-dash-welcome", "Welcome " + s.firstName + "!");
      set("sdash-admissionNo", s.admissionNo);
      set("sdash-department", s.department ? s.department.name : "-");

      const [results, payments] = await Promise.all([
        TMS.apiFetch("/exams/results/me"),
        TMS.apiFetch("/fee-payments/me"),
      ]);

      set("sdash-resultsCount", results.data.length);
      const totalPaid = payments.data.reduce((sum, p) => sum + p.amountPaid, 0);
      set("sdash-feesPaid", totalPaid.toLocaleString(undefined, { style: "currency", currency: "USD" }));

      renderResults(results.data);
      renderPayments(payments.data);
    } catch (err) {
      TMS.showAlert("studentDashAlert", TMS.errorMessage(err));
    }
  }

  function renderResults(results) {
    const tbody = document.getElementById("sdash-resultsBody");
    if (!results.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">No exam results yet.</td></tr>';
      return;
    }
    tbody.innerHTML = results
      .map(
        (r) =>
          "<tr><td>" +
          TMS.escapeHtml(r.exam.name) +
          "</td><td>" +
          r.marksObtained +
          " / " +
          r.exam.totalMarks +
          "</td><td>" +
          TMS.escapeHtml(r.grade || "-") +
          "</td></tr>"
      )
      .join("");
  }

  function renderPayments(payments) {
    const tbody = document.getElementById("sdash-paymentsBody");
    if (!payments.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">No fee payments yet.</td></tr>';
      return;
    }
    tbody.innerHTML = payments
      .map(
        (p) =>
          "<tr><td>" +
          TMS.escapeHtml(p.feeStructure.name) +
          "</td><td>" +
          p.amountPaid +
          "</td><td>" +
          TMS.escapeHtml(p.status) +
          "</td></tr>"
      )
      .join("");
  }

  load();
})();
