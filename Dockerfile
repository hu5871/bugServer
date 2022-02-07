#指定node镜像的版本
FROM node:14.16.1
#移动当前目录下面的文件到app目录下
ADD . /app/
#进入到app目录下面，类似cd
WORKDIR /app

#安装依赖
RUN npm config set registry http://r.npm.taobao.org/ && \
 npm config set sass_binary http:///npm.taobao.org/mirrors/node-sass/ && \
 npm i
 #对外暴露的端口
EXPOSE 3000

#程序启动脚本
CMD ["npm","run","start:docker"]