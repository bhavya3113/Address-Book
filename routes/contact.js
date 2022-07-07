const express = require("express");
const router = express.Router();
const {body} = require("express-validator");

const contactController = require("../controllers/contact");
const isAuth = require("../middleware/isAuth");

router.post("/addcontact",isAuth,contactController.addContact);
router.patch("/updatecontact",isAuth,contactController.updateContact);
router.delete("/deletecontact",isAuth,contactController.deleteContact);
router.get("/getuser",isAuth,contactController.getuser);
router.get("/getlist",isAuth,contactController.getContactlist);
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

router.post("/bulkcontact",isAuth,upload.single('csv'),contactController.addbulkContact);

module.exports=router; 