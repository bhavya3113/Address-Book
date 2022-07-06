const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport(sendGridTransport({
  auth:{
    api_key: process.env.API_KEY
  }
}))
 
    exports.sendEmail =(email,otp)=>{
      transporter.sendMail({
        to:email,
        from:process.env.EMAIL,
        subject:'Verification OTP',
        html:`<h4>Hello user,</h4>
        <br>Please use this One time password for verification.<br>
        OTP:${otp}<br>
        Do not share it with anyone.<br>
        <h5>Thanks ,<br>Team FeeFund</h5>`
      })
    }
    