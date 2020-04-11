---
title: Linux——进程管理
categories:
  - OS
tags:
  - Linux
  - OS
copyright: true
url: 923.html
id: 923
comments: false
date: 2018-08-26 18:36:06
---

概念
==

进程（Process）是处于执行期程序以及其相关资源的总和，不仅仅局限于可执行程序代码，通常还包括其他资源如打开的文件、挂起的信号、内核内部数据、处理器的状态、一个或多个内存映射的内存地址空间以及一个或多个执行线程、全局变量数据段等。 在现代操作系统中，提供两种虚拟机制：虚拟CPU和虚拟内存，都给进程一种独占设备的假象。

<!-- more -->

* * *

进程描述符
=====

内核把进程存放在一个叫**任务队列**的双向链表中。链表中的每一个项的类型为**task_struct_**_。task_struct结构体相对比较大，在32位机器上大约有1.7KB。

```
struct task_struct{
    unsigned long state;
    int prio;
    unsigned long policy;
    struct task_struct *parent;
    struct list_head tasks;
    pid_t pid;
    ......
}

```

pid和tpid
--------

pid是进程的唯一标识符，Linux中使用task_struct来表示进程和线程，为了能够表达多个线程从属于一个进程的意思，使用tpid来记录**线程组**的标号。某个进程的第一个创建的线程的pid和tpid相同，其后创建的线程的tpid为第一个线程的pid。

内核栈
---

一个进程在调用系统调用的时候，必然会陷入到内核态中，此时运行的代码所操作的栈不再是用户态的进程栈，而是一个内核栈。在内核栈的底部（从高地址生长的栈）存放了一个**thread_info_**_，这个结构指向当前进程的task_struct，从而使系统能够高效地获取到当前进程的信息。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-08-26_14-31-03.png)

* * *

进程状态
====

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-08-26_14-47-35.png) Linux进程一般有5种状态

1.  RUNNING：进程在运行或者在运行队列中等待运行
2.  INTERRUPTIBLE：可中断
3.  UNINTERRUPTIBLE：不可中断
4.  TRACED\\STOPPED：被追踪\\暂停，比如在用gdb调试的时候
5.  DEAD：退出

* * *

进程的创建
=====

fork系统调用
--------

1.  为新进程创建一个内核栈、thread_info和task_struct
2.  检查当前用户有没有超出分配资源的限制
3.  将统计信息清0或初始化
4.  子进程变为UNINTERRUPTIBLE
5.  分配一个pid
6.  根据clone的参数，拷贝父进程的对应资源（文件、系统信息、信号处理函数、地址空间和命名空间等）
7.  扫尾 传统的fork会拷贝所有父进程的所有资源，Linux使用了一种**写时拷贝**的技术：当fork时先只做浅拷贝（共享内存空间），当有数据需要写入内存空间时，再拷贝原内存空间副本给子进程，并做写入操作。这样，**fork的职责就只剩下：复制页表、分配进程描述符**。 Linux会倾向于让子进程先执行，因为他希望子进程能够尽快调用exec，这样就可以避免写时拷贝的开销。

vfork
-----

在使用了写时拷贝的技术后，vfork与fork的区别就仅仅在于vfork不需要复制父进程页表。

线程
==

在Linux中，线程仅仅是进程进行共享资源的手段，他使用完全相同的task_struct结构来维护线程信息。因此创建线程就相当于分配新的task_struct。

创建线程
----

可以通过clone的参数来指定创建线程时需要共享的资源：打开的文件、文件系统资源、信号响应程序等。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-08-26_15-11-54.png)

内核线程
----

一些内核任务由内核线程执行，内核线程与普通线程的区别在于内核线程没有独立的地址空间，只在内核空间执行。他参与内核调度也参与内核抢占。 Linux内核程序是一个进程，其中的多个指令流分别运行在多个内核线程中。 常用的内核线程：

*   kthreadd：管理调度其他内核线程
*   events：将软硬时间包装为event，并分发给感兴趣的线程
*   pdflush：脏页写回
*   kswapd0：回收内存

进程终结
====

进程终结有两种情况：

*   exit系统调用
*   接收到了不能处理但也不能忽略的信号或异常 进程退出时，一般会先释放内存空间资源，释放文件资源，设置退出代码，并向父进程发送退出的信号。此时进程还有内核栈、thread_info、task_struct这三样没有被释放，并且其状态变为ZOMBIE。

进程终结时，内核必须释放他所占用的所有资源并且告知父进程。

1.  修改task_struct中的标志
2.  删除任一内核定时器
3.  释放mm_struct，如果这个地址空间计数变为0，则彻底释放这个地址空间。

5.  分别递减文件描述符和文件系统数据的引用计数，如果计数变为0，则彻底释放。
6.  设置task\_struct的exit\_code为exit提供的参数
7.  向父进程发信号，给该进程的子进程重新找养父（找养父的规则是在终结进程的线程组中找存活的其他进程——即该进程是否还有存活的线程，如果没有，则选择init进程），线程状态变为ZOMBIE
8.  schedule切换到新的进程

在ZOMBIE状态中，进程所占有的资源只有内核栈、thread\_info、task\_struct，此时进程存在的唯一目的是向他父进程提供信息。