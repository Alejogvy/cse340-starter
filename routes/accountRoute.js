const express = require("express");
const router = express.Router();
const Util = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');
const invController = require("../controllers/invController");
const invValidation = require("../utilities/inventory-validation");

// GET route for the classification form
router.get('/add-classification', invController.showAddClassificationForm);

// POST route to add classification with validation
router.post('/add-classification', invValidation.checkClassification, invController.addClassification);

// Deliver Login View
router.get("/login", accountController.buildLogin);

// Deliver Registration View
router.get("/register", Util.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  Util.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post("/login", async (req, res) => {
  const { account_email, account_password } = req.body;

  try {
    // Search for the user by email
    const user = await accountModel.checkExistingEmail(account_email);
    if (!user) {
      return res.status(400).send("Email not registered");
    }

    // Verify password using bcrypt
    const isMatch = await bcrypt.compare(account_password, user.account_password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    res.status(200).send("Login successful");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("An error occurred during login.");
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

module.exports = router;
