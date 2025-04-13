document.addEventListener("DOMContentLoaded", () => {
    const reviewForm = document.querySelector("form[action*='/reviews']");
    if (reviewForm) {
      reviewForm.addEventListener("submit", (e) => {
        const name = reviewForm.reviewer_name.value.trim();
        const content = reviewForm.review_content.value.trim();
        const rating = reviewForm.rating.value;
  
        let errors = [];
  
        if (!name) errors.push("Name is required.");
        if (content.length < 10) errors.push("Review must be at least 10 characters.");
        if (!rating || isNaN(rating) || rating < 1 || rating > 5)
          errors.push("Rating must be between 1 and 5.");
  
        if (errors.length > 0) {
          e.preventDefault();
          alert(errors.join("\n"));
        }
      });
    }
  });
  