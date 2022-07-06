const express = require("express");
const router = express.Router();
const {body} = require("express-validator");

const authController = require("../controllers/auth");

router.post("/signup", authController.signup);

router.post("/otpVerification", [body("email").normalizeEmail().isEmail().withMessage('please enter a valid email'),
  body("password").trim().isLength({ min: 6 })], authController.otpVerification);

router.post("/login",[body("email").normalizeEmail().isEmail().withMessage('please enter a valid email')], authController.login);

router.post("/resendotp",[body("email").normalizeEmail()],authController.resendotp);

router.post("/generateaccesstoken", authController.generateAccessToken);

router.post("/logout", authController.logout);

router.put('/resetpass', [body('email').isEmail().normalizeEmail()],authController.resetpass);

router.put('/resetpass/verify',[body('email').isEmail().normalizeEmail()],authController.verify);

router.put('/resetpass/verify/newpass', [body('email').isEmail().normalizeEmail(),
 body('newpass').trim().isLength({ min: 6 })], authController.newpassword);

module.exports=router; 