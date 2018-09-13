const Router=require('express').Router;
const router=Router();
const UserModel = require('../models/blog.js');
const ProductModel = require('../models/product.js');
const hmac = require('../util/hmac.js')


//获取生成订单的商品列表
router.get('/getCartCount',(req,res)=>{
	if(req.userInfo._id){
		UserModel.findById(req.userInfo._id)
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



module.exports = router;
