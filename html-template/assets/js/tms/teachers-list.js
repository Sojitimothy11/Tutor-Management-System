(function () {
  const tbody = document.getElementById("teachersTableBody");
  const isAdmin = TMS_CURRENT_USER.role === "ADMIN";

  async function load() {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';
    try {
      const res = await TMS.apiFetch("/teachers?limit=100");
      render(res.data);
    } catch (err) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center text-danger">' +
        TMS.escapeHtml(TMS.errorMessage(err)) +
        "</td></tr>";
    }
  }

  function render(teachers) {
    if (!teachers.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No teachers yet.</td></tr>';
      return;
    }
    tbody.innerHTML = teachers
      .map((t) => {
        const actions = isAdmin
          ? '<div class="actions">' +
            '<a href="edit-teacher.html?id=' +
            t.id +
            '" class="btn btn-sm bg-success-light mr-2"><i class="fas fa-pen"></i></a>' +
            '<a href="#" class="btn btn-sm bg-danger-light" data-delete-id="' +
            t.id +
            '"><i class="fas fa-trash"></i></a>' +
            "</div>"
          : "";
        return (
          "<tr>" +
          "<td>" + TMS.escapeHtml(t.employeeId) + "</td>" +
          "<td><h2 class=\"table-avatar\"><a href=\"teacher-details.html?id=" + t.id + "\">" +
          TMS.escapeHtml(t.firstName + " " + t.lastName) + "</a></h2></td>" +
          "<td>" + TMS.escapeHtml(t.gender || "-") + "</td>" +
          "<td>" + (t.department ? TMS.escapeHtml(t.department.name) : "-") + "</td>" +
          "<td>" + TMS.escapeHtml(t.qualification || "-") + "</td>" +
          "<td>" + TMS.escapeHtml(t.phone || "-") + "</td>" +
          "<td>" + TMS.escapeHtml(t.address || "-") + "</td>" +
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
    if (!confirm("Delete this teacher? This cannot be undone.")) return;
    try {
      await TMS.apiFetch("/teachers/" + btn.dataset.deleteId, { method: "DELETE" });
      load();
    } catch (err) {
      TMS.showAlert("teachersAlert", TMS.errorMessage(err));
    }
  });

  load();
})();
