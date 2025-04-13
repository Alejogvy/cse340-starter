const { body, validationResult } = require("express-validator");

const reviewRules = () => {
  return [
    body("reviewer_name")
      .trim()
      .notEmpty()
      .withMessage("Reviewer name is required."),
    body("review_content")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Review must be at least 10 characters."),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be a number between 1 and 5.")
  ];
};

const checkReviewData = async (req, res, next) => {
  const { inv_id } = req.body;
  const { getInventoryById } = require("../models/inventory-model");
  const { getReviewsByVehicleId } = require("../models/review-model");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const vehicle = await getInventoryById(inv_id);
    const reviews = await getReviewsByVehicleId(inv_id);
    return res.render("inventory/review", {
      title: `Reviews for ${vehicle.inv_make} ${vehicle.inv_model}`,
      vehicle,
      reviews,
      errors: errors.array().map(e => e.msg),
    });
  }
  next();
};

module.exports = { reviewRules, checkReviewData };
