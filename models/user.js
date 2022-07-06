const mongoose = require("mongoose");
const schema = mongoose.Schema;

const studentSchema = new schema({
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
  }
})

module.exports = mongoose.model("users",studentSchema);