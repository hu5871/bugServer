/* eslint valid-jsdoc: "off" */

'use strict'
const path=require("path")
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {})

  // use for cookie sign key, should change to your own and keep security
  // console.log('appInfo',appInfo);
  config.keys = appInfo.name + '_1640893033555_3109'
  config.multipart = {
    mode: 'file',
    whitelist: () => true,
  }
  config.UPLOAD_DIR=path.resolve(__dirname,"..",'app/public')
  config.AVATAR_DIR=path.resolve(__dirname,"..",'app/public/avatar')
  // add your middleware config here
  config.middleware = []

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }
  // useUnifiedTopology:true
  return {
    ...config,
    ...userConfig,
    security: {
      csrf: {
        enable: false,
      },
    },
    mongoose: {
      client: {
        url: 'mongodb://127.0.0.1:27017/fronthub',
        options: {},
      },
    },
    jwt: {
      secret: 'github:hu5871',
    },
  }
}
