//解析token的中间件，
const jwt=require("jsonwebtoken")
// const { verify } = require("jsonwebtoken")


module.exports=({options,app})=>{
  return async function verify(ctx,next){
     if(!ctx.request.header.authorization){
       ctx.body={
         code:-666,
         message:"用户没登陆"
       }
       return
     }

     const token =ctx.request.header.authorization.replace("Bearer","")

     try{
       const res=await jwt.verify(token,app.config.jwt.secret)
       console.log(res);
       ctx.state.email=res.email
       ctx.state.userid=res._id
       await next()
     }catch(e){
       console.log(e);
       if(e.name==="TokenExpiredError"){
         ctx.body={
           code:-666,
           message:"登陆过期"
         }
       }else{
         ctx.body={
           code:-1,
           message:"用户信息出错"
         }
       }
     }
  }
}