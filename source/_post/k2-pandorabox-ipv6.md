---
title: K2-PandoraBox-IPV6（教育网）配置过程
categories:
  - 未分类
copyright: true
url: 1031.html
id: 1031
date: 2018-11-25 18:06:38
tags:
---

**坐标：东南大学九龙湖校区梅园4C某宿舍** 昨晚向某个同学要了一台斐讯K2路由器，本想替换掉宿舍的TP-Link来提供5GHz频段的Wifi，因为2.4GHz频段的Wifi对我MacbookPro2018的USB-HUB以及蓝牙干扰太过于严重。忽然想把宿舍隔壁床位的IPV6网口利用起来。 之前尝试过将PC网口与IPV6网口直连上网，体会到了飞一般的网速，举个例子：下载一个ubuntu-desktop的镜像，大概只需要两分多钟就可以下载完毕。

<!-- more -->

K2固件相关工作
========

1.  刷**breed**不死鸟固件。
2.  刷**PandoraBox**固件。

联网
--

在浏览器中打开`192.168.1.1`，输入默认密码`admin`，进入`PandoraBox`管理页面。 由于我此时已经将`IPV6`网口与路由去`WAN`口相连，因此在网络-接口界面可以看到`WAN6`口已经通过`DHCP`从上游路由器（DHCP服务器）得到了IPV6网址。 如果插入了`IPV6`网线，但页面上没有`IPV6`地址，可以尝试点击“连接”按钮重新连接上游路由器，并等待1分钟左右，一般就可以获得`IPV6`地址了。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-11-24_13-35-37.png)

下载所需程序
------

打开一个控制台，通过ssh连到路由器上，**密码默认为admin**：

```
ssh root@192.168.1.1

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-11-24_13-37-31.png) 路由器的操作系统也是Linux的一种，因此熟悉PC端Linux操作的人应该不会有太大困难。

```
opkg update
......
opkg install ip6tables kmod-ipt-nat6

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-11-24_13-38-30.png) 安装2个程序，装好了之后回到浏览器。

配置
--

进入网络-接口-LAN-DHCP服务器页面，勾选**总是通告默认路由**。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/3adea32eb5cb208d4e481e3321a0b88d.png) 进入网络-防火墙-自定义规则页面，添加一条规则，并**重启防火墙**。

```
ip6tables -t nat -A POSTROUTING -o eth0.2 -j MASQUERADE

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/2ade23d4f609146101a4df4396b8621f.png) 回到路由器终端，找出IPV6的默认路由网关地址，然后添加一条新的路由规则：

```
ip -6 route | grep default
假设输出的地址为xxxx::xxxx
route -A inet6 add default gw xxxx::xxxx dev eth0.2

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/339f07f8fd170d0765c79ed2027d2105.png) 最后，重启一下相关服务。

```
/etc/init.d/firewall restart
/etc/init.d/network restart

```

测试连通性
-----

重启结束之后，PC就可以`ping`通谷歌了，如果`ping`不通，可以重连一下路由器的`Wifi`。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/259f944fc4663699a06f4f8ef77f6022.png)

打开网页
----

离终点只有一步之遥了：由于**chrome**浏览器采用的策略是IPV6和IPV4共存，解析网址的`IPV6`和`IPV4`地址，然后优先与`IPV6`地址发起连接，当连接的时间超过300ms（具体数值不清楚）时，说明链路中的`IPV6`机制有问题，就会切换到`IPV4`地址发起`TCP`连接，最后发送`HTTP`请求报文。 这样的流程对于国内想要通过`IPV6`翻墙的用户而言是不合适的，因为连接远程主机的延迟一般会比较高，导致链路正常联通的`IPV6`链路被浏览器舍弃，转而尝试去访问无法连接的`IPV4`地址。 而我们希望的理想的过程是，浏览器先解析IPV6地址，只要`IPV6`地址存在，就直接去连接该地址，不要去管`IPV4`地址是多少。或者说串行地去请求做`IPV6`和`IPV4`地址的`DNS`解析操作。在`DNS`协议中，`IPV6`和`IPV4`对应报文头部的`type`值分别为`AAAA`和`A`。此外，需要在本机配置`DNS`服务器地址为本机地址。 我在Github上找到了这么一个好东西： [adamyi/v6dns](https://github.com/adamyi/v6dns) 这是一个`DNS`服务的中继程序，会在某个端口上监听所有`DNS`报文，并按照下面的逻辑运行： ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/fafa577fd8ba1491f759bc03e039eacb.png) 为了解决`IPV4/6`优先级的问题，可以这么做：在本地运行v6dns程序，监听本机的53端口，并设置`DNS`查询服务器为某个远程的`DNS`服务器地址。这样，如果能够查询到某个网站的`IPV6`地址，那就直接发起连接，如果查不到，就再查询其`IPV4`地址。

最终总结
----

本文介绍了在教育网环境下使用K2的PandoraBox固件进行配置最终访问`IPV6`网站的过程，其中最核心的步骤就是配置`NAT6`，`NAT6`是基于`IPV6`的网络地址转换，目的是将上游`DHCP6`分配的一个`IPV6`地址转换成内网的多个地址分配给多个主机。 最终测试的效果不佳，在Youtube上看视频时常常出现卡顿的现象，记忆中原来看视频能够达到4K画质，并且帧率为60fps的网速水准。推测原因如下：

1.  K2路由器不够稳定。
2.  PandoraBox固件或NAT6机制不够成熟。