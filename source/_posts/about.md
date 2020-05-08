---
title: 有关上线的微信小程序说明
categories:
  - 未分类
copyright: true
abbrlink: b89a4960
date: 2017-12-19 23:09:40
tags:
---

舍友承包了一个娱乐向的小程序，最后把后端Tomcat部署到了这台服务器上的8080端口。如果想要通过网址访问，请使用http协议，因为8080端口没有用apache作反向代理，无法享受https加密传输。 链接： [http://111.230.136.225:8080/tuba_war](http://111.230.136.225:8080/tuba_war "http://111.230.136.225:8080/tuba_war")