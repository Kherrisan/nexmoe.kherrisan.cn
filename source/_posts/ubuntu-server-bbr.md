---
title: Ubuntu Server配置BBR拥塞控制算法
categories:
  - TCP/IP
tags:
  - TCP/IP
  - 网络
copyright: true
url: 377.html
id: 377
abbrlink: 4aebf7b7
date: 2017-12-19 23:04:32
---

自从大佬告诉了我一个新的黑科技：BBR，可以显著提升服务器发送数据包的速度，尤其是在翻墙的时候，我给我的Digital Ocean上的服务器配置了BBR之后，果然下载速度得到了极大的提升，本地使用SEU Wlan下载大文件基本可以稳定在8Mbps左右。之前开了Shadowsocksr，下载Chromium的源码，任务管理器里的网络IO图真的是很漂亮。 ![](https://www.dokyme.cn/wp-content/uploads/2017/12/psb.png) 但是那次配置BBR没有记录，但是我国内的云服务器（就是你现在访问的这个）还没有升级过内核，因此想要给这台机子也升级一下内核，然后开启一下BBR。

# BBR简介

BBR是TCP层的一种拥塞控制算法，是Google设计并开源的。传统的拥塞控制算法通过丢包的情况判断网络情况，从而及时调整拥塞窗口的大小，这样使得整个网络处于稳定状态的同时，单个终端又能够享受尽可能大的传输速度。 目前大规模使用的应该是Qubic算法，我没有深入了解过这种算法，好像也是指数增长——丢包回落的形式，具体细节不清楚，有时间可以去了解一下。 知乎上各种吐槽TCP现在的拥塞算法太保守，不能够充分提升传输速度。BBR则是另外一套算法，能够通过更加合理科学的判断和调节，更加充分的提升传输速度。 ![](https://oss.kherrisan.cn/bbr.jpg) 在Linux 4.9之后的内核中自带BBR，因此如果是老版本内核想要享受BBR，就需要升级内核了。

# 配置过程

首先查看内核版本`uname -r`。 

![](https://oss.kherrisan.cn/Snipaste_2017-12-19_22-21-21.png) 

是4.4，64位的。接下来到 http://kernel.ubuntu.com/~kernel-ppa/mainline/ 这个网站找对应架构和版本的内核。我选了一个4.12的。

 ![](https://oss.kherrisan.cn/Snipaste_2017-12-19_22-26-48.png) 注意看清楚架构，我一开始把arm64看成了amd64，架构选错了是肯定没办法安装的。把他下载下来，用`wget`（刚刚那个网站是国外的，网速有点慢，自己想办法吧）。 一般几十MB，下载完成后，`sudo dpkg -i xxxxxx.deb` 安装完成，执行`sudo update-grub`，更新引导程序，并重启。 
 
 ![](https://oss.kherrisan.cn/Snipaste_2017-12-19_22-56-02.png) 
 
 重启完成，剩下的就只是修改几个配置项了。 
 
 `echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf` `echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf` 
 
 如果提示permission deny，并且sudo也没有用的时候，使用下面两条命令： 
 `sudo bash -c 'echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf'` 
 `sudo bash -c 'echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf'` 
 
 保存生效。 
 
 `sudo sysctl -p` 
 
 最后检查一下BBR是否开启。 
 
 `sudo sysctl net.ipv4.tcp_available_congestion_control` 
 
 如果返回如下，说明成功啦。 
 
 ![](https://oss.kherrisan.cn/Snipaste_2017-12-19_22-59-56.png) 
 
 的确，开启了BBR之后，下载大图的速度得到了显著的提升~