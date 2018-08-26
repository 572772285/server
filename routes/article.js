const Router = require('express').Router;
const CategoryModel = require('../models/category.js');
const ArticleModel = require('../models/article.js');
const pagination = require('../util/pagination.js');
var express = require('express')
//设置上传图片
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const router = Router();
//权限控制
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next()
	}else{
		res.send('<h1>请用管理员账号登录</h1>');
	}
})
//显示分类管理页面
router.get("/",(req,res)=>{
	ArticleModel.getPaginationArticles(req)
	.then((data)=>{
		res.render('admin/article_list',{
			userInfo:req.userInfo,
			articles:data.docs,
			page:data.page,
			list:data.list,
			pages:data.pages,
			url:'/article'
		});	
	})
	
	
	
})

//显示新增页面
router.get("/add",(req,res)=>{
	CategoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{
		res.render('admin/article_add',{
			userInfo:req.userInfo,
			categories:categories
		});
	})

})
//处理添加请求
router.post("/add",(req,res)=>{
	let body = req.body;
	new ArticleModel({
		category:body.category,
		user:req.userInfo._id,
		title:body.title,
		intro:body.intro,
		content:body.content
	})
	.save()
	.then((article)=>{
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'新增分类成功',
			url:'/article'
		})		
	})
	.catch((e)=>{
 		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'新增分类失败,数据库操作失败'
		})			
	})

})


//显示编辑页面
router.get('/edit/:id',(req,res)=>{
	let id=req.params.id;
	CategoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{
		ArticleModel.findById(id)
		.then((article)=>{
			res.render('admin/article_edit',{
				userInfo:req.userInfo,
				article:article,
				categories:categories
			})
		})
	})
})
// 编辑请求
router.post('/edit',(req,res)=>{
	let body=req.body;
	console.log(body)
	let options={
		category:body.category,
		title:body.title,
		intro:body.intro,
		content:body.content
	}
	ArticleModel.update({_id:body.id},options,(err,raw)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'文章修改成功',
				url:'/article'
			})
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'文章修改失败'
			})
		}
	})
})
//删除请求
router.get('/delete/:id',(req,res)=>{
	let id=req.params.id;
	ArticleModel.remove({_id:id},(err,data)=>{
		if(!err){

			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除成功',
				url:'/article'
			})
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除失败'
			})
		}
	})
})
//接受上传图片请求
router.post('/uploadImages',upload.single('upload'),(req,res)=>{
	//路径设置
	let path = "/uploads/"+req.file.filename;
	res.json({
		uploaded:true,
        url:path
	})
})
module.exports = router;