---
title: JUC——ReentrantLock
categories:
  - JUC
tags:
  - java
  - 并发
copyright: true
url: 994.html
id: 994
abbrlink: 994661cc
date: 2018-10-06 16:32:27
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/ce7ae3e6bb8915c9daaf1b1cc426ad33.png) 单线程持有的、可重入的锁。

> 一个可重入的互斥锁定 Lock，它具有与使用 synchronized 方法和语句所访问的隐式监视器锁定相同的一些基本行为和语义，但功能更强大。ReentrantLock 将由最近成功获得锁定，并且还没有释放该锁定的线程所拥有。当锁定没有被另一个线程所拥有时，调用 lock 的线程将成功获取该锁定并返回。如果当前线程已经拥有该锁定，此方法将立即返回。可以使用 isHeldByCurrentThread() 和 getHoldCount() 方法来检查此情况是否发生。

<!-- more -->

ReentrantLock有3个内部类，一个Sync类及其衍生出的两个子类FairSync和NonFairSync，代表公平锁和非公平锁。

公平性的控制
======

AQS的acquire方法的第一步就是通过子类的tryAcquire方法来尝试获得锁。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/2569c482e46833c20b6a967974e094df.png)

1.  判断锁有没有被其他线程持有，如果在该线程之前没有其他等待线程并且CAS操作修改锁状态成功了，说明加锁成功。
2.  如果锁被某线程持有，而且这个线程就是自己，给状态数值加上一个数（1），证明自己重入了。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/7f3f467fbb52491518ef0564f3130157.png) 不会判断是否有更早的等待线程。

release
=======

在AQS中，首先tryRelease，然后唤醒后继节点。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/6ba5210f4f36b59903e9ce079c581add.png) tryRelease会让锁状态state减少1，如果变为0了，说明释放锁的次数和锁重入的次数相等了，当前线程已经完全释放了锁。值得注意的是，由于一次只会有一个线程调用tryRelease，因此这里对state的修改不需要CAS。 如果tryRelease返回true了，说明这个线程完全释放了锁，可以唤醒后继节点了。

tryLock(timeout)
================

带有延迟参数的加锁方法，这个方法是Lock类与synchronize关键字相比的一大优势，他提供了有限时间内尝试获取锁的机制，而不是无穷无尽的等待。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/fa8f23c158fb51ae37050603f81db14a.png)

1.  调用tryAcquire尝试获取锁。
2.  调用doAcquireNanos方法。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-10-06_15-45-27.jpg) doAcquireNanos方法和acquireQueued方法很相似。

1.  计算ddl，即实际到期时间。
2.  调用addWaiter，在队列尾部插入一个节点。
3.  进入死循环，检查该节点是否有资格拿锁（即是否为第二个节点），如果有资格，tryAcquire。
4.  计算距离ddl还剩多长时间记为delta。
5.  如果delta<0，说明已经超时，acquire失败。
6.  如果该节点应该睡眠，并且delta比自旋时间阈值大的话，调用LockSupport.parkNanos让该线程睡眠指定时间。
7.  如果该线程发生了中断，就抛出interrptedexception。
8.  如果以上都不满足，就一直自旋，直到拿到锁或者超时或者中断。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/95a2820e520129712a21853d29f2346c.png)

lockInterruptibly
=================

通过lockInterruptibly加锁，如果锁已经被其他线程获取，那么有两种情况能使得当前线程能够被唤醒：

1.  当前线程拿到锁了。
2.  当前线程被其他线程中断了。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/b5ba5cfbeeaa64d4b215575ea40b25ef.png) 如果某个线程在睡眠过程中被其他线程中断了，acquireQueued会返回true给acquire，而acquire紧接着会调用selfInterrupt方法来使得当前线程的interrupted标志位为true，但并不会抛出异常，而doAcquireInterruptible会抛出InterruptException。 根据LockSupport.park的语义，unpark操作和interrupt方法都能够唤醒某个沉睡的线程。