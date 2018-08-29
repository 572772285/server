const Router = require('express').Router;
const CategoryModel = require('../models/category.js');
const pagination = require('../util/pagination.js');

const router = Router();

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

//处理添加请求
router.post("/",(req,res)=>{
	let body = req.body;
	CategoryModel
	.findOne({name:body.name,pid:body.pid})	
	.then((cate)=>{
		if(cate){//已经存在渲染错误页面
	 		res.json({
	 			code:1,
	 			message:'分类已经存在，插入失败'
	 		})
		}else{
			new CategoryModel({
				name:body.name,
				pid:body.pid
			})
			.save()
			.then((newCate)=>{	
				if(newCate){//新增成功,渲染成功页面
					if(body.pid==0){
						CategoryModel.find({pid:0},"_id name")
						.then((categories)=>{
							res.json({
								code:0,
								data:categories
							})	
						})
					}else{
						res.json({
							code:0
						})
					}
				}
			})
			.catch((e)=>{
		 		res.json({
		 			code:1,
		 			message:"添加分类失败,服务器端错误"
		 		})
			})
		}
	})
})
router.get('/',(req,res)=>{
	let pid=req.query.pid;
	let page=req.query.page;
	if(page){
		CategoryModel
		.getPaginationCategories(page,{pid:pid})
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
		CategoryModel.find({pid:pid},"_id name pid order")
		.then((categories)=>{
			res.json({
				code:0,
				data:categories
			})	
		})
		.catch(e=>{
	 		res.json({
	 			code:1,
	 			message:"获取分类失败,服务器端错误"
	 		})		
		})		
	}
})


























//显示分类管理页面
router.get("/",(req,res)=>{
	
	let options = {
		page: req.query.page,//需要显示的页码
		model:CategoryModel, //操作的数据模型
		query:{}, //查询条件
		projection:'_id name order', //投影，
		sort:{order:1} //排序
	}

	pagination(options)
	.then((data)=>{
		res.render('admin/category_list',{
			userInfo:req.userInfo,
			categories:data.docs,
			page:data.page,
			list:data.list,
			pages:data.pages,
			url:'/category'
		});	
	})
})

//显示新增页面
router.get("/add",(req,res)=>{
	res.render('admin/category_add',{
		userInfo:req.userInfo
	});
})



//显示编辑页面
router.get('/edit/:id',(req,res)=>{
	let id=req.params.id;
	CategoryModel.findById(id)
	.then((category)=>{
		res.render('admin/category_edit',{
			userInfo:req.userInfo,
			message:'编辑成功',
			category:category
		})
	})
})

// 编辑请求
router.post('/edit',(req,res)=>{
	let body=req.body;
	CategoryModel.findById(body.id)
	.then((category)=>{
		if(category.name == body.name && category.order == body.order){
	 		res.render('admin/error',{
				userInfo:req.userInfo,
				message:'请修改数据后提交'
			})				
		}else{
			CategoryModel.findOne({name:body.name,_id:{$ne:body.id}})
			.then((newCategory)=>{
				if(newCategory){
			 		res.render('admin/error',{
						userInfo:req.userInfo,
						message:'编辑分类失败,已有同名分类'
					})						
				}else{
					CategoryModel.update({_id:body.id},{name:body.name,order:body.order},(err,raw)=>{
						if(!err){
							res.render('admin/success',{
								userInfo:req.userInfo,
								message:'修改分类成功',
								url:'/category'
							})					
						}else{
					 		res.render('admin/error',{
								userInfo:req.userInfo,
								message:'修改分类失败,数据库操作失败'
							})					
						}
					})					
				}
			})
		}
	})
})
//删除请求
router.get('/delete/:id',(req,res)=>{
	let id=req.params.id;
	console.log(id)
	CategoryModel.remove({_id:id},(err,data)=>{
		if(!err){

			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除成功',
				url:'/category'
			})
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除失败'
			})
		}
	})
})
module.exports = router;