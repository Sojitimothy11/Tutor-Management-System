(function () {
  const tbody = document.getElementById("subjectsTableBody");
  const canManage = TMS_CURRENT_USER.role === "ADMIN";

  async function load() {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    try {
      const res = await TMS.apiFetch("/subjects?limit=100");
      render(res.data);
    } catch (err) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-danger">' +
        TMS.escapeHtml(TMS.errorMessage(err)) +
        "</td></tr>";
    }
  }

  function render(subjects) {
    if (!subjects.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No subjects yet.</td></tr>';
      return;
    }
    tbody.innerHTML = subjects
      .map((s) => {
        const actions = canManage
          ? '<div class="actions">' +
            '<a href="edit-subject.html?id=' +
            s.id +
            '" class="btn btn-sm bg-success-light mr-2"><i class="fas fa-pen"></i></a>' +
            '<a href="#" class="btn btn-sm bg-danger-light" data-delete-id="' +
            s.id +
            '"><i class="fas fa-trash"></i></a>' +
            "</div>"
          : "";
        return (
          "<tr>" +
          "<td>" + s.id + "</td>" +
          "<td><h2><a href=\"javascript:void(0);\">" + TMS.escapeHtml(s.name) + "</a></h2></td>" +
          "<td>" + TMS.escapeHtml(s.code) + "</td>" +
          "<td>" + (s.department ? TMS.escapeHtml(s.department.name) : "-") + "</td>" +
          "<td>" + (s.teacher ? TMS.escapeHtml(s.teacher.firstName + " " + s.teacher.lastName) : "-") + "</td>" +
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
    if (!confirm("Delete this subject? This cannot be undone.")) return;
    try {
      await TMS.apiFetch("/subjects/" + btn.dataset.deleteId, { method: "DELETE" });
      load();
    } catch (err) {
      TMS.showAlert("subjectsAlert", TMS.errorMessage(err));
    }
  });

  load();
})();
