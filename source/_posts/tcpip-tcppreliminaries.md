---
title: TCP/IP协议 TCP(Preliminaries)
categories:
  - TCP/IP
tags:
  - TCP/IP
  - 网络
copyright: true
url: 210.html
id: 210
abbrlink: ad7bd9a4
date: 2017-07-26 19:16:59
---

本章应是介绍TCP的引言，后面有5个章节是详细介绍TCP协议各个部分的。

一个设计思路，以及几个概念
-------------

在容易出现差错，不可靠的传输频道上，怎样确保传输的内容正确呢————检错码，纠错码，重传，TCP选择了检错码和自动重传。自动重传需要确认的信号，就有了Acknowledgement。发送者发送一个报文，接受者确认一次，然后发送者再发送一个报文，这样叫“停等”。停等的确认机制很简单，但是吞吐量很低很低，怎样提高效率呢。于是就有了滑动窗口，可变长的。 也就是说TCP协议机制的一大部分都是为了保证传输的可靠性的，这是TCP的一大特征，另两大特征一个是面向连接的，对应着端口号或者socket，另一个是字节流的，由顺序号体现。

<!-- more -->

TCP header的结构
-------------

[![https://gyazo.com/a26dff4dc9a324807b52c727b557a371](https://i.gyazo.com/a26dff4dc9a324807b52c727b557a371.png)](https://gyazo.com/a26dff4dc9a324807b52c727b557a371)

1.  源端口和目的端口与IP报文头中的源IP地址和目的IP地址一起构成了一个四元组，标识了一个TCP连接（或者叫Socket）。
2.  Sequence Number用来标识这个报文中的数据段在这个数据流中的位置。
3.  Acknowledgement Number用来标识已经确认收到的数据。
4.  Header Length用来表示头部长度，因为Options是变长的。
5.  6个标志位。
6.  Window Size明确了滑动窗口的大小，用于Window Update吧。
7.  Checksum校验和。
8.  Urgent Pointer还不清楚。
9.  Options中的是可选项，比如最大报文长度，时间戳，选择确认（SACK），窗口尺寸的缩放因子等等。