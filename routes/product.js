const Router = require('express').Router;
const ProductModel=require('../models/product.js')
const path = require('path');
const router = new Router();
const multer = require('multer');
// var upload = multer({ dest: 'public/product-imgages/' })
//图片的路径定义
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/product-imgages/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+path.extname(file.originalname) )
  }
})

var upload = multer({ storage: storage });








router.get('/homeList',(req,res)=>{
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

	ProductModel
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
router.get('/homeDetail',(req,res)=>{
	ProductModel
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
 	
 	if(req.userInfo.isAdmin){
 		next()
 	}else{
 		res.send({
			code:10
		});
 	}

 })
//处理商品详情图片品图片
router.post('/loadimg',upload.single('file'),(req,res)=>{
	const  fileName = 'http://127.0.0.1:3001/product-imgages/'+req.file.filename;
	console.log(fileName)
	
	res.send(fileName)
	
})
//处理商品详情图片
router.post('/upload',upload.single('upload'),(req,res)=>{
	const  fileName = 'http://127.0.0.1:3001/product-imgages/'+req.file.filename;
	
	res.json({
		  "success": true,
		  "msg": "商品图片上传成功",
		  "file_path":fileName
	})
	
})
//处理添加请求
router.post("/shopmall",(req,res)=>{
	let body = req.body;
	let page=req.query.page;
	new ProductModel({
				name:body.name,
				categoryId:body.categoryId,
				FileList:body.FileList,
				description:body.description,
				stock:body.stock,
				price:body.price,
				value:body.value,
			})
			.save()
			.then((product)=>{	
				if(product){
					ProductModel	
					.getPaginationProducts(1,{})
					.then((result)=>{
						res.json({
							
							code:0,
						})	
					})
				}
			})
			.catch(e=>{
	 		res.json({
	 			code:1,
	 			message:"添加分类失败,服务器端错误"
	 		})		
		})	

})
//处理添加请求
router.put("/shopmall",(req,res)=>{
	let body = req.body;
	let page=req.query.page;
	let update={
				name:body.name,
				categoryId:body.categoryId,
				FileList:body.FileList,
				description:body.description,
				stock:body.stock,
				price:body.price,
				value:body.value,
			}
			ProductModel
			.update({_id:body.id},update)
			.then((product)=>{	
				if(product){
					res.json({
						code:0
					})
				}
			})
			.catch(e=>{
	 		res.json({
	 			code:1,
	 			message:"添加分类失败,服务器端错误"
	 		})		
		})	

})
//获取商品
router.get('/',(req,res)=>{
	let page=req.query.page;
		ProductModel
		.getPaginationProducts(page,{})
		.then((result)=>{
			res.json({
				code:0,
				data:{
					current:result.current,
					total:result.total,
					pageSize:result.pageSize,
					list:result.list,
				}
			})	
		})
		.catch(e=>{
	 		res.json({
	 			code:1,
	 			message:"获取商品失败,服务器端错误"
	 		})		
		})	
})

//排序
router.put('/updateOrder',(req,res)=>{
let body = req.body;
	ProductModel
	.update({_id:body.id},{order:body.order})
	.then((cate)=>{
		if(cate){
			ProductModel
			.getPaginationProducts(body.page,{})
			.then((result)=>{
				res.json({
					code:0,
					data:{
						current:result.current,
						total:result.total,
						pageSize:result.pageSize,
						list:result.list,
					}
				})	
			})
		}else{
			res.json({
	 			code:1,
	 			message:"更新分类失败,数据操作失败"
	 		})	
		}
	})
	.catch((e)=>{
		console.log(e)
 		res.json({
 			code:1,
 			message:"添加分类失败,服务器端错误"
 		})
	})
})
//上下架,原理就是去数据库中update状态（status）很简单
router.put('/getStatus',(req,res)=>{
let body = req.body;
	ProductModel
	.update({_id:body.id},{status:body.status})
	.then((cate)=>{
		if(cate){
			res.json({
				code:0,
				message:"更新状态成功"
			})
		}else{
			ProductModel
			.getPaginationProducts(body.page,{})
			.then((result)=>{
				res.json({
					code:1,
					message:"更新状态失败",
					data:{
						current:result.current,
						total:result.total,
						pageSize:result.pageSize,
						list:result.list,
					}
				})	
			})
			res.json({
	 			code:1,
	 			message:"更新分类失败,数据操作失败"
	 		})	
		}
	})
	.catch((e)=>{
		console.log(e)
 		res.json({
 			code:1,
 			message:"添加分类失败,服务器端错误"
 		})
	})
})
//获取商品详细信息
router.get('/detail',(req,res)=>{
	let id=req.query.id;
		ProductModel
		.findById(id)
		.populate({path:'categoryId',select:'_id pid'})
		.then((product)=>{
			console.log('ccc')
			res.json({
				code:0,
				data:product
			})	
		})
		.catch(e=>{
	 		res.json({
	 			code:1,
	 			message:"获取商品失败,服务器端错误"
	 		})		
		})	
})
//搜索
router.get('/search',(req,res)=>{
	let page = req.query.page || 1;
	let keyword = req.query.keyword
	ProductModel
	.getPaginationProducts(page,{
		name:{$regex:new RegExp(keyword,'i')}
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
			message:'查找分类失败,数据库操作失败'
		})
	});
})
module.exports = router;