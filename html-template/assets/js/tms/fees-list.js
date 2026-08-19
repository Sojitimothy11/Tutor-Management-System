(function () {
  const tbody = document.getElementById("feesTableBody");
  const isAdmin = TMS_CURRENT_USER.role === "ADMIN";

  async function load() {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    try {
      const res = await TMS.apiFetch("/fees?limit=100");
      render(res.data);
    } catch (err) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center text-danger">' +
        TMS.escapeHtml(TMS.errorMessage(err)) +
        "</td></tr>";
    }
  }

  function render(fees) {
    if (!fees.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No fee structures yet.</td></tr>';
      return;
    }
    tbody.innerHTML = fees
      .map((f) => {
        const actions = isAdmin
          ? '<div class="actions">' +
            '<a href="edit-fees.html?id=' +
            f.id +
            '" class="btn btn-sm bg-success-light mr-2"><i class="fas fa-pen"></i></a>' +
            '<a href="#" class="btn btn-sm bg-danger-light" data-delete-id="' +
            f.id +
            '"><i class="fas fa-trash"></i></a>' +
            "</div>"
          : "";
        return (
          "<tr>" +
          "<td>" + f.id + "</td>" +
          "<td><h2><a href=\"javascript:void(0);\">" + TMS.escapeHtml(f.name) + "</a></h2></td>" +
          "<td>" + (f.department ? TMS.escapeHtml(f.department.name) : "-") + "</td>" +
          "<td>" + f.amount + "</td>" +
          "<td>" + TMS.escapeHtml(f.academicYear) + "</td>" +
          "<td>" + TMS.formatDate(f.dueDate) + "</td>" +
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
    if (!confirm("Delete this fee structure? This cannot be undone.")) return;
    try {
      await TMS.apiFetch("/fees/" + btn.dataset.deleteId, { method: "DELETE" });
      load();
    } catch (err) {
      TMS.showAlert("feesAlert", TMS.errorMessage(err));
    }
  });

  load();
})();
