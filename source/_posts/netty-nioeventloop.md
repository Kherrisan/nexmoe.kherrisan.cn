---
title: Netty——NioEventLoop(1)
categories:
  - Netty
tags:
  - java
  - Netty
copyright: true
url: 1045.html
id: 1045
abbrlink: 5e1f2791
date: 2018-12-24 20:41:23
---

作为Netty中最核心的概念之一，`NioEventLoop`作为线程实体承载Netty中几乎所有代码的运行、所有事件的检测和触发。`EventLoop`这个单词并不陌生。在很多的图形用户界面（GUI）程序中，都会使用较少的数个线程来运行代码，以应对用户操作事件。 由于Netty的线程模型基于Java的**NIO**，而NIO又是通过**IO多路复用**实现的。IO多路复用是底层技术，在其之上则是负责管理多路IO的线程模型。Reactor模式就是一种经典的多线程IO设计模型。 

<!-- more -->

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/f1e818b190a1ab88c077a337c471f8f3.png) 上面的第一张图是多线程IO模型，第二张图是单线程NIO模型，第三张图是Reactor线程模型。第一和第二张图的区别主要在于线程是否复用，第二和第三张图的区别在于第二张图使用单线程（进程）处理读写事件而图三将对同一台远程主机的操作聚合到一个Handler里面，由Reactor负责派发事件给Handler执行。 当然，Handler中代码的执行也是需要线程的，这时就可以考虑线程的复用，即通过线程池管理线程。而Acceptor也可以进行多线程并发，也可以使用线程池。

EventLoop类体系
============

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/31af451f0f108a2f460d9f1061b87ac0.png) 图中白框框处的是JDK中自带的类。显然Netty也是利用了JDK中的接口来表达类的语义。

1.  `Executor`表示任务的执行者，只有一个方法`execute()`，和`Runnable`的概念有点类似，但实际上是caller和callee的关系。
2.  `ExecutorService`表示提供执行功能的服务方，所有的线程池都是`ExecutorService`的子类，这个接口定义了和executor相关的一些方法，如`execute`,`submit`等。
3.  `EventExecutorGroup`表示基于事件的执行者集合，它继承了`Iterable`，说明他可以迭代，且每个元素都是`EventExecutor`。同时它继承了`ScheduledExecutorService`接口，表明他具有调度定时任务的功能。
4.  `EventExecutor`表示任务的执行者。
5.  `EventLoopGroup`表示`EventLoop`的集合，即线程的集合，这个接口的主要功能一个是遍历`EventLoop`，另一个是允许将`channel`注册到某个`EventLoop`上。
6.  `EventLoop`负责处理各个`channel`的任务，一般一个`EventLoop`会对应多个`channel`。此接口本身并没有提供什么有趣的方法。

第一个NioEventLoop
===============

不妨探索一下Netty启动时第一个`NioEventLoop`是何时何地启动的，以典型的启动代码为例：

```java
EventLoopGroup bossGroup = new NioEventLoopGroup(1);

```

忽略重载的构造函数。

```java
    public NioEventLoopGroup(int nThreads, Executor executor, final SelectorProvider selectorProvider,
                             final SelectStrategyFactory selectStrategyFactory) {
        super(nThreads, executor, selectorProvider, selectStrategyFactory, RejectedExecutionHandlers.reject());
    }

```

这里调用了父类的构造函数。

```java
        static {
                DEFAULT_EVENT_LOOP_THREADS = Math.max(1, SystemPropertyUtil.getInt(
                "io.netty.eventLoopThreads", NettyRuntime.availableProcessors() * 2));
        }

        protected MultithreadEventLoopGroup(int nThreads, Executor executor, Object... args) {
            super(nThreads == 0 ? DEFAULT_EVENT_LOOP_THREADS : nThreads, executor, args);
    }

```

`NioEventLoopGroup`是一个`MultiThreadEventLoopGroup`，即多线程事件循环组，最关键的是多线程的，这里既可以指多个线程，也可以看做是多个`EventLoop`组成的group。**线程个数取决于最开始传入的整数，如果这个数是0，则会取一个默认值——处理器个数x2。** 继续跟踪这个类的重载的及其父类的构造函数，直到构造函数中有明显的代码。

```java
    protected MultithreadEventExecutorGroup(int nThreads, Executor executor,
                                            EventExecutorChooserFactory chooserFactory, Object... args) {
        if (executor == null) {
            executor = new ThreadPerTaskExecutor(newDefaultThreadFactory());
        }

        children = new EventExecutor[nThreads];

        for (int i = 0; i < nThreads; i ++) {
            try {
                children[i] = newChild(executor, args);
                success = true;
            } finally {
                if (!success)
                    for (int j = 0; j < i; j ++)
                        children[j].shutdownGracefully();
            }
        }

        chooser = chooserFactory.newChooser(children);
        final FutureListener<Object> terminationListener = ......;

        for (EventExecutor e: children) {
            e.terminationFuture().addListener(terminationListener);
        }

        readonlyChildren = Collections.unmodifiableSet(childrenSet);
    }

```

