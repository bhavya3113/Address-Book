const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");


dotenv.config();

const User = require("../models/user");
const Token = require("../models/token");
const Otp = require("../models/otp");
const mail = require("../utils/sendemail");

var emailregex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ Error: "Validation Failed" });
    }

    const { email } = req.body;

    var validemail = emailregex.test(email);

    if (!validemail) {
      const error = new Error('Please enter a valid email');
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findOne({ email: email });
    if (user) {
      const error = new Error("user already exists !!");
      error.statusCode = 400;
      throw error;
    }

    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    const result = await Otp.findOne({ email: email });
    if (result === null) {
      const newOtp = new Otp({ email: email, otp: otp });
      await newOtp.save();
    }
    else
      await Otp.updateOne({ email: email }, { $set: { otp: otp } });
    mail.sendEmail(email, otp);
    return res.status(201).json({ message: 'Otp sent' });
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.otpVerification = async (req, res, next) => {
  try {
    const { email, otp, password, name,mobile} = req.body;
    const user = await User.findOne({ email: email });
    if (user)
        return res.status(401).send('Already registered.');

    const newotp = await Otp.findOne({ email: email });
    if (!newotp) {
      const err = new Error('Otp is expired');
      err.statusCode = 422;
      throw err;
    }
    if (newotp.otp !== otp) {
      const err = new Error("Wrong Otp");
      err.statusCode = 420;
      throw err;
    }
    await newotp.remove();

    const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
       email: email,
       password: hashedPassword,
       fullname: name,
       mobileno:mobile
    });
    await newUser.save();
    const accesstoken = jwt.sign({ email: email, userId: newUser._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' });
    const refreshtoken = jwt.sign({ email: email, userId: newUser._id }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "30d" });
    const token = new Token({
      email: email,
      token: refreshtoken
    })
    await token.save();
    return res.status(200).json({ message: "successfully registered", access_token: accesstoken});
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
  
exports.resendotp = async (req,res,next)=>{
  try{
  const {email} = req.body;
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  });

  const result = await Otp.findOne({ email: email });
  if (result === null) {
    const newOtp = new Otp({ email: email, otp: otp });
    await newOtp.save();
  }
  else
    await Otp.updateOne({ email: email }, { $set: { otp: otp } });
  mail.sendEmail(email, otp);
  return res.status(201).json({ message: 'Otp sent' });
  }
  catch(err){
      if (!err.statusCode) {
          err.statusCode = 500;}
          next(err);
  }
}
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ Error: "Validation Failed" });
    }
    const { email, password} = req.body;
    var validemail = emailregex.test(email);
    if (!validemail) {
      const error = new Error('Please enter a valid email');
      error.statusCode = 422;
      throw error;
    }
    const user = await User.findOne({ email: email });

      if (!user) {
        const error = new Error("user is not registered !!");
        error.statusCode = 400;
        throw error;
      }
      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        const error = new Error('Incorrect Password');
        error.statusCode = 403;
        throw error;
      }
    const accesstoken = jwt.sign({ email: email, userId: user._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' });
    const refreshtoken = jwt.sign({ email: email, userId: user._id }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "30d" });
    const token = new Token({
      email: email,
      token: refreshtoken
    })
    await token.save();
    return res.status(200).json({ message: "LoggedIn", email: email, access_token: accesstoken });
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.generateAccessToken = async (req, res, next) => {
  try {
    const { refreshtoken } = req.body;
    if (!refreshtoken) {
      const err = new Error('token missing');
      err.statusCode = 401;
      throw err;
    }
    const tokenInDb = await Token.findOne({ token: refreshtoken });
    if (!tokenInDb) {
      const error = new Error('login again');
      error.statusCode = 402;
      throw error;
    }
    const payload = jwt.verify(tokenInDb.token, process.env.REFRESH_TOKEN_KEY);
    const accessToken = jwt.sign({ id: payload._id, email: payload.email }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "1h" });
    return res.status(200).json({ access_token: accessToken });
  }
  catch (err) {
    if (!err.statusCode)
      err.statusCode = 500;
    next(err);
  }
};


exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokenInDb = await Token.findOne({ token: refreshToken });

    if (tokenInDb) {
      await tokenInDb.remove();
      return res.status(200).json({ message: 'logged out' });
    }
    else {
      const err = new Error('error logging out');
      err.statusCode = 400;
      throw err;
    }
  }
  catch (err) {
    if (!err.statusCode)
      err.statusCode = 500;
    next(err);
  }
};

exports.resetpass = async (req, res, next) => {
  if (!validationResult(req).isEmpty())
      return res.status(422).json('please enter a valid email');

  try {
      const email = req.body.email;
      var validemail = emailregex.test(email);

      if (!validemail) {
          const error = new Error('Please enter a valid email');
          error.statusCode = 422;
          throw error;
      }

      const user = await User.findOne({ email: email });
      if (user === null)
          return res.status(401).send('user not found');

      const otp = otpGenerator.generate(6, {
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false
      });

      const result = await Otp.findOne({ email: email });
      if (result === null) {
          const newOtp = new Otp({ email: email, otp: otp });
          await newOtp.save();
      }
      else
          await Otp.updateOne({ email: email }, { $set: { otp: otp } });

      mail.sendEmail(email, otp);
      return res.status(200).send('otp sent successfully');
  } catch (err) {
      if (!err.statusCode)
          err.statusCode = 500;
      next(err);
  }
};

exports.verify = async (req, res, next) => {
  if (!validationResult(req).isEmpty())
      return res.status(422).json('please enter a valid email');
  try{
      const {email,otp} = req.body;
      var validemail = emailregex.test(email);

      if (!validemail) {
          const error = new Error('Please enter a valid email');
          error.statusCode = 422;
          throw error;
      }
  const optInDb = await Otp.findOne({ email: email });
      if (!optInDb) {
          const err = new Error('Otp is expired');
          err.statusCode = 422;
          throw err;
        }
        if (optInDb.otp !== otp) {
          const err = new Error("Wrong Otp");
          err.statusCode = 420;
          throw err;
        }
        return res.status(200).json('correct otp');
  }
  catch (err) {
    if (!err.statusCode)
        err.statusCode = 500;
    next(err);
  }
};
 
exports.newpassword = async (req, res, next) => {
  try{
    if (!validationResult(req).isEmpty())
    return res.status(422).json('validation failed');

      const {newpass,email,confirmpass} = req.body;

      const user = await User.findOne({ email: email });
      if (user === null){
          const error = new Error("user is not registered !!");
          error.statusCode = 400;
          throw error;
        }
        if(newpass != confirmpass)
        {
          const error = new Error("Passwords do not match");
          error.statusCode = 422;
          throw error;
        }
          const hashedPw = await bcrypt.hash(newpass, 12);
          await user.updateOne({ email: email }, { $set: { password: hashedPw} });
          return res.status(200).json('password updated');


  } 
  catch (err) {
      if (!err.statusCode)
          err.statusCode = 500;
      next(err);
  }
}; 
