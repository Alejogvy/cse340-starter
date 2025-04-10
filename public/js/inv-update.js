const form = document.querySelector("#updateForm")
if (form) {
  const updateBtn = form.querySelector("button[type='submit']")
  if (updateBtn) {
    
    form.addEventListener("input", () => {
      updateBtn.removeAttribute("disabled")
    })
    form.addEventListener("change", () => {
      updateBtn.removeAttribute("disabled")
    })
  }
}
