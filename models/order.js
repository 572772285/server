const mongoose = require('mongoose');

const ProductModel =  require('./product.js');
const pagination = require('../util/pagination.js');
const ProductSchema  =  new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    name:{
        type:String
    },
    FileList:{
        type:String
    },
    Price:{
        type:Number,
        deafult:0
    },
    count:{
        type:Number,
        deafult:1
    },
    toatlPrice:{
        type:Number,
        deafult:0
    },

})


const shippingSchema  = new mongoose.Schema({
    shippingId:{
        type:String
    },
    name:{
        type:String
    },
    province:{
        type:String
    },
    city:{
        type:String
    },
    address:{
        type:String
    },
    phone:{
        type:Number
    },
    zip:{
        type:Number
    }

})
const orderSchema = new mongoose.Schema({
            //订单所属
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            },
            orderNo:{
                type:String,
            },
            //支付金额
            payment:{
                type:Number,
            },
            paymentType:{
                type:String,
                enmu:["10","20"],//10-支付宝  20-微信
                default:"10"
            },
            paymentTypeDesc:{
                type:String,
                enmu:["支付宝","微信"],//10-支付宝  20-微信
                default:"支付宝"
            },
            paymentTime:{
                type:Date
            },
            status:{
                type:String,
                enmu:["10",'20',"30","40","50"],
                default:"10" //10- 未支付  20 - 取消 30-已支付
            },
            statusDesc:{
                type:String,
                enmu:["未支付",'取消',"已支付","已发货","完成"],
                default:"未支付" //10- 未支付  20 - 取消 30-已支付  40-已发货 50-完成
            },
            //商品信息
            productList:{
                type:[ProductSchema],
                deafult:[]
            },
            //配送地址
            shipping:{
                type:shippingSchema
            }

        },{
            timestamps:true
        }); 

orderSchema.statics.getPaginationProduct = function(page,query={}){
    return new Promise((resolve,reject)=>{
      let options = {
        page: page,
        model:this, 
        query:query,      
        sort:{_id:-1}, 
      }
      pagination(options)
      .then((data)=>{
        resolve(data); 
      })
    })
 }
const OrderModel = mongoose.model('Order',orderSchema);


module.exports = OrderModel;