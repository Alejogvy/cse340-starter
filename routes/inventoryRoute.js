const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');
const invValidation = require('../utilities/inventory-validation');

// We use invController to access the functions
router.get("/", invController.showManagementView);

router.get("/type/:classificationId", invController.buildByClassificationId);

router.get('/detail/:invId', invController.getVehicleDetail);

router.get('/add-classification', invController.showAddClassificationForm);

router.post('/add-classification', invValidation.checkClassification, invController.addClassification);

// Path to display the form
router.get("/add-inventory", invController.showAddInventoryForm);

// Route to process the form
router.post("/add-inventory", invController.processAddInventoryForm);

// Test route to simulate a 500 error
router.get("/test-error", (req, res, next) => {
  const error = new Error("Test Error 500");
  error.status = 500;
  next(error);
});

module.exports = router;
