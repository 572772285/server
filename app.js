//项目入口文件
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const Cookies = require('cookies');
const session = require('express-session');
const MongoStore = require("connect-mongo")(session);
var cookieParser = require('cookie-parser')


//1启动数据库
mongoose.connect('mongodb://localhost:27017/kmall',{ useNewUrlParser: true });

const db = mongoose.connection;

db.on('error',(err)=>{
	throw err
});

db.once('open',()=>{
	console.log('DB connected....');
});


const app = express();

//2跨域设置
app.use((req,res,next)=>{
    res.append("Access-Control-Allow-Origin","http://localhost:3000");
	res.append("Access-Control-Allow-Credentials",true);
	res.append("Access-Control-Allow-Methods","GET, POST, PUT,DELETE");
	res.append("Access-Control-Allow-Headers", "Content-Type, X-Requested-With,X-File-Name"); 
	next();
})
//
app.use((req,res,next)=>{
    if(req.method == 'options'){
        res.send('options is ok')
    }else{
        next()
    }
})
//3设置cookie的中间件,后面所有的中间件都会有cookie
app.use(session({
    //设置cookie名称
    name:'kmid',
    //用它来对session cookie签名，防止篡改
    secret:'dsjfkdfd',
    //强制保存session即使它并没有变化
    resave: true,
    //强制将未初始化的session存储
    saveUninitialized: true, 
    //如果为true,则每次请求都更新cookie的过期时间
    rolling:true,
    //cookie过期时间 1天
    cookie:{maxAge:1000*60*60*24},    
    //设置session存储在数据库中
    store:new MongoStore({ mongooseConnection: mongoose.connection })   
}))
//4cookies插件，一般没用
// app.use(cookieParser())
app.use((req,res,next)=>{
	req.userInfo  = req.session.userInfo || {};
	next();	
    // console.log('userinfo',req.userInfo)
    // console.log('userinfo1',req.cookies)
});
//5处理静态页面
app.use(express.static('public'));
//添加处理post请求的中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//处理路由
app.use("/admin",require('./routes/admin.js'));

app.use("/",require('./routes/index.js'));
app.use("/user",require('./routes/user.js'));
app.use("/category",require('./routes/category.js'));
app.use("/article",require('./routes/article.js'));
app.use("/comment",require('./routes/comment.js'));
app.use("/resource",require('./routes/resource.js'));
app.use("/home",require('./routes/home.js'));
app.use("/product",require('./routes/product.js'));
app.use("/cart",require('./routes/cart.js'));
app.use("/order",require('./routes/order.js'));
app.use("/shipping",require('./routes/shipping.js'));


app.listen(3001,()=>{
	console.log('server is running at 127.0.0.1:3001')
});