const mongoose = require("mongoose");
const schema = mongoose.Schema;

const contactSchema = new schema({
  fullname:{
    type: String,
    require: true
  },
  mobileno:{
    type: Number,
    require: true
  },
  email:{
    type:String
  }
})

module.exports = mongoose.model("contacts",contactSchema);