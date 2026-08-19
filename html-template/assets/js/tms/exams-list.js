(function () {
  const tbody = document.getElementById("examsTableBody");
  const canManage = TMS_CURRENT_USER.role === "ADMIN" || TMS_CURRENT_USER.role === "TEACHER";
  const isAdmin = TMS_CURRENT_USER.role === "ADMIN";

  async function load() {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    try {
      const res = await TMS.apiFetch("/exams?limit=100");
      render(res.data);
    } catch (err) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-danger">' +
        TMS.escapeHtml(TMS.errorMessage(err)) +
        "</td></tr>";
    }
  }

  function render(exams) {
    if (!exams.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No exams yet.</td></tr>';
      return;
    }
    tbody.innerHTML = exams
      .map((ex) => {
        let actions = "";
        if (canManage) {
          actions += '<a href="edit-exam.html?id=' + ex.id + '" class="btn btn-sm bg-success-light mr-2"><i class="fas fa-pen"></i></a>';
        }
        if (isAdmin) {
          actions += '<a href="#" class="btn btn-sm bg-danger-light" data-delete-id="' + ex.id + '"><i class="fas fa-trash"></i></a>';
        }
        return (
          "<tr>" +
          "<td><h2><a href=\"javascript:void(0);\">" + TMS.escapeHtml(ex.name) + "</a></h2></td>" +
          "<td>" + (ex.subject ? TMS.escapeHtml(ex.subject.name + " (" + ex.subject.code + ")") : "-") + "</td>" +
          "<td>" + TMS.formatDate(ex.examDate) + "</td>" +
          "<td>" + ex.totalMarks + "</td>" +
          "<td>" + ex.passingMarks + "</td>" +
          '<td class="text-right"><div class="actions">' + actions + "</div></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  tbody.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-delete-id]");
    if (!btn) return;
    e.preventDefault();
    if (!confirm("Delete this exam? This cannot be undone.")) return;
    try {
      await TMS.apiFetch("/exams/" + btn.dataset.deleteId, { method: "DELETE" });
      load();
    } catch (err) {
      TMS.showAlert("examsAlert", TMS.errorMessage(err));
    }
  });

  load();
})();
