const { Service } = require('egg')
const fse = require('fs-extra')
const path = require('path')

const nodemailer = require('nodemailer')

const userEmail = 'a1843275605@163.com'
const transporter = nodemailer.createTransport({
  service: '163',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'STYLZCNKKUPVFTNI',
  },
})
class ToolSerice extends Service {
  async sendMail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      to: email,
      cc: userEmail,
      subject,
      text,
      html,
    }

    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (e) {
      console.log('email error', e)
      return false
    }
  }
  async mergeFile(filepath, hash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, hash) //切片的文件夹
    let chunks = await fse.readdir(chunkDir)
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1])
    chunks = chunks.map((cp) => path.resolve(chunkDir, cp))
    const fileSize = Math.ceil(size)
    await this.mergeChunks(chunks, filepath, fileSize)
  }
  async mergeChunks(files, filepath, size) {
    try {
      const pipStream = (path, writeStream) =>
        new Promise((resolve) => {
          const readStream = fse.createReadStream(path)
          readStream.on('end', () => {
            fse.unlinkSync(path)
            resolve()
          })
          readStream.pipe(writeStream)
        })
       const fileMerge=files.map((file, index) => {
        pipStream(
          file,
          fse.createWriteStream(filepath, {
            start: index * size,
            end: (index + 1) * size,
          })
        )
      })
        await Promise.all('/',fileMerge)
    } catch (e) {
      console.log(e,'e');
    }
  }
}

module.exports = ToolSerice
