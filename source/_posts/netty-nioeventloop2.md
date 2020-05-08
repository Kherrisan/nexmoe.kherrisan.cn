---
title: Netty——NioEventLoop(2)
categories:
  - Netty
tags:
  - java
  - Netty
copyright: true
url: 1068.html
id: 1068
abbrlink: '75327452'
date: 2019-01-05 10:36:54
---

Loop过程
======

`NioEventLoop`最核心的就是处理事件循环的`run`方法。这个方法看起来不长，但实际上它承担了最重要的逻辑，并且对很多细节问题做了处理。

<!-- more -->

```java
    @Override
    protected void run() {
        for (;;) {
            try {
                switch (selectStrategy.calculateStrategy(selectNowSupplier, hasTasks())) {
                    case SelectStrategy.CONTINUE:
                        continue;

                    case SelectStrategy.BUSY_WAIT:

                    case SelectStrategy.SELECT:
                        select(wakenUp.getAndSet(false));

                        if (wakenUp.get()) {
                            selector.wakeup();
                        }
                        // fall through
                    default:
                }

                cancelledKeys = 0;
                needsToSelectAgain = false;
                final int ioRatio = this.ioRatio;
                if (ioRatio == 100) {
                    try {
                        processSelectedKeys();
                    } finally {
                        // Ensure we always run tasks.
                        runAllTasks();
                    }
                } else {
                    final long ioStartTime = System.nanoTime();
                    try {
                        processSelectedKeys();
                    } finally {
                        // Ensure we always run tasks.
                        final long ioTime = System.nanoTime() - ioStartTime;
                        runAllTasks(ioTime * (100 - ioRatio) / ioRatio);
                    }
                }
            } catch (Throwable t) {
                handleLoopException(t);
            }
            // Always handle shutdown even if the loop processing threw an exception.
            try {
                if (isShuttingDown()) {
                    closeAll();
                    if (confirmShutdown()) {
                        return;
                    }
                }
            } catch (Throwable t) {
                handleLoopException(t);
            }
        }
    }

```

既然叫eventLoop，那代码的主体部分自然就是一个循环，在每一次循环迭代都根据某些状态做一些针对性工作。 首先是`selectStrategy.calculateStrategy(selectNowSupplier, hasTasks())`，`selectStrategy`只有一个实现类：`DefaultSelectStrategy`。

```java
    @Override
    public int calculateStrategy(IntSupplier selectSupplier, boolean hasTasks) throws Exception {
        return hasTasks ? selectSupplier.get() : SelectStrategy.SELECT;
    }
    ......
    selectSupplier = new IntSupplier() {
        @Override
        public int get() throws Exception {
            return selectNow();
        }
    };

```

1.  判断队列中有无任务，如果有，则返回`selectNow`的结果。
2.  如果没有，就返回SELECT。

`selectNow`方法返回的是JDK的select的`selectNow`方法执行的结果，这个方法执行非阻塞的select，返回`SelectionKey`的个数，当然如果无事发生的话也会返回0。 **`selectStrategy`中定义了三个常量：SELECT、CONTINUE、BUSY_WAIT，然而后两种并没有在哪里被使用到。**可能是netty是打算先设计好结构，然后再慢慢填坑把。

select
------

当strategy为SELECT的时候，涉及到`NioEventLoop`的`select`方法：

```java
    private void select(boolean oldWakenUp) throws IOException {
        Selector selector = this.selector;
            int selectCnt = 0;
            long currentTimeNanos = System.nanoTime();
            long selectDeadLineNanos = currentTimeNanos + delayNanos(currentTimeNanos);

            for (;;) {
                long timeoutMillis = (selectDeadLineNanos - currentTimeNanos + 500000L) / 1000000L;
                if (timeoutMillis <= 0) {
                    if (selectCnt == 0) {
                        selector.selectNow();
                        selectCnt = 1;
                    }
                    break;
                }

                if (hasTasks() && wakenUp.compareAndSet(false, true)) {
                    selector.selectNow();
                    selectCnt = 1;
                    break;
                }

                int selectedKeys = selector.select(timeoutMillis);
                selectCnt ++;

                if (selectedKeys != 0 || oldWakenUp || wakenUp.get() || hasTasks() || hasScheduledTasks()) {
                    break;
                }
                if (Thread.interrupted()) {
                        ......
                }

                long time = System.nanoTime();
                if (time - TimeUnit.MILLISECONDS.toNanos(timeoutMillis) >= currentTimeNanos) {
                    selectCnt = 1;
                } else if (SELECTOR_AUTO_REBUILD_THRESHOLD > 0 &&
                        selectCnt >= SELECTOR_AUTO_REBUILD_THRESHOLD) {
                    rebuildSelector();
                    selector = this.selector;
                    selector.selectNow();
                    selectCnt = 1;
                    break;
                }

                currentTimeNanos = time;
            }
            ......
    }

    protected long delayNanos(long currentTimeNanos) {
        ScheduledFutureTask<?> scheduledTask = peekScheduledTask();
        if (scheduledTask == null) {
            return SCHEDULE_PURGE_INTERVAL;
        }

        return scheduledTask.delayNanos(currentTimeNanos);
    }

```

