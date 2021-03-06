const Router=require('express').Router;
const router=Router();
const UserModel = require('../models/blog.js');
const OrderModel = require('../models/order.js');

//获取生成订单的商品列表getOrderProductList
router.get('/getOrderProductList',(req,res)=>{
	UserModel.findById(req.userInfo._id)
	.then(user=>{
		user.getOrderProductList()
		.then(cart=>{
			res.json({
				code:0,
				data:cart
			})
		})
		
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'后台:生成订单错误'
		})
	})
	
})

//创建订单
 router.post('/',(req,res)=>{
 	UserModel.findById(req.userInfo._id)
 	.then(user=>{
 		let order = {};
 		user.getOrderProductList()
 		.then(result=>{
 			console.log('a',result)
 			order.payment = result.totalCartPrice;

 			let productList =[];
 			result.cartList.forEach(item=>{
 				productList.push({
 					product:item.product._id,
 					count:item.count,
 					totalPrice:item.totalPrice,
 					Price:item.product.price,
 					FileList:item.product.FileList,
 					name:item.product.name,
 				})
 			})
 			order.productList  = productList;
 			let shipping = user.shipping.id(req.body.shippingId);
 			order.shipping={
 				shippingId:shipping._id,
					
				name:shipping.name,
				province:shipping.province,
				city:shipping.city,
				address:shipping.address,
				phone:shipping.phone,
				zip:shipping.zip,

 			}

 			//构建订单号

 			order.orderNo = Date.now().toString() + parseInt(Math.random()*10000);
 		
 			//赋值用户id
 			order.user = user._id;
 			
 			new OrderModel(order)
 			.save()
 			.then(newOrder=>{
 				//删除购物车中的已提交订单的数据留下未选择的数据
 				UserModel
				 	.findOne({_id:req.userInfo._id})
				 	.then(user=>{
				 		let newCartList =  user.cart.cartList.filter(item=>{
			 				return item.check == false;
			 			})
			 			
				 	user.cart.cartList = newCartList;
				 	user.save()
				 	.then(newUser=>{
				 		res.json({
			 				code:0,
			 				data:newOrder
			 			})
				 	})
 				})
 			})			
 		})

 	})

 });

 //获取购物订单
 router.get('/list',(req,res)=>{
 	let page = req.query.page;
 	let query = {
 		user:req.userInfo._id
 	}

 	OrderModel
 	.getPaginationProduct(page,query)
	.then(data=>{
		
		res.json({
			code :0,
			data:{
				list:data.list,
				current:data.current,
				total:data.total,
				pageSize:data.pageSize,
				status:data.status
			}
		})
	})
 });

//获取订单详情页
 router.get('/',(req,res)=>{
 	let orderNo=req.query.orderNo
 	OrderModel
 	.findOne({orderNo:orderNo,user:req.userInfo._id})
	.then(data=>{
		res.json({
			code :0,
			
			data:data
		})
	})
 });
 //取消订单
 router.put('/cancel',(req,res)=>{
 	let orderNo=req.body.orderNo
 		OrderModel
 		.findOneAndUpdate(
 			{orderNo:orderNo,user:req.userInfo._id},
 			{status:"20",statusDesc:"取消"},
 			{new :true}
 			)
		.then(order=>{
			console.log("data",order)
		
			res.json({
				code :0,
				
				data:order
			})
		})
		.catch(e=>{
			console.log(e)
			res.json({
				code :0,
				message:"取消订单失败"
			})
		})
	})



//权限控制
 router.use((req,res,next)=>{
 	
 	if(req.userInfo.isAdmin){
 		next()
 	}else{
 		res.send({
			code:10
		});
 	}

 })

 //后台获取全部购物订单
 router.get('/orderList',(req,res)=>{
 	let page = req.query.page;
 	OrderModel
 	.getPaginationProduct(page)
	.then(data=>{
		
		res.json({
			code :0,
			
			data:{
				list:data.list,
				current:data.current,
				total:data.total,
				pageSize:data.pageSize,
				status:data.status
			}
		})
	})
 });
 //搜索
router.get('/search',(req,res)=>{
	let page = req.query.page || 1;
	let keyword = req.query.keyword
	OrderModel
	.getPaginationProduct(page,{
		orderNo:{$regex:new RegExp(keyword,'i')}
	})
	.then((result)=>{
		// console.log(result)
		res.json({ 
			code:0,
			data:{
				current:result.current,
				total:result.total,
				list:result.list,
				pageSize:result.pageSize,
				keyword:keyword
			}
		});	 
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'查找商品失败,数据库操作失败'
		})
	});
})

//获取订单详情
 router.get('/detail',(req,res)=>{
 	let orderNo=req.query.orderNo
 	OrderModel
 	.findOne({orderNo:orderNo})
	.then(data=>{
		res.json({
			code :0,
			
			data:data
		})
	})
 });


  //发货
 router.put('/fahuo',(req,res)=>{
 	let orderNo=req.body.orderNo
 		OrderModel
 		.findOneAndUpdate(
 			{orderNo:orderNo},
 			{status:"40",statusDesc:"已发货"},
 			{new :true}
 			)
		.then(order=>{
		
			res.json({
				code :0,
				data:order
			})
		})
		.catch(e=>{
			console.log(e)
			res.json({
				code :0,
				message:"发货失败"
			})
		})
	})
module.exports = router;