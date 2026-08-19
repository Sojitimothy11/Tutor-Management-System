(function () {
  const form = document.getElementById("subjectForm");
  const submitBtn = document.getElementById("subjectSubmit");
  const departmentSelect = document.getElementById("departmentId");
  const teacherSelect = document.getElementById("teacherId");
  const id = TMS.qs("id");

  async function loadOptions() {
    try {
      const [depts, teachers] = await Promise.all([
        TMS.apiFetch("/departments?limit=100"),
        TMS.apiFetch("/teachers?limit=100"),
      ]);
      depts.data.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = d.name;
        departmentSelect.appendChild(opt);
      });
      teachers.data.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.firstName + " " + t.lastName;
        teacherSelect.appendChild(opt);
      });
    } catch (err) {
      TMS.showAlert("subjectFormAlert", TMS.errorMessage(err));
    }
  }

  async function prefill() {
    if (!id) return;
    try {
      const res = await TMS.apiFetch("/subjects/" + id);
      document.getElementById("name").value = res.data.name;
      document.getElementById("code").value = res.data.code;
      if (res.data.department) departmentSelect.value = res.data.department.id;
      if (res.data.teacher) teacherSelect.value = res.data.teacher.id;
    } catch (err) {
      TMS.showAlert("subjectFormAlert", TMS.errorMessage(err));
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("subjectFormAlert");

    const payload = {
      name: document.getElementById("name").value.trim(),
      code: document.getElementById("code").value.trim(),
    };
    if (departmentSelect.value) payload.departmentId = Number(departmentSelect.value);
    if (teacherSelect.value) payload.teacherId = Number(teacherSelect.value);

    submitBtn.disabled = true;
    try {
      if (id) {
        await TMS.apiFetch("/subjects/" + id, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await TMS.apiFetch("/subjects", { method: "POST", body: JSON.stringify(payload) });
      }
      window.location.href = "subjects.html";
    } catch (err) {
      TMS.showAlert("subjectFormAlert", TMS.errorMessage(err));
      submitBtn.disabled = false;
    }
  });

  loadOptions().then(prefill);
})();