`select`方法在循环中尝试根据时间限制来进行阻塞或者非阻塞的select操作。这里的时间限制就是`selectDeadLineNanos`，他根据下一个任务的时间限制给出这次阻塞select最迟必须结束的时间。如果没有下一个任务，就给出长达SCHEDULE\_PURGE\_INTERVAL的时间，当然在这段时间内如果有任务到来还是会按照任务的deadline时间做判断。

1.  如果还有不到500ms就要到ddl了，就结束循环，不过如果还没有执行过阻塞select，为了不破坏`select`方法的语义，可以先selectNow一次。
2.  如果任务队列里有任务了，尝试将这个`NioEventLoop`设置为唤醒，如果唤醒成功，selectNow一次并结束。
3.  通过selector执行阻塞的select操作，可以阻塞到ddl的前500ms，即在ddl之前预留500ms，说不定要做别的事情。记录阻塞select次数。
4.  如果阻塞select操作真的返回了几个事件，结束循环。
5.  如果用户（就是除了对象本身之外的其他人）唤醒了它，结束循环。
6.  如果任务队列有任务了，或者有调度任务了，结束循环。
7.  如果线程被中断了，结束循环。
8.  如果阻塞select次数超过了一个阈值，说明selector出bug了，重建selector，selectNow一次，结束循环。

在循环体开头的switch可以这么解释：

1.  如果任务队列里有任务，就让`selector`selectNow一次，非阻塞地看看有没有什么事件发生，不管事件是0个还是几个，继续执行switch下面的代码。
2.  如果没有任务，就考虑执行一段时间阻塞的select操作。

结束了switch，该处理事件和执行任务了。这里netty又来骚操作了——`ioRatio`，这个变量代表两个过程——IO和运行任务分别所占时间比例。

```java
                if (ioRatio == 100) {
                    processSelectedKeys();
                    runAllTasks();
                } else {
                    final long ioStartTime = System.nanoTime();
                    processSelectedKeys();
                    final long ioTime = System.nanoTime() - ioStartTime;
                    runAllTasks(ioTime * (100 - ioRatio) / ioRatio);
                }

```

判断方法很简单，如果`ioRatio`是100，就运行所有的任务；如果不是100，比如说是20，那么记录下IO所话的时间`ioTime`，然后限定运行任务的时间为`ioTime*(100-20)/20`，也就是4倍`ioTime`。

processSelectedKeys
-------------------

既然select操作检测到了IO事件，那么就要处理对应的key，这个key和JavaNIO中是SelectionKey是一回事。

```java
        if (selectedKeys != null) {
            processSelectedKeysOptimized();
        } else {
            processSelectedKeysPlain(selector.selectedKeys());
        }

```

netty提供了两种处理selectionKey的方法——plain和optimized。`NioEventLoop`对象维护了一个`SelectedSelectionKeySet`对象，这个对象管理了一个selectionKey的集合。至于为什么不用Java原生的Set容器，应该还是出于效率上的考虑（TreeSet和HashSet在某些场景下都不如数组来的快）。 `SelectedSelectionKeySet`使用一个数组来作为set的底层实现，初始长度为1024，add操作向数组索引为size的位置插入元素，如果长度不够就扩容一倍，没有缩容的情况，没有remove操作，提供迭代器访问形式。 先看`processSelectedKeysOptimized`到底是怎么optimize的。

```java
    private void processSelectedKeysOptimized() {
        for (int i = 0; i < selectedKeys.size; ++i) {
            final SelectionKey k = selectedKeys.keys[i];
            selectedKeys.keys[i] = null;
            final Object a = k.attachment();
            if (a instanceof AbstractNioChannel) {
                processSelectedKey(k, (AbstractNioChannel) a);
            } else {
                processSelectedKey(k, (NioTask<SelectableChannel>)task);
            }
            if (needsToSelectAgain) {
                ......
            }
        }
    }

```

