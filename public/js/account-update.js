const updateForm = document.querySelector("#accountUpdateForm");
updateForm.addEventListener("change", function () {
  const updateBtn = document.querySelector("#updateAccountBtn");
  updateBtn.removeAttribute("disabled");
});

const changeForm = document.querySelector("#changeForm");
changeForm.addEventListener("input", function () {
  const changeBtn = document.querySelector("#changeBtn");
  changeBtn.removeAttribute("disabled");
});
