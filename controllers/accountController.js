const jwt = require("jsonwebtoken");
require("dotenv").config();
const validate = require("../utilities/account-validation");
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res) {
  try {
    const nav = await utilities.getNav();
    const errors = req.flash('errors') || [];
    res.render('account/login', {
      title: 'Login',
      nav,
      errors,
    });
  } catch (error) {
    console.error("Error loading login view:", error);
    res.status(500).send("Server Error");
  }
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (error) {
    console.error("Error loading registration view:", error);
    next(error);
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  try {
    const nav = await utilities.getNav();
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
      nav: await utilities.getNav(),
      errors: ["An unexpected error occurred. Please try again later."],
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    });
  }
}

/* ****************************************
 *  Process Login Request
 * *************************************** */
async function accountLogin(req, res) {
  try {
    const { account_email, account_password } = req.body;
    const account = await accountModel.getAccountByEmail(account_email);

    if (!account) {
      req.flash("notice", "Invalid credentials");
      return res.status(400).redirect("/account/login");
    }

    const isMatch = await bcrypt.compare(account_password, account.account_password);
    if (!isMatch) {
      req.flash("notice", "Invalid credentials");
      return res.status(400).redirect("/account/login");
    }

    delete account.account_password;
    const token = jwt.sign(
      { account_id: account.account_id, account_type: account.account_type },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    return res.redirect("/account");
  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "An error occurred during login");
    return res.status(500).redirect("/account/login");
  }
}

/* ****************************************
 *  Build Account Management View
 * *************************************** */
async function buildAccountManagement(req, res) {
  try {
    const nav = await utilities.getNav();
    const accountData = res.locals.accountData;
    
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      message: req.flash('notice'),
      accountData,
      errors: null,
    });
  } catch (error) {
    console.error("Error building account management view:", error);
    req.flash("notice", "Sorry, there was an error loading your account.");
    res.redirect("/account/login");
  }
}

/* ****************************************
 *  Build Update Account View
 * *************************************** */
async function buildUpdateAccountView(req, res) {
  try {
    const nav = await utilities.getNav();
    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      accountData: res.locals.accountData,
      errors: null,
      message: null,
      current_account_email: res.locals.accountData ? res.locals.accountData.account_email : ""
    });
  } catch (error) {
    console.error("Error building update account view:", error);
    req.flash("notice", "Sorry, there was an error loading your account.");
    res.redirect("/account");
  }
}

/* ****************************************
 *  Update Account
 * *************************************** */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email, current_account_email } = req.body;
  const nav = await utilities.getNav();

  try {
    if (account_email !== current_account_email) {
      const emailTaken = await accountModel.checkEmailExistsForOtherAccounts(account_email, account_id);
      if (emailTaken) {
        req.flash("notice", "Email already exists. Please use a different one.");
        return res.status(400).render("account/update-account", {
          title: "Update Account Information",
          nav,
          accountData: { account_id, account_firstname, account_lastname, account_email },
          errors: ["Email already exists. Please use a different one."],
        });
      }
    }
    const updatedAccount = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);
    req.flash("notice", "Account successfully updated.");
    res.redirect("/account");
  } catch (error) {
    console.error("Error updating account:", error);
    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      accountData: { account_id, account_firstname, account_lastname, account_email },
      errors: ["Update failed. Please try again."],
    });
  }
}

/* ****************************************
 *  Update Password
 * *************************************** */
async function updatePassword(req, res) {
  const { account_id, new_password } = req.body;
  const nav = await utilities.getNav();

  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const result = await accountModel.updateAccountPassword(account_id, hashedPassword);
    if (result) {
      req.flash("notice", "Password successfully updated.");
      res.redirect("/account");
    } else {
      throw new Error("Password update failed.");
    }
  } catch (error) {
    console.error("Error updating password:", error);
    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      accountData: res.locals.accountData,
      errors: ["Password update failed. Please check the requirements and try again."],
      message: null
    });
  }
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccountView,
  updateAccount,
  updatePassword
};
