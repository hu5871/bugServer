const svgCaptcha = require('svg-captcha')
const fse = require('fs-extra')
const path = require('path')
const BaseContorller = require('./base')
class UtilController extends BaseContorller {
  async captcha() {
    const { ctx } = this
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3,
    })
    ctx.session.captcha = captcha.text
    ctx.response.type = 'image/svg+xml'
    ctx.body = captcha.data
  }

  async sendcode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random().toString().slice(2, 6)
    console.log('邮箱' + email + '验证码' + code)
    ctx.session.emailcode = code

    const subject = 'front验证码'
    const text = ''
    const html = `<h2>bug社区</h2>验证码:<span>${code}</span>`
    const hasSend = await this.service.tools.sendMail(
      email,
      subject,
      text,
      html
    )
    if (hasSend) {
      this.message('发送成功')
    } else {
      this.error('发送失败')
    }
  }
  async uploadfile() {
    const ranNum=Math.random()
    console.log(ranNum);
    if ( ranNum > 0.5) {//模拟报错重试
      return (this.ctx.status = 500)
    }

    const { ctx } = this
    // console.log(ctx.request.files)
    const file = ctx.request.files[0]
    console.log(ctx.request.body);
    const { hash, name } = ctx.request.body
    console.log(hash);
    // console.log(file,name);
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)

    // const filePath=path.resolve()//文件最终存储的位置，合并之后
    if (!fse.existsSync(chunkPath)) {
      //当前这个chunkPath是否存在
      // 不存在新建一个
      await fse.mkdir(chunkPath)
    }

    await fse.move(file.filepath, `${chunkPath}/${name}`)

    this.message('切片上传成功')
    // await fse.move(file.filepath,this.config.UPLOAD_DIR+"/"+file.filename)

    // this.success({

    //   url:`/public/${file.filename}`
    // })
  }
  async checkfilechunks() {
    const { ctx } = this
    const { ext, hash } = ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    let uploaded = false
    let uploadedList = []
    if (fse.existsSync(filePath)) {
      // 文件存在
      uploaded = true
    } else {
      uploadedList = await this.getUploadedList(
        path.resolve(this.config.UPLOAD_DIR, hash)
      )
    }
    console.log(uploadedList)
    this.success({
      uploadedList,
      uploaded,
    })
  }

  async getUploadedList(dirPath) {
    //.开头的隐藏文件
    return fse.existsSync(dirPath)
      ? (await fse.readdir(dirPath)) || [].filter((name) => name[0] !== '.')
      : []
  }
  async mergefile() {
    const { ext, size, hash } = this.ctx.request.body
    const filepath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await this.ctx.service.tools.mergeFile(filepath, hash, size)
    this.success({
      url: `/public/${hash}.${ext}`,
    })
  }
}

module.exports = UtilController
