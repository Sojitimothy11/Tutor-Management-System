(function () {
  if (TMS_CURRENT_USER.role !== "TEACHER") {
    window.location.href = TMS.dashboardForRole(TMS_CURRENT_USER.role);
    return;
  }

  function set(fieldId, value) {
    const el = document.getElementById(fieldId);
    if (el) el.textContent = value === null || value === undefined || value === "" ? "-" : value;
  }

  async function load() {
    try {
      const res = await TMS.apiFetch("/teachers/me");
      const t = res.data;
      set("teacher-dash-welcome", "Welcome " + t.firstName + "!");
      set("tdash-employeeId", t.employeeId);
      set("tdash-department", t.department ? t.department.name : "-");
      set("tdash-status", t.status);
      set("tdash-subjectsCount", t.subjects ? t.subjects.length : 0);
      renderSubjects(t.subjects || []);
    } catch (err) {
      TMS.showAlert("teacherDashAlert", TMS.errorMessage(err));
    }
  }

  function renderSubjects(subjects) {
    const tbody = document.getElementById("tdash-subjectsBody");
    if (!subjects.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">No subjects assigned yet.</td></tr>';
      return;
    }
    tbody.innerHTML = subjects
      .map(
        (s) =>
          "<tr><td>" + TMS.escapeHtml(s.name) + "</td><td>" + TMS.escapeHtml(s.code) + "</td><td>-</td></tr>"
      )
      .join("");
  }

  load();
})();
