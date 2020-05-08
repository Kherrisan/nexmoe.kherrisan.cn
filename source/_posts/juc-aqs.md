---
title: JUC——AQS
categories:
  - JUC
tags:
  - java
  - 并发
copyright: true
url: 991.html
id: 991
abbrlink: 794bdde7
date: 2018-10-06 15:08:33
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/6de3aa05c56e9c4d58266c20b05abb9c.png) AQS————AbstractQueuedSynchronizor，队列同步器，AQS是一个抽象类，它为开发者编写同步工具（比如锁、信号量）提供了开发框架，这个框架封装了对线程和竞态条件的细节，使得开发者能够只关注于锁的逻辑，而无需关注线程的维护以及竞态条件的控制。 JUC中很多锁都是基于AQS进行开发的。

<!-- more -->

Node类
=====

由于AQS是队列，需要有一个类来封装每个节点的状态，Node类代表队列中的每一个节点。除了构造函数之外没有方法。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/910b221f6636d393b151869bb9fab175.png)

属性
--

1.  waitStatus，等待状态。状态值可能为SIGNAL(-1)、CANCELLED(1)、CONDITION(-2)、PROPAGATE(-3)、0。
2.  prev，队列中的前驱节点。
3.  next，队列中的后继节点。
4.  thread，线程对象
5.  nextWaiter，

AQS实现——Mutex
============

AQS框架使用了模板方法模式来实现自身功能，某个锁的实现通常要继承AQS并重写数个方法，因此脱离具体的锁去谈AQS是有些不切实际的。

```
public class MutexLock implements Lock {  

    private static final int LOCK = 1;  
    private static final int UNLOCK = 0;  

    private final Sync sync = new Sync();  

    @Override  
    public void lock() {  
        sync.acquire(LOCK);  
    }  

    @Override  
    public void lockInterruptibly() throws InterruptedException {  
        sync.acquireInterruptibly(LOCK);  
    }  

    @Override  
    public boolean tryLock() {  
        return sync.tryAcquire(LOCK);  
    }  

    @Override  
    public boolean tryLock(long time, TimeUnit unit) throws InterruptedException {  
        return false;  
    }  

    @Override  
    public void unlock() {  
        sync.release(UNLOCK);  
    }  

    @Override  
    public Condition newCondition() {  
        return sync.newCondition();  
    }  

    public boolean isLock() {  
        return sync.isHeldExclusively();  
    }  

    /** 
     * 一般同步器都使用静态内部类去控制外部类的状态 
     */  
    private static class Sync extends AbstractQueuedSynchronizer {  
        /** 
         * 独占模式 
         * * 
         */  
        // 获取锁  
        @Override  
        protected boolean tryAcquire(int arg) {  
            if (compareAndSetState(UNLOCK, LOCK)) { //状态为0的时候获取锁  
                setExclusiveOwnerThread(Thread.currentThread());  
                return true;  
            }  
            return false;  
        }  

        //释放锁  
        @Override  
        protected boolean tryRelease(int arg) {  
            if (getState() == UNLOCK) throw new IllegalMonitorStateException();  
            setExclusiveOwnerThread(null);  
            setState(UNLOCK);  
            return true;  
        }  

        //锁是否被占用  
        @Override  
        protected boolean isHeldExclusively() {  
            return getState() == LOCK;  
        }  

/*        //共享模式 
        @Override 
        protected int tryAcquireShared(int arg) { 
            return super.tryAcquireShared(arg); 
        } 

        @Override 
        protected boolean tryReleaseShared(int arg) { 
            return super.tryReleaseShared(arg); 
        }*/  

        final ConditionObject newCondition() {  
            return new ConditionObject();  
        }  

    }  

}  

```

属性
==

方法
==

acquire
-------

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/a89a145141c87e969ff8b307bb1d18e6.png)

1.  tryAcquire，尝试直接获取锁。tryAcquire方法是子类实现的。以Mutex为例。

```
@Override  
        protected boolean tryAcquire(int arg) {  
            if (compareAndSetState(UNLOCK, LOCK)) { //状态为0的时候获取锁  
                setExclusiveOwnerThread(Thread.currentThread());  
                return true;  
            }  
            return false;  
        }  

```

