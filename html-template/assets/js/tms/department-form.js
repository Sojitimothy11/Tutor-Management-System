(function () {
  const form = document.getElementById("departmentForm");
  const submitBtn = document.getElementById("departmentSubmit");
  const id = TMS.qs("id");

  async function prefill() {
    if (!id) return;
    try {
      const res = await TMS.apiFetch("/departments/" + id);
      document.getElementById("name").value = res.data.name;
      document.getElementById("description").value = res.data.description || "";
    } catch (err) {
      TMS.showAlert("departmentFormAlert", TMS.errorMessage(err));
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("departmentFormAlert");

    const payload = {
      name: document.getElementById("name").value.trim(),
      description: document.getElementById("description").value.trim(),
    };

    submitBtn.disabled = true;
    try {
      if (id) {
        await TMS.apiFetch("/departments/" + id, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await TMS.apiFetch("/departments", { method: "POST", body: JSON.stringify(payload) });
      }
      window.location.href = "departments.html";
    } catch (err) {
      TMS.showAlert("departmentFormAlert", TMS.errorMessage(err));
      submitBtn.disabled = false;
    }
  });

  prefill();
})();
