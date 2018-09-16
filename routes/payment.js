const Router = require('express').Router;


const UserModel = require('../models/blog.js');

const OrderModel = require('../models/order.js');


 const router = new Router();


 router.get('/pay',(req,res)=>{
 	
 		res.json({
 			code:0,
 			data:{
 				orderNo:req.query.orderNo,
 				//该地址应该从支付宝接口获取
 				qurl:"http://127.0.0.1:3001/payImg/pay.jpg"
 			}
 			
 		})

 	
 });
 router.get('/status',(req,res)=>{
 	OrderModel
 		.findOne({orderNo:req.query.orderNo,},'status')
 		.then(order=>{
 			res.json({
 				code:0,
 				data:order.status == 30
 			})
 		})
 })
 
 
 
 module.exports = router;