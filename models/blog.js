const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username:{
  	type:String
  },
  password:{
  	type:String
  },
  isAdmin:{
  	type:Boolean,
  	default:false//默认是普通用户
  },
  email:{
    type:String 
  },
  phone:{
    type:String
  }
},{//时间参数。默认存在schema的第二个参数，他会自动生成createAt
  timestamps:true
});


const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;