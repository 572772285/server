const Router=require('express').Router;
const router=Router();
const UserModel = require('../models/blog.js');
const ProductModel = require('../models/product.js');
const hmac = require('../util/hmac.js')


//获取生成订单的商品列表
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



module.exports = router;