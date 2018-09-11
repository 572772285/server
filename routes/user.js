const Router = require('express').Router;
const UserModel = require('../models/blog.js');
const hmac = require('../util/hmac.js')
const productModel=require('../models/product.js')
const router = Router();




/*
router.get('/init',(req,res)=>{
	const user=[]
	for(var i=0;i<100;i++){
		user.push({
			  username: '测试人员'+i,
			  isAdmin: false,
			  phone:'1883741891'+i,
			  email:'yang@yang'+i+'.com'
		})
		UserModel.create(user)
		.then((result)=>{
			res.send('ok')
		})
	}
})
*/
//注册用户
router.post("/register",(req,res)=>{
	let body = req.body;
	//定义返回数据
	let result  = {
		code:0,// 0 代表成功 
		message:''
	}

	UserModel
	.findOne({username:body.username})
	.then((user)=>{
		if(user){//已经有该用户
			 result.code = 1;
			 result.message = '用户已存在'
			 res.json(result);
		}else{
			//插入数据到数据库
			new UserModel({
				username:body.username,
				password:hmac(body.password),
				email:(body.email),
				phone:(body.phone),
			})
			.save((err,newUser)=>{
				if(!err){//插入成功
					res.json(result)
				}else{
					result.code = 1;
					result.message = '注册失败'
					res.json(result);					
				}
			})
		}
	})

})
//用户登录
router.post("/login",(req,res)=>{
	let body = req.body;
	//定义返回数据
	let result  = {
		code:0,// 0 代表成功 
		message:''
	}
	UserModel
	.findOne({username:body.username,password:hmac(body.password)})
	.then((user)=>{
		if(user){//登录成功
			 /*	
			 result.data = {
			 	_id:user._id,
			 	username:user.username,
			 	isAdmin:user.isAdmin
			 }
			 */
			 //设置cookie->返回时前端页面就会有设置的cookie
			 //req.cookies.set('userInfo',JSON.stringify(result.data))
			 
			 req.session.userInfo = {
			 	_id:user._id,
			 	username:user.username,
			 	isAdmin:user.isAdmin
			 }

			 res.json(result);
		}else{
			result.code = 1;
			result.message = '用户名和密码错误'
			res.json(result);
		}
	})

})
//获取登陆数据
router.get('/userName',(req,res)=>{
	if(req.userInfo._id){
		res.json({
			code:0,
			data:req.userInfo
		})
	}else{
		res.json({
			code:1
		})
	}
})
//注册验证、
router.get('/checkUserName',(req,res)=>{
	let username=req.query.username
	UserModel
	.findOne({username:username})
	.then((user)=>{
		if(user){//如果用户名存在
			res.json({
				code:1,
				message:'用户名存在啦'
			})
		}else{
			res.json({
				code:0
			})
		}
	})
})

//退出
router.get('/logout',(req,res)=>{
	let result  = {
		code:0,// 0 代表成功 
		message:''
	}
	/*	
	req.cookies.set('userInfo',null);
	*/
	req.session.destroy();

	res.json(result);

})

router.get('/productList',(req,res)=>{
	let page = req.query.page;
	let query = {status:0};
	if (req.query.categoryId) {
		// console.log(req.query.categoryId)
		query.category = req.query.categoryId;
	} else {
		query.name = {$regex:new RegExp(req.query.keyword,'i')};
	}

	let projection = 'name _id price FileList';
	let sort = {order:-1};

	if (req.query.orderBy == 'price_asc') {
		sort = {price:1}
	} else {
		sort = {price:-1}
	}

	productModel
	.getPaginationProducts(page,query,projection,sort)
	.then((result)=>{
		// console.log(result)
		res.json({ 
			code:0,
			data:{
				current:result.current,
				total:result.total,
				list:result.list,
				pageSize:result.pageSize
			}
		});	 
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'查找商品失败'
		})
	});
})

// 获取商品详细信息
router.get('/productDetail',(req,res)=>{
	productModel
	.findOne({status:0,_id:req.query.productId},"-__v -createdAt -updateAt -category")
	.then(product=>{
		res.json({ 
			code:0,
			data:product
		});	
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'获取商品详情失败'
		})
	});
})


//权限控制
router.use((req,res,next)=>{
	if(req.userInfo._id){
		next()
	}else{
		res.json({
			code:10
		})
	}
})

router.get("/userInfo",(req,res)=>{
	if(req.userInfo._id){
		UserModel.findById(req.userInfo._id,"username phone email")
		.then(user=>{
			res.json({
				code:0,
				data:user
			})
		})
	}else{
		res.json({
			code:1
		});
	}
});
//修改用户密码
router.put("/updatePassword",(req,res)=>{
	UserModel.update({_id:req.userInfo._id},{password:hmac(req.body.password)})
	.then(raw=>{
		res.json({
			code:0,
			message:'更新密码成功'
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'更新密码失败'
		})
	})
})

module.exports = router;