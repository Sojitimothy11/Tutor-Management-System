(function () {
  const tbody = document.getElementById("studentsTableBody");
  const isAdmin = TMS_CURRENT_USER.role === "ADMIN";
  const isStaff = isAdmin || TMS_CURRENT_USER.role === "TEACHER";

  async function load() {
    if (!isStaff) {
      // A STUDENT hitting this page directly has no "list" permission —
      // send them straight to their own record instead of a 403 wall.
      window.location.href = "student-dashboard.html";
      return;
    }
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';
    try {
      const res = await TMS.apiFetch("/students?limit=100");
      render(res.data);
    } catch (err) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center text-danger">' +
        TMS.escapeHtml(TMS.errorMessage(err)) +
        "</td></tr>";
    }
  }

  function render(students) {
    if (!students.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No students yet.</td></tr>';
      return;
    }
    tbody.innerHTML = students
      .map((s) => {
        const actions = isAdmin
          ? '<div class="actions">' +
            '<a href="edit-student.html?id=' +
            s.id +
            '" class="btn btn-sm bg-success-light mr-2"><i class="fas fa-pen"></i></a>' +
            '<a href="#" class="btn btn-sm bg-danger-light" data-delete-id="' +
            s.id +
            '"><i class="fas fa-trash"></i></a>' +
            "</div>"
          : "";
        return (
          "<tr>" +
          "<td>" + TMS.escapeHtml(s.admissionNo) + "</td>" +
          "<td><h2 class=\"table-avatar\"><a href=\"student-details.html?id=" + s.id + "\">" +
          TMS.escapeHtml(s.firstName + " " + s.lastName) + "</a></h2></td>" +
          "<td>" + (s.department ? TMS.escapeHtml(s.department.name) : "-") + "</td>" +
          "<td>" + TMS.formatDate(s.dob) + "</td>" +
          "<td>" + TMS.escapeHtml(s.guardianName || "-") + "</td>" +
          "<td>" + TMS.escapeHtml(s.phone || "-") + "</td>" +
          "<td>" + TMS.escapeHtml(s.address || "-") + "</td>" +
          '<td class="text-right">' + actions + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  tbody.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-delete-id]");
    if (!btn) return;
    e.preventDefault();
    if (!confirm("Delete this student? This cannot be undone.")) return;
    try {
      await TMS.apiFetch("/students/" + btn.dataset.deleteId, { method: "DELETE" });
      load();
    } catch (err) {
      TMS.showAlert("studentsAlert", TMS.errorMessage(err));
    }
  });

  load();
})();
