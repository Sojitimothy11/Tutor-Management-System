(function () {
  const form = document.getElementById("feeForm");
  const submitBtn = document.getElementById("feeSubmit");
  const departmentSelect = document.getElementById("departmentId");
  const id = TMS.qs("id");

  async function loadDepartments() {
    try {
      const res = await TMS.apiFetch("/departments?limit=100");
      res.data.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = d.name;
        departmentSelect.appendChild(opt);
      });
    } catch (err) {
      TMS.showAlert("feeFormAlert", TMS.errorMessage(err));
    }
  }

  async function prefill() {
    if (!id) return;
    try {
      const res = await TMS.apiFetch("/fees/" + id);
      const f = res.data;
      document.getElementById("name").value = f.name;
      document.getElementById("amount").value = f.amount;
      document.getElementById("academicYear").value = f.academicYear;
      if (f.dueDate) document.getElementById("dueDate").value = new Date(f.dueDate).toISOString().slice(0, 10);
      if (f.department) departmentSelect.value = f.department.id;
    } catch (err) {
      TMS.showAlert("feeFormAlert", TMS.errorMessage(err));
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("feeFormAlert");

    const payload = {
      name: document.getElementById("name").value.trim(),
      amount: Number(document.getElementById("amount").value),
      academicYear: document.getElementById("academicYear").value.trim(),
    };
    const dueDate = document.getElementById("dueDate").value;
    if (dueDate) payload.dueDate = dueDate;
    if (departmentSelect.value) payload.departmentId = Number(departmentSelect.value);

    submitBtn.disabled = true;
    try {
      if (id) {
        await TMS.apiFetch("/fees/" + id, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await TMS.apiFetch("/fees", { method: "POST", body: JSON.stringify(payload) });
      }
      window.location.href = "fees.html";
    } catch (err) {
      TMS.showAlert("feeFormAlert", TMS.errorMessage(err));
      submitBtn.disabled = false;
    }
  });

  loadDepartments().then(prefill);
})();
