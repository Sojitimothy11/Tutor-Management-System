(function () {
  const form = document.getElementById("teacherForm");
  const submitBtn = document.getElementById("teacherSubmit");
  const departmentSelect = document.getElementById("departmentId");
  const id = TMS.qs("id");
  // Only present on add-teacher.html — edit-teacher.html has no login section.
  const loginEmail = document.getElementById("loginEmail");

  function toDateInputValue(iso) {
    if (!iso) return "";
    return new Date(iso).toISOString().slice(0, 10);
  }

  function val(fieldId) {
    const el = document.getElementById(fieldId);
    return el ? el.value.trim() : "";
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
      TMS.showAlert("teacherFormAlert", TMS.errorMessage(err));
    }
  }

  async function prefill() {
    if (!id) return;
    try {
      const res = await TMS.apiFetch("/teachers/" + id);
      const t = res.data;
      document.getElementById("employeeId").value = t.employeeId;
      document.getElementById("firstName").value = t.firstName;
      document.getElementById("lastName").value = t.lastName;
      document.getElementById("gender").value = t.gender || "";
      document.getElementById("phone").value = t.phone || "";
      document.getElementById("joiningDate").value = toDateInputValue(t.joiningDate);
      document.getElementById("qualification").value = t.qualification || "";
      document.getElementById("status").value = t.status;
      document.getElementById("address").value = t.address || "";
      if (t.department) departmentSelect.value = t.department.id;
    } catch (err) {
      TMS.showAlert("teacherFormAlert", TMS.errorMessage(err));
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("teacherFormAlert");

    const payload = {
      employeeId: val("employeeId"),
      firstName: val("firstName"),
      lastName: val("lastName"),
      phone: val("phone") || undefined,
      qualification: val("qualification") || undefined,
      address: val("address") || undefined,
      status: val("status"),
    };
    if (val("gender")) payload.gender = val("gender");
    if (val("joiningDate")) payload.joiningDate = val("joiningDate");
    if (departmentSelect.value) payload.departmentId = Number(departmentSelect.value);

    submitBtn.disabled = true;
    try {
      // Optional: also provision a login account for this teacher (add-teacher.html only).
      if (loginEmail && loginEmail.value.trim()) {
        const loginPassword = val("loginPassword");
        const loginName = val("loginName") || payload.firstName + " " + payload.lastName;
        if (loginPassword.length < 6) {
          throw new Error("Login password must be at least 6 characters");
        }
        const userRes = await TMS.apiFetch("/auth/admin/create-user", {
          method: "POST",
          body: JSON.stringify({
            name: loginName,
            email: loginEmail.value.trim(),
            password: loginPassword,
            role: "TEACHER",
          }),
        });
        payload.userId = userRes.data.user.id;
      }

      if (id) {
        await TMS.apiFetch("/teachers/" + id, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await TMS.apiFetch("/teachers", { method: "POST", body: JSON.stringify(payload) });
      }
      window.location.href = "teachers.html";
    } catch (err) {
      TMS.showAlert("teacherFormAlert", TMS.errorMessage(err));
      submitBtn.disabled = false;
    }
  });

  loadDepartments().then(prefill);
})();
