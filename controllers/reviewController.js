const reviewModel = require("../models/review-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/"); 

async function showReviewForm(req, res) {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getInventoryById(inv_id);
    const reviews = await reviewModel.getReviewsByVehicleId(inv_id);
    const nav = await utilities.getNav();
    res.render("inventory/review", {
      title: `Reviews for ${vehicle.inv_make} ${vehicle.inv_model}`,
      vehicle,
      reviews,
      nav,
      errors: null
    });
}

async function submitReview(req, res) {
    const { inv_id, reviewer_name, review_content, rating } = req.body;
    try {
      await reviewModel.addReview(inv_id, reviewer_name, review_content, parseInt(rating));
      res.redirect(`/inv/${inv_id}/reviews`);
    } catch (err) {
      const vehicle = await invModel.getInventoryById(inv_id);
      const reviews = await reviewModel.getReviewsByVehicleId(inv_id);
      const nav = await utilities.getNav();
      res.status(500).render("inventory/review", {
        title: "Error submitting review",
        vehicle,
        reviews,
        nav,
        errors: [err.message]
      });
    }
}  

module.exports = {
  showReviewForm,
  submitReview
};
