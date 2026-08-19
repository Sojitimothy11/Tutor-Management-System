(function () {
  const tbody = document.getElementById("feePaymentsTableBody");
  const isAdmin = TMS_CURRENT_USER.role === "ADMIN";
  const isStaff = isAdmin || TMS_CURRENT_USER.role === "TEACHER";

  const statusBadge = {
    PAID: "badge-success",
    PARTIAL: "badge-warning",
    PENDING: "badge-danger",
  };

  async function load() {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    try {
      const res = await TMS.apiFetch(isStaff ? "/fee-payments?limit=100" : "/fee-payments/me");
      render(res.data);
    } catch (err) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center text-danger">' +
        TMS.escapeHtml(TMS.errorMessage(err)) +
        "</td></tr>";
    }
  }

  function render(payments) {
    if (!payments.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No fee payments yet.</td></tr>';
      return;
    }
    tbody.innerHTML = payments
      .map((p) => {
        const badge = '<span class="badge ' + (statusBadge[p.status] || "badge-secondary") + '">' + p.status + "</span>";
        return (
          "<tr>" +
          "<td>" + p.id + "</td>" +
          "<td><h2 class=\"table-avatar\"><a href=\"javascript:void(0);\">" +
          TMS.escapeHtml(p.student.firstName + " " + p.student.lastName) + "</a></h2></td>" +
          "<td>" + TMS.escapeHtml(p.feeStructure.name) + "</td>" +
          "<td>" + p.amountPaid + "</td>" +
          "<td>" + TMS.formatDate(p.paymentDate) + "</td>" +
          "<td>" + TMS.escapeHtml(p.paymentMethod || "-") + "</td>" +
          '<td class="text-right">' + badge + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  load();
})();
