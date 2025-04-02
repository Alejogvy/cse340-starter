const validate = require("../utilities/account-validation");
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res) {
  let nav = await utilities.getNav();
  const errors = req.flash('errors') || [];

  res.render('account/login', {
    title: 'Login',
    nav,
    errors: errors,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  const emailExists = await accountModel.checkExistingEmail(account_email);
  if (emailExists > 0) {
    req.flash('notice', 'Email already in use. Please try again.');
    return res.status(400).render('account/register', {
      title: 'Register',
      nav,
      errors: ['Email is already registered.'],
      account_firstname,
      account_lastname,
      account_email,
    });
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.redirect("/account/login");
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: ["Registration failed. Please try again."],
        account_firstname,
        account_lastname,
        account_email,
      });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    req.flash("notice", "An error occurred during registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: ["An unexpected error occurred. Please try again later."],
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount };
