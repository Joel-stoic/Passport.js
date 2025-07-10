import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  password:{
    type:String,
    minlength:6,
    required:true
  },
});

const User=mongoose.model("User",userSchema)

export default User;
