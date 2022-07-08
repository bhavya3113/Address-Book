const express = require("express");
const router = express.Router();
const {body} = require("express-validator");

const authController = require("../controllers/auth");

//signing up a new user
router.post("/signup", authController.signup);
//for otp verification
router.post("/otpVerification", [body("email").normalizeEmail().isEmail().withMessage('please enter a valid email'),
  body("password").trim().isLength({ min: 6 })], authController.otpVerification);
//to login
router.post("/login",[body("email").normalizeEmail().isEmail().withMessage('please enter a valid email')], authController.login);
//to resend otp
router.post("/resendotp",[body("email").normalizeEmail()],authController.resendotp);
//to generate access token
router.post("/generateaccesstoken", authController.generateAccessToken);
//to logout
router.post("/logout", authController.logout);
//to reset password of your account
router.put('/resetpass', [body('email').isEmail().normalizeEmail()],authController.resetpass);
//verifying user before allowing to reset password
router.put('/resetpass/verify',[body('email').isEmail().normalizeEmail()],authController.verify);
//to set new passowrd
router.put('/resetpass/verify/newpass', [body('email').isEmail().normalizeEmail(),
 body('newpass').trim().isLength({ min: 6 })], authController.newpassword);

module.exports=router; 