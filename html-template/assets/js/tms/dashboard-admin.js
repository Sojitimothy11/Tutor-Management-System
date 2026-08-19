(function () {
  if (TMS_CURRENT_USER.role !== "ADMIN") {
    window.location.href = TMS.dashboardForRole(TMS_CURRENT_USER.role);
    return;
  }

  function set(fieldId, value) {
    const el = document.getElementById(fieldId);
    if (el) el.textContent = value;
  }

  async function load() {
    try {
      const [students, teachers, departments, payments] = await Promise.all([
        TMS.apiFetch("/students?limit=1"),
        TMS.apiFetch("/teachers?limit=1"),
        TMS.apiFetch("/departments?limit=1"),
        TMS.apiFetch("/fee-payments?limit=100"),
      ]);
      set("dash-students-count", students.meta.total);
      set("dash-teachers-count", teachers.meta.total);
      set("dash-departments-count", departments.meta.total);

      const revenue = payments.data.reduce((sum, p) => sum + p.amountPaid, 0);
      set("dash-revenue", revenue.toLocaleString(undefined, { style: "currency", currency: "USD" }));
    } catch (err) {
      TMS.showAlert("dashboardAlert", TMS.errorMessage(err));
    }
  }

  load();
})();