在`NioEventLoopGroup`初始化时，参数`executor`为null，于是会首先创建一个`ThreadPerTaskExecutor`（顾名思义，为每个任务取得一个线程来执行它的Executor，至于如何取得，是直接创建新线程还是复用线程，要看具体情况）。 `ThreadPerTaskExecutor`的`execute`方法如下：

```java
    private final ThreadFactory threadFactory;

    public void execute(Runnable command) {
        threadFactory.newThread(command).start();
    }

```

在这里，`threadFactory`是一个`DefaultThreadFactory`对象，它提供线程的方式由`newThread`方法决定：

```java
    @Override
    public Thread newThread(Runnable r) {
        Thread t = newThread(FastThreadLocalRunnable.wrap(r), prefix + nextId.incrementAndGet());
            if (t.isDaemon() != daemon) {
                t.setDaemon(daemon);
            }

            if (t.getPriority() != priority) {
                t.setPriority(priority);
            }
        return t;
    }

```

显然，这里的`ThreadPerTaskExecutor`会将收到的每个task放到一个新创建的线程里运行。 回到构造函数，接下来程序开辟了一个数组用于存放所有的executor。`EchoServer`中nThread取1，自然就开辟长度为1的数组。 `newChild`在`MultithreadEventExecutorGroup`是一个抽象方法，具体如何创建子executor取决于其子类的实现。`NioEventLoopGroup`是这么实现它的：

```java
    @Override
    protected EventLoop newChild(Executor executor, Object... args) throws Exception {
        return new NioEventLoop(this, executor, (SelectorProvider) args[0],
            ((SelectStrategyFactory) args[1]).newSelectStrategy(), (RejectedExecutionHandler) args[2]);
    }

```

直接new了一个`NioEventLoop`，并且把`executor`作为构造函数的参数传进了`NioEventLoop`。不过`executor`并不是由`NioEventLoop`使用，而是由其父类的父类——`SingleThreadEventExecutor`作为属性之一进行维护。`SingleThreadEventExecutor`作为`executor`的维护者，在它的代码中也只有一处地方用到了`executor`，就在`doStartThread`函数中。

```java
    private void doStartThread() {
        executor.execute(new Runnable() {
            @Override
            public void run() {
                thread = Thread.currentThread();
                ......
                try {
                    SingleThreadEventExecutor.this.run();
                } catch (Throwable t) {
                    ......
                } finally {
                    ......
                }
            }
        });
    }

```

而这个`doStartThread`方法也不是`SingleThreadEventExecutor`一诞生就起作用的，在`SingleThreadEventExecutor`的`execute`方法中调用了该方法。

```java
    @Override
    public void execute(Runnable task) {
        ......
        addTask(task);
        if (!inEventLoop) {
            startThread();
            if (isShutdown()) {
                ......
            }
        }
    }

```

重新审视`SingleThreadEventExecutor`，他提供了一个`execute`方法，当有人调用了该对象的`execute`方法时，会把要运行的任务加入到一个任务队列中（通过`addTask`方法，这个方法不看我们都能猜到是什么意思的）。如果是第一次execute，就在修改队列之后通过`SingleThreadEventExecutor`自带的`executor`启动一个线程，这个线程执行一个抽象的`run`方法，在`NioEventLoop`中对该方法给出了实现。 这里遇到了三种executor——`ThreadPerTaskExecutor`和`SingleThreadEventExecutor`，前者给每个任务（也就是`Runnable`）分配一个线程来执行，后者则只使用一个线程（只做一次`startThread`，那肯定只有一个线程了），`NioEventLoop`则也在其整个生命周期中只使用一个线程，此外它通过轮训来从队列中取任务。 **那么问题来了，`SingleThreadEventExecutor`为什么要用`ThreadPerTaskExecutor`启动线程呢，二者看似是平级的概念，为什么却采用了包含关系？** 会到负责启动多个`SingleThreadEventExecutor`的`MultithreadEventExecutorGroup`，接下来通过`chooserFactory`得到了一个`chooser`，这个对象的作用是根据特定的策略选择多个`executor`中的一个，即一个选择器。 **这里不禁想起了在负载均衡中应该也有一个这样的`chooser`，只是不知道这样的`chooser`应该处于怎样的层级，来收集做出选择所需要的信息。** 回到最初的问题——第一个`NioEventLoop`是何时启动的？到目前为止，第一个`NioEventLoop`已经诞生了，但他的`execute`方法还没有被任何人调用，因此他还没有启动自己的轮训线程。也就是说，应该是在另外的某一个犄角旮旯里，某行代码调用了`execute`，启动了第一个`NioEventLoop`的线程。 启动`EchoServer`的代码就那么多，不是初始化`EventLoopGroup`就是配置`Bootstrap`，最后就是`bind`。我认为在`bind`中可能性最大。 在前一篇文章中曾经分析过服务端启动的流程。这里稍微略过一些细节。

