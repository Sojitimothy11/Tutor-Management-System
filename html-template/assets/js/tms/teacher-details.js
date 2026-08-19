(function () {
  const id = TMS.qs("id");

  function set(fieldId, value) {
    const el = document.getElementById(fieldId);
    if (el) el.textContent = value === null || value === undefined || value === "" ? "-" : value;
  }

  async function load() {
    try {
      const path = id ? "/teachers/" + id : "/teachers/me";
      const res = await TMS.apiFetch(path);
      const t = res.data;
      set("td-name", t.firstName + " " + t.lastName);
      set("td-employeeId", t.employeeId);
      set("td-department", t.department ? t.department.name : "-");
      set("td-phone", t.phone);
      set("td-gender", t.gender);
      set("td-qualification", t.qualification);
      set("td-status", t.status);
      set("td-joiningDate", TMS.formatDate(t.joiningDate));
      set("td-subjectsCount", t.subjects ? t.subjects.length : 0);
      set("td-address", t.address);
    } catch (err) {
      TMS.showAlert("teacherDetailsAlert", TMS.errorMessage(err));
    }
  }

  load();
})();
