const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  fullname:{
    type: String,
    require: true
  },
  email:{
    type: String,
    require: true
  },
  password:{
    type: String,
    require:true
  },
  mobileno:{
    type: Number,
    require: true
  },
  contactlist:[{
    type:schema.Types.ObjectId,
    ref: 'contacts'
  }]
})

module.exports = mongoose.model("users",userSchema);