const Router = require('express').Router;
const CategoryModel = require('../models/category.js');
const getCommonData=require('../util/getCommonData.js')
const CommentModel=require('../models/comment.js')
const ArticleModel = require('../models/article.js');
const pagination = require('../util/pagination.js');
const router = Router();
//显示首页
router.get("/",(req,res)=>{
	/*
	CategoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{//获取首页的题目分类
		ArticleModel.getPaginationArticles(req)
		.then((data)=>{//获取首页下面的文章列表
			ArticleModel.find({},'_id title click')//获取文章分类排行
			.sort({click:-1})
			.limit(10)
			.then((topArticles)=>{
				res.render('main/layout',{
					userInfo:req.userInfo,
					articles:data.docs,
					page:data.page,
					list:data.list,
					pages:data.pages,
					categories:categories,
					topArticles:topArticles,
					url:'/articles' //点击分页的按钮跳转路径，下面接收做处理
				});	
			})
			
		})	
	})
	*/
	ArticleModel.getPaginationArticles(req)
	.then((pageData)=>{
		getCommonData()//调用公共函数
		.then((data)=>{
			res.render('main/layout',{
				userInfo:req.userInfo,
				articles:pageData.docs,
				page:pageData.page,
				list:pageData.list,
				pages:pageData.pages,
				categories:data.categories,
				topArticles:data.topArticles,
				site:data.site,
				url:'/articles' //点击分页的按钮跳转路径，下面接收做处理
			});	
		})
	})
})
//ajax请求接受首页文章列表数据
router.get("/articles",(req,res)=>{
		//两种场景，一种是首页分页后台请求
		let category=req.query.id;
		let query={};//首页默认查询所有的条件
		if(category){
			//如果前台有category就在query上添加一个category，给后台接收
			query.category=category
		}
		ArticleModel.getPaginationArticles(req,query) //如果query上有category的话，在getPaginationArticles这个函数里就多查询条件
		.then((data)=>{
			//把数据发送前台
			res.json({
				code:'0',
				data:data
			})
		})	
})

//显示详情页面
router.get("/view/:id",(req,res)=>{
	let id = req.params.id;
	ArticleModel.findByIdAndUpdate(id,{$inc:{click:1}},{new:true})
	.populate('category','name')
	.populate('user','username')
	.then(article=>{
		getCommonData()
		.then(data=>{
			CommentModel.getPaginationComments(req,{article:id})
			.then(pageData=>{
				res.render('main/detail',{
					userInfo:req.userInfo,
					article:article,
					categories:data.categories,
					topArticles:data.topArticles,
					comments:pageData.docs,
					page:pageData.page,
					list:pageData.list,
					pages:pageData.pages,
					site:data.site,
					category:article.category._id.toString()
				})			      	
			})
		})
	})
})


//显示首页的list页面
router.get('/list/:id',(req,res)=>{
	let id=req.params.id;
	//显示分页要先显示分页
	ArticleModel.getPaginationArticles (req,{category:id})
	.then((pageData)=>{
		getCommonData()//调用公共函数
		.then((data)=>{
			res.render('main/list',{
				userInfo:req.userInfo,
				articles:pageData.docs,
				page:pageData.page,
				list:pageData.list,
				pages:pageData.pages,
				categories:data.categories,
				topArticles:data.topArticles,
				site:data.site,
				category:id,//传一个id，给页码点击发送请求用
				url:'/articles' //点击分页的按钮跳转路径，下面接收做处理
			});	
		})
	})
})
module.exports = router;