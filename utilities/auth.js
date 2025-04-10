function requireAdminOrEmployee(req, res, next) {
    const account = res.locals.accountData;
    if (account && (account.account_type === "Employee" || account.account_type === "Admin")) {
      return next();
    } else {
      req.flash("notice", "You must be an employee or admin to access that page.");
      return res.redirect("/account/login");
    }
  }
  
  module.exports = { requireAdminOrEmployee };
  