通过CAS操作尝试修改锁状态，注意这个state状态是volatile的，没有做其他同步。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/426c7493ece8b4de68444256c69df35a.png) 使用unsafe对象类进行CAS操作，成功返回true，失败为false。如果CAS修改成功了，将当前线程设为持有该锁的线程。这里设置持有线程并没CAS，因为只有一个线程能够执行这行代码，不会产生竞争。

2.  如果tryAcquire失败，说明这个时刻有其他线程持有锁了，如果锁是非共享的话，当前线程是无法获取锁的，先添加一个waiter，然后调用acquireQueued。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/0d388868ea1d8690dc18b73aaf69c09f.png) 主体也是一个死循环（**实际上这里就有点像自旋锁的旋转了**）：

1.  如果刚刚插入的新节点的前驱节点是head，说明刚刚插入的新节点是队列里的第二个。这时候再tryAcquire一下试试，如果试成功了，那刚刚插入的新节点就是锁的持有者了，把他当成head，setHead方法只会有一个线程访问因此不需要CAS。
2.  如果刚刚插入的新的节点不是第二个节点，或者他是第二个但是tryAcquire失败了，需要判断一下当前线程是否需要阻塞（park）。判断规则挺复杂： 2.1. 前驱节点为SIGNAL，说明应该阻塞。 2.2. 前驱节点状态>0，说明前驱节点状态为CANCELLED，从队列中删除掉前驱节点，并继续判断前驱的前驱。不要阻塞。 2.3. 前驱节点状态为其他（CONDITION、PROPOGATE），通过CAS把前驱节点状态设为SIGNAL。同样不要阻塞。
3.  如果要阻塞，LockSupport.park来阻塞当前线程。唤醒当前线程可以通过3种方式： 3.1. unpark当前线程 3.2. interrupt当前线程 3.3. unsafe.park意外返回了！
4.  线程不管通过哪种方式醒了，也不代表他可以拿到锁了，还是要进入循环中，判断是否是第二个节点并且tryAcquire的。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/50c1a58ad4a28e0da82216dc6f06aff2.png) 从acquireQueued可以看出队列中线程的竞争有以下特点：

1.  只有第二个节点才有资格获得锁，第一个节点是正在持有锁的节点。
2.  队列中线程的等待和争夺模式类似于自旋的概念，阻塞——>尝试获取——>阻塞——>尝试获取——>获取成功~。

release
-------

从概念上来说，release操作应该比acquire操作简单一些。。。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/9eb55c91d37eafb1e53659cb33e6ea76.png)

1.  首先调用子类的tryRelease方法，直接设置状态为unlock即可，都不用CAS。如果tryRelease失败了的话，说明那个线程本来就没有拿到锁，是个非法调用。
2.  拿到head节点，只要head存在并且head状态不为0，就通过unparkSuccessor唤醒他的后继节点。如果他刚刚tryRelease成功之后立刻有线程拿到锁，成为了头节点，那这时候头节点就不是这个释放锁的节点了。但还是要尝试唤醒一下这个节点（虽然他极有可能是拿不到锁的）。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/8d547ef41afc3e63df08e02eb03a39c5.png) 如果这个节点的后继节点变为null了，或者状态时CANCLLED，就从tail节点开始沿队列往前找，直到找到一个状态不为CANCELLED的节点。唤醒这个节点上的正在沉睡的线程。

简单的Mutex的加锁解锁过程总结
=================

加锁
--

1.  首先尝试能否通过CAS操作直接设置锁标志位，如果成功，说明当前线程很轻易地抢到了锁，加锁结束。
2.  如果失败，把当前线程封装到一个node对象里，尝试通过CAS操作将该node插入队列尾部。如果一次CAS失败，进入一个死循环，不停地检查队列是否为空，不停地尝试通过CAS将node插入队列尾部，直到成功。
3.  进入正式等待的死循环，如果当前节点为第二个节点，说明有资格获取锁，通过CAS尝试修改锁标志位，如果成功，当前节点升级为头节点，加锁结束。
4.  如果失败，判断当前节点是否需要睡眠。只要其前驱节点状态为SIGNAL，就说明需要睡眠，通过unsafe的park方法让当前线程睡眠。

解锁
--

1.  直接修改锁标志位，表示自己释放了锁。
2.  调用LockSupport的unpark方法，唤醒他后继节点的线程。如果在唤醒之前发现他的后继节点为null了，就从tail往前找第一个状态不为CANCELLED的节点。