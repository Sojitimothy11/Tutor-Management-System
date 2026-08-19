(function () {
  const form = document.getElementById("studentForm");
  const submitBtn = document.getElementById("studentSubmit");
  const departmentSelect = document.getElementById("departmentId");
  const id = TMS.qs("id");

  function toDateInputValue(iso) {
    if (!iso) return "";
    return new Date(iso).toISOString().slice(0, 10);
  }

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
      TMS.showAlert("studentFormAlert", TMS.errorMessage(err));
    }
  }

  async function prefill() {
    if (!id) return;
    try {
      const res = await TMS.apiFetch("/students/" + id);
      const s = res.data;
      document.getElementById("firstName").value = s.firstName;
      document.getElementById("lastName").value = s.lastName;
      document.getElementById("admissionNo").value = s.admissionNo;
      document.getElementById("gender").value = s.gender || "";
      document.getElementById("dob").value = toDateInputValue(s.dob);
      document.getElementById("admissionDate").value = toDateInputValue(s.admissionDate);
      document.getElementById("phone").value = s.phone || "";
      document.getElementById("status").value = s.status;
      document.getElementById("guardianName").value = s.guardianName || "";
      document.getElementById("guardianPhone").value = s.guardianPhone || "";
      document.getElementById("address").value = s.address || "";
      if (s.department) departmentSelect.value = s.department.id;
    } catch (err) {
      TMS.showAlert("studentFormAlert", TMS.errorMessage(err));
    }
  }

  function val(fieldId) {
    return document.getElementById(fieldId).value.trim();
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("studentFormAlert");

    const payload = {
      firstName: val("firstName"),
      lastName: val("lastName"),
      admissionNo: val("admissionNo"),
      phone: val("phone") || undefined,
      guardianName: val("guardianName") || undefined,
      guardianPhone: val("guardianPhone") || undefined,
      address: val("address") || undefined,
      status: val("status"),
    };
    if (val("gender")) payload.gender = val("gender");
    if (val("dob")) payload.dob = val("dob");
    if (val("admissionDate")) payload.admissionDate = val("admissionDate");
    if (departmentSelect.value) payload.departmentId = Number(departmentSelect.value);

    submitBtn.disabled = true;
    try {
      if (id) {
        await TMS.apiFetch("/students/" + id, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await TMS.apiFetch("/students", { method: "POST", body: JSON.stringify(payload) });
      }
      window.location.href = "students.html";
    } catch (err) {
      TMS.showAlert("studentFormAlert", TMS.errorMessage(err));
      submitBtn.disabled = false;
    }
  });

  loadDepartments().then(prefill);
})();
