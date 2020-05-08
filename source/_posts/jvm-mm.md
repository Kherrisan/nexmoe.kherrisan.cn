---
title: JVM——内存区域和内存溢出异常
categories:
  - JVM
tags:
  - java
  - jvm
copyright: true
url: 536.html
id: 536
abbrlink: e9b37112
date: 2018-02-16 16:00:32
---

内存区域
----

作为VM，Java Virtual Machine模拟了操作系统的一些功能，其中之一就是对内存进行管理。JVM内存大致分为下面几个区域： [![](https://raw.githubusercontent.com/ACFLOOD/MarkdownPictures/master/MemoryArea.jpg)](https://raw.githubusercontent.com/ACFLOOD/MarkdownPictures/master/MemoryArea.jpg)

1.  方法区，是线程共享的。用于存储已被JVM加载的类信息、常量、静态变量、编译后的代码等数据。过去开发者常常称这个区域为“永久代”，因为Hotspot虚拟机GC在管理方法区的时候是采用永久代的方式。当然Hotspot以及开始逐渐放弃永久代。本来垃圾回收（GC）在方法区就是较为少见，且较为令人满意的，这区域的内存的主要回收目标是常量池的回收和类的卸载，但这个区域的回收是十分有必要的。当内存无法满足需要时也会抛出OutOfMemoryError。

<!-- more -->

2.  虚拟机栈，是线程私有的，因为每个线程的函数调用情况可能各不相同。每个方法在执行的同时会创建一个栈帧（frame），用于存储局部变量表、操作数、动态链接、方法出口等信息。在JVM规范中，VM栈可能会因为线程请求过多的栈（函数调用过多）导致抛出StackOverflowError，也有可能因为VM动态扩展VM栈的时候无法申请到足够的内存导致抛出OutOfMemoryError。
3.  本地方法栈，和虚拟机栈类似，是线程私有的，区别在于虚拟机栈保存的是字节码指令的栈，而本地方法栈保存的是本地方法服务。Hotspot中本地方法栈和VM栈是合一的。
4.  堆（heap），是线程共享的。和数据结构中的堆不同，这个堆就是用来描述内存中的一块区域的名字。一般来说堆是各个区域中最大的一块。JVM规范中指出：**所有的对象实例以及数组都要在堆上分配**。但是随着JIT编译器的发展与逃逸分析技术的成熟，栈上分配、标量替换优化技术将会导致这样的分配也不是绝对的了。堆在物理内存中可以是不连续的也可以是连续的。在堆无法扩展时（new对象过多）会抛出OutOfMemoryError。
5.  程序计数器。计算机组成原理中一个很重要的概念就是存储程序，其中用来标记指令执行的进度、保持或改变指令执行顺序的就是程序计数器（Program Counter简称PC，或Instruction Pointer简称IP）。到了JVM中，也有程序计数器。由于每个线程都有自己的程序运行情况，因此每个线程都要由一个自己的PC，指向字节码指令的地址。JVM中的PC占用的内存空间很小，几乎可以忽略不计，也不会抛出OutOfMemoryError。

此外，还有两个概念。

1.  运行时常量池。是方法区的一部分，用于存放编译期生成的各种字面量和符号引用。
2.  直接内存。物理内存（当然还是在操作系统管理之下的）而不是JVM中的内存。

对象
--

### 对象的创建

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/%E7%BB%98%E5%9B%BE1.jpg)

### 对象内存布局

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/%E7%BB%98%E5%9B%BE4.jpg)

### 对象锁状态

对象处于不同的状态时，对象头的布局也会产生变化，对象头的格式并不是像TCP报文头这样子一直不变的。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-05-05_17-53-42.jpg) 锁有重有轻，有乐观有悲观，从这么多角度来将锁的概念分类并区分设计，目的就是为了应对不同的并发场景，最大程度提升系统性能。

### 对象的访问定位

目前主流的访问方式有两种：句柄和直接指针。

1.  句柄：在JVM堆中会有一个句柄池，引用变量存储的就是句柄在句柄池中的地址，句柄在存放实例池中的对象实例数据以及方法区的对象类型数据。当对象在JVM堆中被移动的时候，不需要改变引用变量的值，只需要改变句柄中的值即可。
2.  直接指针：引用变量直接存储JVM堆中对象实例地址，对象实例数据中保留一个指针指向方法区中的对象类型数据。速度比使用句柄更快一些。

Hotspot使用的是第二种。