const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");
const accountController = require("../controllers/accountController");

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
);

router.post(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
);

router.get(
  "/update/:account_id",
  utilities.handleErrors(accountController.buildUpdate)
);

router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
);
router.post(
  "/change",
  regValidate.changePasswordRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.changePassword)
);

router.get("/logout", utilities.logout);

module.exports = router;
