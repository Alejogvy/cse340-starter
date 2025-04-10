const { body, validationResult } = require("express-validator");

/********************************
 * Validation for classification
 ****************************** */
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

/*************************
 * Rules for new vehicle
 ********************** */
const newInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty().withMessage("Make is required."),
    body("inv_model")
      .trim()
      .notEmpty().withMessage("Model is required."),
    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: 2100 }).withMessage("Enter a valid year."),
    body("inv_description")
      .trim()
      .notEmpty().withMessage("Description is required."),
    body("inv_image")
      .trim()
      .notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price")
      .trim()
      .isFloat({ min: 0 }).withMessage("Enter a valid price."),
    body("inv_miles")
      .trim()
      .isInt({ min: 0 }).withMessage("Miles must be a positive number."),
    body("inv_color")
      .trim()
      .notEmpty().withMessage("Color is required."),
    body("classification_id")
      .notEmpty().withMessage("Please select a classification.")
  ];
};

/********************************
 * Middleware for adding vehicle
 ***************************** */
const checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await require("./index").getNav();
    const classificationSelect = await require("../models/inventory-model").buildClassificationList(classification_id);

    req.flash("error", errors.array().map(err => err.msg).join(" "));

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    });
  }

  next();
};

/********************************
 * Middleware for vehicle update
 ***************************** */
const checkUpdateData = async (req, res, next) => {
  const { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await require("./index").getNav();
    const classificationSelect = await require("../models/inventory-model").buildClassificationList(classification_id);

    req.flash("error", errors.array().map(err => err.msg).join(" "));

    return res.render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }

  next();
};

module.exports = {
  checkClassification,
  newInventoryRules,
  checkInventoryData,
  checkUpdateData
};
