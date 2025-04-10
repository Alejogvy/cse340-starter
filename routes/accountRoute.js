const express = require("express");
const router = express.Router();

const { handleErrors, checkLogin } = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');
const invController = require("../controllers/invController");
const invValidation = require("../utilities/inventory-validation");
const Util = require("../utilities");

/* ****************************************
 * Deliver Account Management View
 * *************************************** */
router.get(
  "/",
  Util.checkLogin,
  Util.handleErrors(accountController.buildAccountManagement)
);

// GET route for the classification form
router.get('/add-classification', invController.showAddClassificationForm);

// POST route to add classification with validation
router.post('/add-classification', invValidation.checkClassification, invController.addClassification);

// Deliver Login View
router.get("/login", accountController.buildLogin);

// Deliver Registration View
router.get("/register", handleErrors(accountController.buildRegister));

// Deliver the view to update the account
router.get("/update", Util.handleErrors(accountController.buildUpdateAccountView));

// Process account update
router.post("/update", regValidate.updateAccountRules(), regValidate.checkUpdateAccountData, Util.handleErrors(accountController.updateAccount));

// Process the password change
router.post("/updatePassword", regValidate.updatePasswordRules(), regValidate.checkUpdatePasswordData, Util.handleErrors(accountController.updatePassword));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  Util.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  Util.handleErrors(accountController.accountLogin)
);

// Process the logout request
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  req.flash("notice", "You have successfully logged out.");
  res.redirect("/");
});

// Process the account update data
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  Util.handleErrors(accountController.updateAccount)
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

module.exports = router;
