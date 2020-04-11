---
title: TCP/IP协议 Introduction
categories:
  - TCP/IP
tags:
  - TCP/IP
  - 网络
copyright: true
url: 186.html
id: 186
date: 2017-07-18 17:38:05
---

一边看书，一边做一些笔记。刚刚开始看第一章，书是全英文版的，一上来就感觉很难，一改这类书第一章都是导论所以很简单的印象。

架构原则
----

因特网架构的首要原则主要考虑这几个关键词：高效，复用，连接已有的网络。 二级原则包含下面几个方面：

<!-- more -->

1.  发生了loss也要继续。
2.  支持多种服务。
3.  适配多种网络。
4.  支持分布式资源的管理。
5.  高效。（高效性）
6.  新主机的接入要足够方便。（拓展性）
7.  资源必须可数。（高效性）

几个基本概念： packet（包） datagram（数据报） connection（连接） 还有两个原则，这两个原则我没怎么看懂，所以想先放一放。

#### end to end argument

#### fate sharing

设计与实现
-----

[![https://gyazo.com/98b166aba720915bc11aa51544bca788](https://i.gyazo.com/98b166aba720915bc11aa51544bca788.png)](https://gyazo.com/98b166aba720915bc11aa51544bca788) 这是OSI7层模型，下三层是所有设备都有的，上四层是只有主机才有的。各层的分工各不相同。在OSI层结构的基础上，每一层能够**复用**数据，能够**封装**上层的数据，封装的方式是在上层的数据最前加上一个header，有的层会在最尾端加上trailer，封装了之后就不必关心上层协议下来的数据的内容。每层协议可以封装多个上层协议的PDU（协议数据单元）。 这里的**复用**是指，每一层所要封装的上层PDU可以是来自不同的协议的，比如IP层可以封装TCP和UDP的就好像每一层都有一个槽，槽里面放的是什么东西是可以变的。为了能够正确的解复用，需要在封装的时候在header部分加上一些标识符来表面PDU是什么类型的，否则接收放在拆包的时候就无法正确地处理了。 [![https://gyazo.com/bdfc6e943b517149e9e7b9c1264254f5](https://i.gyazo.com/bdfc6e943b517149e9e7b9c1264254f5.png)](https://gyazo.com/bdfc6e943b517149e9e7b9c1264254f5) [![https://gyazo.com/38587d2012ea9ee270029e19792bf1a4](https://i.gyazo.com/38587d2012ea9ee270029e19792bf1a4.png)](https://gyazo.com/38587d2012ea9ee270029e19792bf1a4) 上面这张图描述了一个理想的网络结构，两台主机，中间一台交换机一台路由器，交换机只包含两层，路由器包含了三层，所以路由器可以用来联通不同类型的网络。当今时代也有很多路由器和交换机能充当主机的身份的，比如路由器能够供管理员登陆，那就说明肯定有应用层了。 网络层以上的层使用end to end协议，只有主机才使用这些协议（因为中继设备没有网络层以上的层），网络层使用hop to hop协议，所有主机和中继设备都会用到。 注：交换机或者说网桥不被普遍地认为是中继设备因为他们不被编址，换句话说，从网络层设备的角度看，交换机是透明的。

TCP/IP协议栈的结构和协议
---------------

[![https://gyazo.com/3c84782b0a61cc631ad94a515439d7d8](https://i.gyazo.com/3c84782b0a61cc631ad94a515439d7d8.png)](https://gyazo.com/3c84782b0a61cc631ad94a515439d7d8) 有的层还包含一些附属的协议，协议很多而且后面的章节还会详细的介绍所以这里就不一一罗列了。 有关复用，解复用，封装的问题再一次得到了体现。如以太网帧包含16位的以太网类型字段（ipv4，ipv6，arp），IP数据报包含8位的协议字段（ICMP，IPV4，TCP，UDP），在传输层则使用端口号来进行解复用。 [![https://gyazo.com/4078dc6dfc4f440015d229351c2f9fb7](https://i.gyazo.com/4078dc6dfc4f440015d229351c2f9fb7.png)](https://gyazo.com/4078dc6dfc4f440015d229351c2f9fb7)