const express = require("express");
const router = express.Router();
const {body} = require("express-validator");

const contactController = require("../controllers/contact");
const isAuth = require("../middleware/isAuth");

//to add a single contact
router.post("/addcontact",isAuth,contactController.addContact);
//to update a contact in your contact list
router.patch("/updatecontact",isAuth,contactController.updateContact);
//to delete a contact in your contact list
router.delete("/deletecontact",isAuth,contactController.deleteContact);
//to get user details and contact list with details of each contact
router.get("/getuser",isAuth,contactController.getuser);
//to get contact list with pagination
router.get("/getlist",isAuth,contactController.getContactlist);
//to search in your contact list by name or number
router.get("/search",isAuth,contactController.search);

const multer = require('multer');
const storage = multer.diskStorage({
    destination:(req ,file ,cb)=>{
        cb(null ,'csv')
    },
    filename: (req,file ,cb)=>{
        cb(null ,file.originalname);
    } 
});
let upload = multer({storage:storage});
//to upload a file (contacts in bulk)
router.post("/bulkcontact",isAuth,upload.single('csv'),contactController.addbulkContact);

module.exports=router; 