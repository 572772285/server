const Router = require('express').Router;

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

var upload = multer({ storage: storage })

//权限控制
 router.use((req,res,next)=>{
 	
 	if(req.userInfo.isAdmin){
 		next()
 	}else{
 		res.send({
			code:10
		});
 	}

 });
//处理商品图片
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
module.exports = router;