---
title: 'OS——The Abstraction: The Process'
categories:
  - 'OS:Three Easy Pieces'
tags:
  - OS
copyright: true
url: 665.html
id: 665
abbrlink: f2b26827
date: 2018-04-25 19:41:59
---

抽象的概念
-----

进程（Process），指运行着的程序。程序指静静躺在在外存中的数据和代码，是静态概念，但是进程是动态的概念，他反应了程序在运行的时候的功能和性质。 现代典型的操作系统都是同时运行数十个至数百个进程的，使用分时（Time Sharing）的技术来实现看似每个进程都能独占一个CPU的效果，当然，分时是要付出性能上的代价的。 进程的组成部分：

<!-- more -->

1.  内存：代码和数据存储的地方。
2.  寄存器：存储运算操作或输入输出操作中间结果以及状态信息的地方，。比较重要的有PC（Program Counter），SP（Stack Pointer）等。
3.  IO设备：如文件描述符（File Descriptor）。

进程的创建
-----

大致可以概况为以下几个步骤：

1.  把代码和数据从外存载入内存（地址空间）中。如今OS读取程序数据，载入内存的操作可以以惰性的方式执行，即要多少读取多少，当然这需要借助置换（swaping）和分页（paging）机制。
2.  分配栈空间，并初始化。
3.  分配堆空间，并初始化。
4.  初始化一些IO设备信息，如3个文件描述符（fd）：stdout，stdin，stderr。
5.  最后，跳转到main子程序，正式开始运行。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-04-25_19-28-45.jpg)

进程的状态
-----

*   运行（running）：此时进程拥有CPU资源，能够逐行执行指令、进行运算、发起IO请求。
*   就绪（ready）：此时进程随时可以开始或继续运行，但是OS选择忽视了他，而是去垂青其他进程了。
*   阻塞（blocked）：正在运行的进程发起了IO操作后，IO设备开始发送或接收数据，此时该进程处于等待IO操作完成的状态，也叫阻塞状态。此时CPU一般会分配给其他进程使用。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-04-25_19-33-36.jpg) 正在运行的进程可能会被OS调出而进入就绪状态，就绪的进程可能会被OS调入，进入运行状态。当进程在运行过程中发起IO操作，会变为阻塞状态，好像被冻住了一样。处于阻塞状态的进程无法继续运行（数据没准备好），直到IO操作完成后，变为就绪状态。

数据结构
----

可以想象，OS通过一个列表来记录每个进程的状态信息。记录一个进程相关状态信息的数据结构叫做PCB（Process Control Block）。因为常见的OS一般是用C语言编写的，因此这样的数据结构也常常用C语言来描述。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-04-25_19-41-28.jpg)