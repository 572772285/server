const Router=require('express').Router;
const router=Router();
const UserModel = require('../models/blog.js');
const ProductModel = require('../models/product.js');
const hmac = require('../util/hmac.js')


//获取生成订单的商品列表
router.get('/getCartCount',(req,res)=>{
	if(req.userInfo._id){
		UserModel.update({_id:req.query._id},{

		})
		.then(user=>{
			if(user.cart){
				let count = 0;
				user.cart.cartList.forEach(item=>{
					count += item.count
				})
				res.json({
					code:0,
					data:count
				})
			}else{
				res.json({
					code:0,
					data:0
				})
			}
			
		})
		.catch(e=>{
			res.json({
				code:1,
				message:'后台:错误'
			})
		})
	}else{
		res.json({
			code:1,
			message:'请登录'
		})
	}
	
})

router.use((req,res,next)=>{
	if(req.userInfo._id){
		next()
	}else{
		res.json({
			code:10
		})
	}
})
//添加地址
router.post("/",(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then(user=>{
		//已有购物车
		if(user.shipping){
			user.shipping.push(body)

		}
		//没有购物车
		else{
			user.shipping = [body]
		}
		user.save()
		.then(newUser=>{
			res.json({
				code:0,
				data:user.shipping,
			})
		})
	})
});
//获取地址
router.get("/list",(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then(user=>{
		res.json({
			code:0,
			data:user.shipping,
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'获取购物车数量'
		})
	})
});
//删除地址
router.put('/delete',(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then(user=>{
		user.shipping.id(body.shippingId).remove()
		user.save()
		.then(newUser=>{
			res.json({
				code:0,
				data:user.shipping,
			})
		})
	})
})
//编辑地址 根据传入的id获取地址
router.put("/edit",(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then(user=>{
		res.json({
			code:0,
			data:user.shipping.id(body.shippingId),
		})
	})
});
//编辑地址添加
router.put("/editsubmit",(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then(user=>{
		let shipping=user.shipping.id(body.shippingId)
		shipping.name=body.name
		shipping.province=body.province
		shipping.city=body.city
		shipping.address=body.address
		shipping.phone=body.phone
		shipping.zip=body.zip
		user.save()
		.then(newUser=>{
			res.json({
				code:0,
				data:user.shipping,
			})
		})
	})
});
module.exports = router;
