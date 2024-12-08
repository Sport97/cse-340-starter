const accountModel = require("../models/account-model");
const utilities = require("../utilities/");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Account Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Account Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Account Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Account Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Account Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Account Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Account Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  });
}

async function buildUpdate(req, res, next) {
  const account_id = parseInt(req.params.account_id);
  let nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(account_id);
  res.render("account/update", {
    title: "Account Update",
    nav,
    errors: null,
    accountData,
  });
}

async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      const updatedAccountData = await accountModel.getAccountById(account_id);
      req.session.accountData = updatedAccountData;
      req.session.save();
      res.locals.accountData = updatedAccountData;
      req.flash("notice", "Account information updated successfully.");
      return res.status(201).render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Account update failed. Please try again.");
      return res.status(500).render("account/update", {
        title: "Account Update",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error updating account:", error);
    req.flash("notice", "An error occurred while updating your account.");
    res.status(500).render("account/update", {
      title: "Account Update",
      nav,
      errors: null,
    });
  }
}

async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the password change."
    );
    res.status(500).render("account/update", {
      title: "Account Update",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.changePassword(
    account_id,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, password updated.`);
    res.status(201).render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the password change failed.");
    res.status(501).render("account/update", {
      title: "Account Update",
      nav,
      errors: null,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  buildUpdate,
  updateAccount,
  changePassword,
};
