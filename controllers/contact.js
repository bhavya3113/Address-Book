const { validationResult } = require("express-validator");
const path = require("path");
const mongoose = require("mongoose");
const csvtojson = require("csvtojson");

const User = require("../models/user");
const Contact = require("../models/contact");

exports.addContact= async (req, res, next) => {
  try {

    const userId = req.user._id;
    const {email,name,mobile} = req.body;
    const user = await User.findById(userId).populate('contactlist');
      if (!user) {
      const error = new Error("User not found!!");
      error.statusCode = 400;
      throw error;
      }
      const nameindex = user.contactlist.findIndex(i=>(i.fullname)==name);
      const phonenoindex = user.contactlist.findIndex(i=>(i.mobileno)==mobile);
      
      if(nameindex != -1)
      {
        const error = new Error("Contact with same name already exists");
        error.statusCode = 400;
        throw error;
      }
      if(phonenoindex != -1)
      {
        const error = new Error("Contact with same phone number already exists");
        error.statusCode = 400;
        throw error;
      }    
      const contact = new Contact({
       fullname:name,
       mobileno:mobile,
       email:email,
       belongsto:userId
      })
      await contact.save();
      await user.contactlist.push(contact);
      await user.save();
      return res.status(201).json({message:"contact saved"});
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.addbulkContact= async (req, res, next) => {
  try {
     const userId = req.user._id;
     const user = await User.findById(userId);
      if (!user) {
      const error = new Error("User not found!!");
      error.statusCode = 400;
      throw error;
      }
      const name =req.file
      var arrayToInsert = [];
      uploadPath = path.join(__dirname,'../','csv',name.originalname)
      const filedata = await csvtojson().fromFile(uploadPath)
          if(filedata)
          {
               // Fetching the all data from each row
              for (var i = 0; i < filedata.length; i++) {
                const id = new mongoose.Types.ObjectId();
              var oneRow = {
                  _id:id,
                  belongsto:userId,
                  fullname: filedata[i]["Fullname"],
                  mobileno: filedata[i]["Mobileno"],
                  email: filedata[i]["Email"]
              }; 
                  console.log(oneRow)
                  arrayToInsert[i]=oneRow;    
                  await user.contactlist.push(id);
                  await user.save();
             }
             
          // console.log(arrayToInsert)
            Contact.insertMany(arrayToInsert);  
            return res.status(201).json({message:"file uploaded"});
             }
             else{
              const err = new Error('File Not Uploaded');
              err.statusCode = 422;
              throw err;
             }
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getuser= async (req, res, next) => {
  try {

    const userId = req.user._id;
    const user = await User.findById(userId).populate('contactlist',{"belongsto":0,});
      if (!user) {
      const error = new Error("User not found!!");
      error.statusCode = 400;
      throw error;
      }
      return res.status(201).json({user:user});
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.search= async (req, res, next) => {
  try {
    const search = req.query.search;
    const userId = req.user._id;
    const contact = await Contact.find({$and: [
      { belongsto: userId },
      { $or: [ {fullname:{$regex:search,$options:"i"}},{mobileno:{$regex:search,$options:"i"}}]}
      ]})
      return res.status(201).json({contact:contact});
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getContactlist= async (req, res, next) => {
  try {

    const userId = req.user._id;
    const page = req.query.page;
    const limit = req.query.limit;
    const user = await User.findById(userId).populate('contactlist',{"belongsto":0,});
      if (!user) {
      const error = new Error("User not found!!");
      error.statusCode = 400;
      throw error;
      }
      const paginatedItems = await Contact.find({belongsto:userId}).limit(limit*1).skip((page-1)*limit)
      res.status(201).json({result:paginatedItems});
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.updateContact= async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
      if (!user) {
      const error = new Error("User not found!!");
      error.statusCode = 400;
      throw error;
      }
    const {contactid,email,name,mobile} = req.body; 
    const index = user.contactlist.findIndex(i=>i==contactid);
    if(index == -1)
    {
      const error = new Error("Contact is not saved in your directory");
      error.statusCode = 400;
      throw error;
    }
    await Contact.findByIdAndUpdate(contactid,{
      fullname:name,mobileno:mobile,email:email},{omitUndefined: true});
     return res.status(201).json({message:"contact updated"});
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.deleteContact= async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
      if (!user) {
      const error = new Error("User not found!!");
      error.statusCode = 400;
      throw error;
      }
    const {contactid} = req.body; 
    const index = user.contactlist.findIndex(i=>i==contactid);
    if(index == -1)
    {
      const error = new Error("Contact is not saved in your directory");
      error.statusCode = 400;
      throw error;
    }
    await Contact.findByIdAndDelete(contactid);
    await user.contactlist.pull(contactid);
    await user.save();
    return res.status(201).json({message:"contact deleted"});
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}