const mongoose = require("mongoose");
const schema = mongoose.Schema;

const contactSchema = new schema({
  fullname:{
    type: String,
    require: true
  },
  mobileno:{
    type: String,
    require: true
  },
  email:{
    type:String
  },
  belongsto:{
    type: schema.Types.ObjectId,
    require:true 
  }
})

module.exports = mongoose.model("contacts",contactSchema);