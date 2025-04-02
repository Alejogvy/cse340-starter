const { body, validationResult } = require("express-validator");
const checkClassification = [
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required.")
    .matches(/^[a-zA-Z0-9\s]+$/).withMessage("Only letters, numbers, and spaces are allowed."),
  
  (req, res, next) => {
    console.log("✅ checkClassification middleware executed");  
    console.log("🔹 Data received:", req.body);  

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation errors:", errors.array());  
      req.flash("error", errors.array().map(err => err.msg).join(" "));
      return res.redirect("/inv/add-classification");
    }
    
    next();
  }
];

module.exports = { checkClassification };
