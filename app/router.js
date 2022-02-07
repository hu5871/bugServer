'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app
  const jwt = app.middleware.jwt({ app })

  router.get('/', controller.home.index)

  //图片验证码
  router.get('/captcha', controller.utils.captcha)
  //邮箱验证码
  router.get('/sendcode', controller.utils.sendcode)
  //上传文件
  router.post('/uploadfile', controller.utils.uploadfile)
  //合并文件
  router.post('/mergefile', controller.utils.mergefile)
  //检查是否有文件切片存在
  router.post('/checkfilechunks', controller.utils.checkfilechunks)
  router.group({ name: 'user', prefix: '/user' }, (router) => {
    const { 
      info, register, login, verify,addAvatarImg,
      updateInfo,
      isFollow,follow
      ,cancelFollow,following,follows,articleStatus,
      likeArticle,cancelLikeArticle
     } = controller.user

    router.post('/register', register)
    router.post('/avatar',addAvatarImg)
    router.post('/updateinfo',jwt,updateInfo)
    router.get('/info', jwt, info)
    router.post('/login', login)
    router.post('/verify', verify)
    router.get('/detail',jwt, info)

    router.get('/follow/:id', jwt,isFollow)
    router.put('/follow/:id', jwt, follow)
    router.delete('/follow/:id', jwt, cancelFollow)

    router.get('/:id/following',following)
    router.get('/:id/followers', follows)

    router.get('/article/:id', jwt, articleStatus)
      // // .put点赞，。delete取消点赞
      router.put('/likeArticle/:id', jwt, likeArticle)
      router.delete('/likeArticle/:id', jwt, cancelLikeArticle)
  })

  router.group({name:'article',prefix: '/article'}, (router) => {
    const { index,create,detail } = controller.article
    router.get('/',index)
    router.get('/:id', detail)
    router.post('/create',jwt,create)
  })
}
