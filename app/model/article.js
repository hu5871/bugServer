module.exports=app=>{
  const mongoose=app.mongoose
  const Schema=mongoose.Schema
 const ArticalSchema=new Schema({
   _v:{type: Number,select:false},
   title:{type: String,required:true},//标题
  //  article_id:{type:Number,required:true,default:0},//文章id
  article:{type: String,required:true,select:false},//文章原信息
  article_html:{type: String,required:true},//解析之后要显示的文章html
   author:{type: Schema.Types.ObjectId,ref:"User",required:true},//作者
   views:{type:Number,required:true,default:0},//被访问多少次
   links:{type:Number,required:true,default:0},//点赞
   dislike: { type: Number, required: false, default: 0 },//不喜欢
 },{timestamps:true})

 return mongoose.model("Artical",ArticalSchema)
}