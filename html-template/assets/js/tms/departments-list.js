(function () {
  const tbody = document.getElementById("departmentsTableBody");
  const canManage = TMS_CURRENT_USER.role === "ADMIN";

  async function load() {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    try {
      const res = await TMS.apiFetch("/departments?limit=100");
      render(res.data);
    } catch (err) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-danger">' +
        TMS.escapeHtml(TMS.errorMessage(err)) +
        "</td></tr>";
    }
  }

  function render(departments) {
    if (!departments.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No departments yet.</td></tr>';
      return;
    }
    tbody.innerHTML = departments
      .map((d) => {
        const actions = canManage
          ? '<div class="actions">' +
            '<a href="edit-department.html?id=' +
            d.id +
            '" class="btn btn-sm bg-success-light mr-2"><i class="fas fa-pen"></i></a>' +
            '<a href="#" class="btn btn-sm bg-danger-light" data-delete-id="' +
            d.id +
            '"><i class="fas fa-trash"></i></a>' +
            "</div>"
          : "";
        return (
          "<tr>" +
          "<td>" +
          d.id +
          "</td>" +
          "<td><h2><a href=\"javascript:void(0);\">" +
          TMS.escapeHtml(d.name) +
          "</a></h2></td>" +
          "<td>" +
          TMS.escapeHtml(d.description || "-") +
          "</td>" +
          "<td>" +
          (d._count ? d._count.students : 0) +
          "</td>" +
          "<td>" +
          (d._count ? d._count.subjects : 0) +
          "</td>" +
          '<td class="text-right">' +
          actions +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  tbody.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-delete-id]");
    if (!btn) return;
    e.preventDefault();
    if (!confirm("Delete this department? This cannot be undone.")) return;
    try {
      await TMS.apiFetch("/departments/" + btn.dataset.deleteId, { method: "DELETE" });
      load();
    } catch (err) {
      TMS.showAlert("departmentsAlert", TMS.errorMessage(err));
    }
  });

  load();
})();
