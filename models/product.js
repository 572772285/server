const mongoose = require('mongoose');
const pagination = require('../util/pagination.js');

const ProductSchema = new mongoose.Schema({
  FileList:{
  	type:String
  },
  categoryId:{
  	type:mongoose.Schema.Types.ObjectId,
    ref:'Category'
  },
  description:{
  	type:String,
  },
  name:{
    type:String,
  },
  price:{
    type:Number,
  },
  stock:{
    type:Number 
  },
  value:{
    type:String,
  },
  status:{
    type:String,
    default:'0'
  },
  order:{
    type:Number,
    default:0
  }
},{//时间参数。默认存在schema的第二个参数，他会自动生成createAt
  timestamps:true
})

ProductSchema.statics.getPaginationProducts = function(page,query={}){
    return new Promise((resolve,reject)=>{
      let options = {
        page: page,//需要显示的页码
        model:this, //操作的数据模型
        query:query, //查询条件
        projection:'name _id price status order', //投影，
        sort:{order:-1}, //排序
      }
      pagination(options)
      .then((data)=>{
        resolve(data); 
      })
    })
 }
const ProductModel = mongoose.model('Product', ProductSchema);

module.exports = ProductModel;