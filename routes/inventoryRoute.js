const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');
const invVal = require("../utilities/inventory-validation");
const reviewController = require("../controllers/reviewController");
const { reviewRules, checkReviewData } = require("../utilities/review-validation");
const utilities = require("../utilities");
const { requireAdminOrEmployee } = require("../utilities/auth");

router.get("/", invController.showManagementView);
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get('/detail/:invId', invController.getVehicleDetail);

// Classification
router.get('/add-classification', invController.showAddClassificationForm);
router.post('/add-classification', invVal.checkClassification, invController.addClassification);

// New inventory
router.get("/add-inventory", requireAdminOrEmployee, invController.showAddInventoryForm);
router.post("/add-inventory", requireAdminOrEmployee, invVal.newInventoryRules(), invVal.checkInventoryData, invController.processAddInventoryForm);

// Edition
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));
router.post("/update", invVal.newInventoryRules(), invVal.checkUpdateData, invController.updateInventory);

// JSON for AJAX
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Show delete confirmation view
router.get("/delete/:inv_id", invController.buildDeleteInventoryView);

// Process deletion
router.post("/delete", invController.deleteInventoryItem);

// Show review
router.get("/:inv_id/reviews", reviewController.showReviewForm);
router.post("/:inv_id/reviews", reviewRules(), checkReviewData, reviewController.submitReview);

// Test Error
router.get("/test-error", (req, res, next) => {
  const error = new Error("Test Error 500");
  error.status = 500;
  next(error);
});

module.exports = router;
