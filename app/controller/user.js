const BaseContorller = require('./base')
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const path = require('path')
const fse= require('fs-extra')
const HashSalt = 'github:hu5871'

const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  passwd: { type: 'string' },
  captcha: { type: 'string' },
}

class UserController extends BaseContorller {
  async login() {
    const { ctx, app } = this
    const { email, captcha, passwd } = ctx.request.body
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }
    const user = await ctx.model.User.findOne({
      email,
      passwd: md5(passwd + HashSalt),
    })
    console.log(user);
    if (!user) {
      return this.error('用户名密码错误')
    }

    // 用户信息加密成token  返回

    const token = jwt.sign({
      email,
      _id: user._id
    },app.config.jwt.secret, {
      expiresIn: '1d',
    })
    this.success({token,email,nickname:user.nickname})
  }
  async register() {
    const { ctx } = this
    try {
      //校验传递的参数
      ctx.validate(createRule)
    } catch (e) {
      return this.error('参数校验失败', -1, e.errors)
    }

    const { email, passwd, nickname, captcha,emailCode } = ctx.request.body

    if (captcha.toUpperCase() === ctx.session.captcha.toUpperCase()) {
      //邮箱是否重复
      if(emailCode !== ctx.session.emailCode){
        return this.error("邮箱验证码错误")
      }
      if (await this.checkEmail(email)) {
        this.error('邮箱重复')
      } else {
        const res = await ctx.model.User.create({
          email,
          nickname,
          passwd: md5(passwd + HashSalt),
          emailCode
        })

        if (res._id) {
          this.message('注册成功')
        }
      }
    } else {
      this.error('验证码错误')
    }
    // this.success({name:'张三'})
  }
  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email })

    return user
  }
  async verify() {
    //校验用户名是否存在
  }

  async info() {
    const {ctx}=this
    const {email}=ctx.state
    const user=await this.checkEmail(email)
    this.success(user)
  }

  async isFollow() {
    const {ctx} = this
    const me= await ctx.model.User.findById(ctx.state.userid)
    console.log(me);
    // 我的follow字段里是否有传来的这个用户id
    const isFollow=!!me.following.find(id=>id.toString()===ctx.params.id)
    this.success({isFollow})
  }
  async follow(){
    const {ctx} = this
    const me =await ctx.model.User.findById(ctx.state.userid)
    console.log(me.following);
    const isFollow =!!me.following.map(id=>id.toString()).indexOf(ctx.params.id)
    console.log(isFollow,'isFollow');
    if(isFollow){
      me.following.push(ctx.params.id)
      me.save()
      this.message("关注成功")
    }

  }
 async updateInfo(){
    const {ctx} =this
    console.log(ctx.state.userid);
    const me= await ctx.model.User.findById(ctx.state.userid)
    if(me){
      const {avatar,nickname}=ctx.request.body
      me.avatar=avatar
      me.nickname=nickname
      me.save()
      this.message("更改成功")
    }
    
  }
  async addAvatarImg(){
    const { ctx } = this
    // console.log(ctx.request.files)
    const file = ctx.request.files[0]
    console.log(file);
    console.log( ctx.request.body);
    const { hash, name } = ctx.request.body
    console.log(hash, name );
    // console.log(file,name);
    // const chunkPath = path.resolve(this.config.AVATAR_DIR, hash)

    // // const filePath=path.resolve()//文件最终存储的位置，合并之后
    // if (!fse.existsSync(chunkPath)) {
    //   //当前这个chunkPath是否存在
    //   // 不存在新建一个
    //   await fse.mkdir(chunkPath)
    // }

    // await fse.move(file.filepath, `${chunkPath}/${name}`)
    await fse.move(file.filepath,this.config.AVATAR_DIR+"/"+file.filename)
    this.success({

      url:`${ctx.request.protocol}://${ctx.request.host}/public/avatar/${file.filename}`
    })

  }
  async cancelFollow(){
    const {ctx} =this
    const me= await ctx.model.User.findById(ctx.state.userid)

    // 把用户从我的following数组中删掉
    const index= me.following.map(id=> id.toString()).indexOf(ctx.params.id)
    if(index > -1){
      me.following.splice(index,1)
      me.save()
      this.message("取消成功")
    }

  }

  async following(){
    const {ctx} =this
    const users=await ctx.model.User.findById(ctx.params.id).populate("following")
    this.success(users.following)
  }


  async follows(){
    const {ctx} =this
    const users=await ctx.model.User.find({following:ctx.params.id})
    this.success(users)
  }

  async articleStatus(){
    const {ctx} =this
    const me =await ctx.model.User.findById(ctx.state.userid)
    const like= !!me.likeArticle.find(id=>id.toString() === ctx.params.id)
    const dislike=!!me.disLikeArticle.find(id=>id.toString()=== ctx.params.id)
    this.success({like,dislike})
  }

  async likeArticle() {
    const {ctx} =this 
    const me= await ctx.model.User.findById(ctx.state.userid)
    if(!me.likeArticle.find(id=>id.toString() === ctx.params.id)){
      me.likeArticle.push(ctx.params.id)
      me.save()
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id,{$inc:{like:1}})
      return this.message("点赞成功")
    }
  }

  async cancelLikeArticle() {
    const {ctx} =this 
    const me =await ctx.model.User.findById(ctx.state.userid)
    const index = me.likeArticle.map(id=> id.toString()).indexOf(ctx.params.id)
    if(index> -1){
      me.likeArticle.splice(index,1)
      me.save()
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id,{$inc:{like:-1}})
      return this.message("取消点赞成功")
    }
  }
}

module.exports = UserController