```java
    private ChannelFuture doBind(final SocketAddress localAddress) {
        final ChannelFuture regFuture = initAndRegister();
        ......
    }

```

在`AbstractBootstrap`的`doBind`方法中，发现了`ChannelFuture`的踪迹。Future是一种返回异步结果的常见形式，出现了`ChannelFuture`说明其中肯定有某个函数是通过另一个线程执行操作，然后异步返回运行结果的。继续紧跟这个Future。

```java
    final ChannelFuture initAndRegister() {
        ......
        ChannelFuture regFuture = config().group().register(channel);
        ......
    }

```

这里的`group()`返回了一个`NioEventLoopGroup`。我有一个疑问： **这个`NioEvnetLoopGroup`是Boss还是Worker呢？** 这里我用了一个土办法，在调试模式下加断点，看对象的ID。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/d7902ca4f0352876f72b9ffc01c72830.png) 答案了然了，这是一个Boss。继续跟踪。

```java
    @Override
    public ChannelFuture register(Channel channel) {
        return register(new DefaultChannelPromise(channel, this));
    }

    @Override
    public ChannelFuture register(final ChannelPromise promise) {
        ObjectUtil.checkNotNull(promise, "promise");
        promise.channel().unsafe().register(this, promise);
        return promise;
    }

```

在`SingleThreadEventLoop`中，Future逐渐浮出水面——他是作为一个Promise被创建出来的。但这里只是创建，并没有修改Future的状态，也没有在Future中填充异步运行的结果。

```java
        @Override
        public final void register(EventLoop eventLoop, final ChannelPromise promise) {
            ......
            AbstractChannel.this.eventLoop = eventLoop;
            if (eventLoop.inEventLoop()) {
                register0(promise);
            } else {
                    eventLoop.execute(new Runnable() {
                        @Override
                        public void run() {
                            register0(promise);
                        }
                    });
            }
        }

```

在`AbstractChannel`中出现了一个`eventLoop`，这个`eventLoop`是不是就是通过`newChild`得到的`NioEventLoop`呢？再次祭出比对ID大法。 这里我就不截图了，结果是这里的`eventLoop`是作为boss的`NioEventLoopGroup`制造出来的。 这里代码会进入else分支，即`eventLoop.execute`，那么第一个`NioEventLoop`就会将这个`Runnable`加到自己的任务队列中，接着通过`ThreadPerTaskExecutor.execute`运行自己的`run`方法，在`run`方法中轮训任务队列，运行`Runnable`。

eventLoop.inEventLoop
=====================

我认为这个方法是一个十分关键的方法，虽然实现逻辑很简单，**但他却很清晰地诠释了netty设计思路中对象和线程之间的关系，即executor和thread这两大概念之间的关系。** netty把这个方法的定义放在了`AbstractEventExecutor`类中。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/305bf4c6bc929c927ede4eecb54f2d68.png)

```java
    @Override
    public boolean inEventLoop() {
        return inEventLoop(Thread.currentThread());
    }

```

在`AbstractEventExecutor`中，`inEventLoop`表示在当前这个线程的`EventLoop`，由于`EventLoop`是单线程的（它是`SingleThreadEventExecutor`的子类），一个`EventLoop`对象`run`方法的代码只会运行在一个线程中。

```java
    @Override
    public boolean inEventLoop(Thread thread) {
        return thread == this.thread;
    }

```

在`SingleThreadEventExecutor`中，`inEventLoop`表示传入参数的thread对象和与对象自身绑定的thread对象是同一个对象。 也就是说，一个`SingleThreadEventLoop`对象会和一个线程绑定，当想要通过这个对象执行某些方法的时候，可以先通过`inEventLoop()`方法判断，当前线程是不是和这个eventLoop绑定的线程，继而针对不同情况进行区分处理。如：如果当前线程不是eventLoop绑定的那个线程，就通过`execute`方法把任务加入到任务队列中；如果就是当前线程，那就直接运行代码。这样可以避免产生多线程操作同一个对象所带来的同步问题。

重新梳理Bootstrap
=============

结合`NioEventLoop`的初始化过程，重新梳理netty程序的启动流程。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/44c84ddc625008b39ff4bb98e6d4fd05.png)

1.  创建`NioEventLoopGroup`，包含多个`NioEventLoop`，个数视情况而定。每个`NioEventLoop`的`run`方法还没有开始运行。
2.  `Bootstrap`在`bind`的时候，通过反射创建`NioServerSocketChannel`对象。
3.  初始化`NioServerSocketChannel`上面的attribute和option。
4.  `NioEventLoopGroup`选出下一个`NioEventLoop`，让channel注册到它上面。
5.  在选中的`NioEventLoop`的线程上，注册interestOps和attachment到selector上。
6.  在channel的eventloop线程上，通过`headContext`绑定到指定端口上。

**NioEventLoop**的核心——loop的梳理，见下一篇。