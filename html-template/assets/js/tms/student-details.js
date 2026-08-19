(function () {
  const id = TMS.qs("id");

  function set(fieldId, value) {
    const el = document.getElementById(fieldId);
    if (el) el.textContent = value === null || value === undefined || value === "" ? "-" : value;
  }

  async function load() {
    try {
      const path = id ? "/students/" + id : "/students/me";
      const res = await TMS.apiFetch(path);
      const s = res.data;
      set("sd-name", s.firstName + " " + s.lastName);
      set("sd-admissionNo", s.admissionNo);
      set("sd-department", s.department ? s.department.name : "-");
      set("sd-phone", s.phone);
      set("sd-gender", s.gender);
      set("sd-dob", TMS.formatDate(s.dob));
      set("sd-status", s.status);
      set("sd-guardianName", s.guardianName);
      set("sd-guardianPhone", s.guardianPhone);
      set("sd-admissionDate", TMS.formatDate(s.admissionDate));
      set("sd-address", s.address);
    } catch (err) {
      TMS.showAlert("studentDetailsAlert", TMS.errorMessage(err));
    }
  }

  load();
})();