遍历set中的每一个selectionKey，取出attach在它上面的对象，有可能是`AbstractNioChannel`，也有可能是`NioTask`。 **这里可以思考一下：SelectionKey上的attachment是什么时候加上去的？** 在`AbstractNioChannel`中的`doRegister`中：

```java
selectionKey = javaChannel().register(eventLoop().unwrappedSelector(), 0, this);

```

`AbstractNioChannel`被attach到了`SelectionKey`上面。

```java
    private void processSelectedKey(SelectionKey k, AbstractNioChannel ch) {
            final AbstractNioChannel.NioUnsafe unsafe = ch.unsafe();
            ......
            int readyOps = k.readyOps();
            if ((readyOps & SelectionKey.OP_CONNECT) != 0) {
                k.interestOps(k.interestOps() & ~SelectionKey.OP_CONNECT);
                unsafe.finishConnect();
            }
            if ((readyOps & SelectionKey.OP_WRITE) != 0) {
                ch.unsafe().forceFlush();
            }
            if ((readyOps & (SelectionKey.OP_READ | SelectionKey.OP_ACCEPT)) != 0 || readyOps == 0) {
                unsafe.read();
            }
    }

```

思路很清晰，就是根据`readyOps`的不同的值，采取不同的行为。 `processSelectedKeysPlain`实际上类似，区别主要在于它使用Java自带的Set存放SelectionKey。

runAllTasks
-----------

`runAllTasks`有两种，带时间限的和不带时间限的。不带时间限则执行所有任务：

```java
        do {
            fetchedAll = fetchFromScheduledTaskQueue();
            if (runAllTasksFrom(taskQueue)) {
                ranAtLeastOne = true;
            }
        } while (!fetchedAll); // keep on processing until we fetched all scheduled tasks.

```

首先从`ScheduledTaskQueue`中取出任务，存放到`taskQueue`中，直到所有`ScheduledTaskQueue`被取空，或者`taskQueue`已满。 然后逐个执行`taskQueue`中的所有任务，直到`taskQueue`为空。

```java
        for (;;) {
            safeExecute(task);
            task = pollTaskFrom(taskQueue);
            if (task == null) {
                return true;
            }
        }

```

引用闪电侠博客中的一张图来概括loop的过程。 ![](https://upload-images.jianshu.io/upload_images/1357217-67ed6d1e8070426f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

wakenUp
=======

参考：[Netty原子wakeup作用分析](https://wenku.baidu.com/view/c75d218c804d2b160a4ec04c.html)，虽然这篇文章已经严重过期了。 在`NioEventLoop`对象中，有一个`AtomicBoolean`——`wakenUp`，在`run`方法及其调用的其他方法中多次见到了对该变量的判断及CAS（Compare and Set）操作，之前一直忽略了这个变量的作用。

> Boolean that controls determines if a blocked Selector.select should break out of its selection process. In our case we use a timeout for the select method and the select method will block for that time unless waken up.

字面意思为：决定`Selector.select`阻塞调用是否要中断select过程的一个Boolean，即是否应该通过`select.wakeUp()`唤醒正在阻塞的select操作。 **主要目的是防止`selector.wakeUp()`被重复调用，因为`selector.wakeUp()`操作的开销还是不小的。**

```java
    @Override
    protected void wakeup(boolean inEventLoop) {
        if (!inEventLoop && wakenUp.compareAndSet(false, true)) {
            selector.wakeup();
        }
    }

```

这里有个问题：`NioEventLoop`是单线程的代码逻辑，怎么会出现在selector阻塞的同时唤醒他呢？我认为问题出在selector可能不是单线程独享的，即不是每一个`NioEventLoop`都有一个独立的`selector`。此外，通过`NioEventLoop.execute`执行`Runnable`是串行的，但调用`NioEventLoop`的其他方法时还是会出现多线程并发的情况。 在switch语句块的SELECT分支中，会首先设置`wakenUp`为false，相当于每次循环时都给`wakenUp`变量设个初始值。

```java
case SelectStrategy.SELECT:
    select(wakenUp.getAndSet(false));

```

在`select()`方法中，有两处对`wakenUp`的值做了判断：

```java
for{
    ......
    if (hasTasks() && wakenUp.compareAndSet(false, true)) {
        selector.selectNow();
        selectCnt = 1;
        break;
    }
    ......
    selector.select(timeoutMillis);
}

```

```java
if (wakenUp.get()) {
    selector.wakeup();
}

```