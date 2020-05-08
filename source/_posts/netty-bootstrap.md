---
title: Netty——Bootstrap
categories:
  - Netty
tags:
  - java
  - Netty
copyright: true
url: 1014.html
id: 1014
abbrlink: 7c7e2239
date: 2018-11-14 20:24:36
---

以netty-example中的Echo（Server）为例，分析Netty源码的结构与运行过程。 跳过SSL相关的部分。从下面这一行代码开始：

```java
ChannelFuture f = b.bind(PORT).sync();

```

<!-- more -->

`sync`方法的功能是同步地等待该操作结束，因此对于server启动监听没有实质性的作用，这里可以忽略他。 首先进入到`bootstrap.bind`方法中，这个方法由`AbstractBootstrap`负责实现：

```java
    /**
     * Create a new {@link Channel} and bind it.
     */
    public ChannelFuture bind(int inetPort) {
        return bind(new InetSocketAddress(inetPort));
    }

```

再进入到`bind`方法中：

```java
    /**
     * Create a new {@link Channel} and bind it.
     */
    public ChannelFuture bind(SocketAddress localAddress) {
        validate();
        if (localAddress == null) {
            throw new NullPointerException("localAddress");
        }
        return doBind(localAddress);
    }

```

`bind`方法做了两件事：1.做一些校验工作；2.调用`doBind`方法进行真正的监听地址绑定。校验操作一般无足轻重，因此不妨直接进入`doBind`方法中去：

```java
    private ChannelFuture doBind(final SocketAddress localAddress) {
        final ChannelFuture regFuture = initAndRegister();
        final Channel channel = regFuture.channel();

        if (regFuture.isDone()) {
            doBind0(regFuture, channel, localAddress, promise);
            return promise;
        } else {
            // Registration future is almost always fulfilled already, but just in case it's not.
            final PendingRegistrationPromise promise = new PendingRegistrationPromise(channel);
            regFuture.addListener({
                    doBind0(regFuture, channel, localAddress, promise);
            });
            return promise;
        }
    }

```

**上面的代码并不完整，删除了一些细枝末节，因为目前阅读源码的目的是尽快尽可能完整地理清楚程序脉络，因此我删除了自认为对于程序总体认识没有太大帮助的代码。** `doBind`方法主要做了两件事：

1.  `initAndRegiter`
2.  `doBind0`

暂时不知道这两个方法各自起了怎样的作用，一个一个来看。

initAndRegister
===============

```java
    final ChannelFuture initAndRegister() {
        ......
        channel = channelFactory.newChannel();
        init(channel);
        ......
        ChannelFuture regFuture = config().group().register(channel);
        ......
    }

```

`initAndRegister`方法所做的工作可以大致分为三块：

1.  调用`channelFactory`实例化`channel`；
2.  初始化`channel`；
3.  将`channel`注册到`group`返回的对象上去。

实例化Channel
----------

**Netty和NIO都有一个叫做Channel的概念，为了方便区分，这里及后续的分析中都将Netty中的称为Channel，而NIO中的称为JavaChannel。** Channel是Netty中的核心概念之一，表示的是客户端或服务端与远程主机通讯的某个Socket。在大多数语言的网络通讯库中，客户端中只有一种Socket，但在服务端中有两种：ServerSocket和Socket，前者只负责监听端口，后者负责处理与远程主机的数据交换。 至于服务端为什么要使用两种Socket，我认为还是受限于OS系统调用的接口定义。

```java
channel = channelFactory.newChannel();

```

和Spring等一众Java框架类似，对于核心概念的实例化采用了工厂模式。`ChannelFactory`接口结构很简单：

```java
public interface ChannelFactory<T extends Channel> {
    T newChannel();
}

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/5c8854379f983db74506487c2d562e67.png) 实现了`ChannelFactory`接口的类不多，工厂对象的实际类型多半就是`ReflectiveChannelFactory`了。

```java
    public ReflectiveChannelFactory(Class<? extends T> clazz) {
        this.clazz = clazz;
    }

    public T newChannel() {
            return clazz.getConstructor().newInstance();
    }

```

`ReflectiveChannelFactory`在构造函数中拿到了`channel`的类型，然后使用了反射构造函数来实例化对象，没毛病。至于它的构造函数是在何处调用的，在server启动代码链式调用`bootstrap`的数个方法中，有这么一个方法设置了`channel`的类型（准确地说是Class对象）。

```java
    public B channel(Class<? extends C> channelClass) {
        return channelFactory(new ReflectiveChannelFactory<C>(channelClass));
    }

```

```java
    public B channelFactory(ChannelFactory<? extends C> channelFactory) {
        this.channelFactory = channelFactory;
        return self();
    }

```

这里`ReflectiveChannelFactory`是直接new出来的，没有通过反射，传入构造函数的参数为`channel`的类型。`AbstractBootstrap`简单的实例化了一个`channelFactory`，并关联到该对象自身。 **貌似Netty中很多的setter方法都是这种写法。** **`channel`实例化的过程还是挺简单的：在`bootstrap`的链式调用中实例化`channelFactory`，然后在server启动监听时有工厂实例化真正的`channel`。**

初始化channel
----------

`AbstractBootstrap`的`init`方法是抽象的，该方法的实现被下放到了子类中去：

```java
    void init(Channel channel) throws Exception {
        final Map<ChannelOption<?>, Object> options = options0();
        synchronized (options) {
            setChannelOptions(channel, options, logger);
        }

        final Map<AttributeKey<?>, Object> attrs = attrs0();
        synchronized (attrs) {
            for (Entry<AttributeKey<?>, Object> e: attrs.entrySet()) {
                @SuppressWarnings("unchecked")
                AttributeKey<Object> key = (AttributeKey<Object>) e.getKey();
                channel.attr(key).set(e.getValue());
            }
        }

        ChannelPipeline p = channel.pipeline();

        final EventLoopGroup currentChildGroup = childGroup;
        final ChannelHandler currentChildHandler = childHandler;
        final Entry<ChannelOption<?>, Object>[] currentChildOptions;
        final Entry<AttributeKey<?>, Object>[] currentChildAttrs;
        synchronized (childOptions) {
            currentChildOptions = childOptions.entrySet().toArray(newOptionArray(0));
        }
        synchronized (childAttrs) {
            currentChildAttrs = childAttrs.entrySet().toArray(newAttrArray(0));
        }

        p.addLast(new ChannelInitializer<Channel>() {
            @Override
            public void initChannel(final Channel ch) throws Exception {
                final ChannelPipeline pipeline = ch.pipeline();
                ChannelHandler handler = config.handler();
                if (handler != null) {
                    pipeline.addLast(handler);
                }

                ch.eventLoop().execute(new Runnable() {
                    @Override
                    public void run() {
                        pipeline.addLast(new ServerBootstrapAcceptor(
                                ch, currentChildGroup, currentChildHandler, currentChildOptions, currentChildAttrs));
                    }
                });
            }
        });
    }

```

1.  将`AbstractBootstrap`负责维护的`options`和`attrs`无脑地全部设置到`channel`对象上去。为了避免另一个线程修改`options`和`attrs`，访问时都进行了同步，我认为这里的加锁在服务器启动阶段是不会对性能造成太大影响的。
2.  在该channel的`pipeline`尾部添加一个`ChannelInitializer`，何时调用其`initChannel`方法目前还不得而知，但是该`ChannelInitializer`的目的还是挺明确的： 2.1. 在`pipeline`尾部添加一个`ChannelHandler`。 2.2. 在该`channel`的线程中，异步地在其`pipeline`尾部添加一个`ServerBootstrapAcceptor`。

注册channel
---------

`ChannelFuture regFuture = config().group().register(channel);` `group()`返回的是`EventLoopGroup`，即线程组，Netty中一个`EventLoop`即为一个线程，将多个线程组合起来管理就产生了“线程组”的概念（和OS中的线程组概念不同）。这里调用了`EventLoopGroup`接口里的`register`方法来注册`channel`，但暂时还无法判断是哪个实现了`EventLoopGroup`接口的小可爱。 在这一行代码加断点并以调试模式运行Echo Example。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/d94b109dc5c60ed0de2b23e7417abb6c.png) 发现`config().group()`返回的是一个`NioEventLoopGroup`对象，这个对象是`MultithreadEventLoopGroup`的子类，其`register`方法所做之事很简单。

```java
    @Override
    public ChannelFuture register(Channel channel) {
        return next().register(channel);
    }

```

`next()`方法返回了一个`EventLoop`，根据直觉猜测`EventLoopGroup`是一个可迭代的对象，其中存放了`EventLoop`的列表，而`next()`方法类似于迭代器的`next()`方法，返回下一个`EventLoop`对象。

```java
    @Override
    public EventExecutor next() {
        return chooser.next();
    }

```

`MultithreadEventLoopGroup`的`next()`方法最终会借助于`chooser`返回下一个`EventLoop`对象。暂时还不知道这个chooser是何方神圣，只知道他是`MultithreadEventLoopGroup`维护的众多对象之一。

```java
    private final EventExecutor[] children;
    private final Set<EventExecutor> readonlyChildren;
    private final AtomicInteger terminatedChildren = new AtomicInteger();
    private final Promise<?> terminationFuture = new DefaultPromise(GlobalEventExecutor.INSTANCE);
    private final EventExecutorChooserFactory.EventExecutorChooser chooser;

```

由于目前我们还只是专注于启动流程，而启动过程中线程的选择与切换的特点还不能很好地显现出来，因此先不管`chooser`，回到`register`方法中。 `next()`返回了一个`SingleThreadEventLoop`对象，通知他调用他自己实现的`register`方法。

```java
    @Override
    public ChannelFuture register(Channel channel) {
        return register(new DefaultChannelPromise(channel, this));
    }

```

这里实例化了一个`DefaultChannelPromise`，并把`channel`和`SingleThreadEventLoop`作为参数传入，估计`Promise`会把他们两人关联起来。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/d2d80e9027d11fab989d4dc9f3f2b4c1.png) 如果忘记了`channel`是什么东西的话，可以回溯到`ChannelFactory`的部分：`ChannelFactory`通过反射实例化`channel`对象，而其类型就是在`bootstrap`对象上进行方法链式调用时传入的`NioServerSocketChannel.class`。 实例化promise后并没有结束，因为还没有注册呢：

```java
    @Override
    public ChannelFuture register(final ChannelPromise promise) {
        ObjectUtil.checkNotNull(promise, "promise");
        promise.channel().unsafe().register(this, promise);
        return promise;
    }

```

此时`promise.channel()`返回的就是刚才传入构造函数的`NioServerSocketChannel`。`unsafe`是个什么玩意儿还不是很清楚，但联想到JDK中有一个也叫`Unsafe`的组件，用于提供对内存的直接操作，就可以猜测这个`unsafe`应该是负责某些底层操作流程的。

```java
@Override
        public final void register(EventLoop eventLoop, final ChannelPromise promise) {
            ......
            AbstractChannel.this.eventLoop = eventLoop;//从此这个channel有了属于自己的eventloop
            if (eventLoop.inEventLoop()) {
                register0(promise);
            } else {
                    eventLoop.execute(new Runnable() {
                        @Override
                        public void run() {
                            register0(promise);
                        }
                    });
                    ......
            }
        }


```

`unsafe`的`register`方法的主要内容如上，最终目的是调用`register0`方法，注册`promise`。直觉告诉我，名字里带0的方法都差不多快要到终点了。

```java
        private void register0(ChannelPromise promise) {
                ......
                boolean firstRegistration = neverRegistered;
                doRegister();
                ......
                pipeline.invokeHandlerAddedIfNeeded();
                ......
                pipeline.fireChannelRegistered();
                if (isActive()) {
                    if (firstRegistration) {
                        pipeline.fireChannelActive();
                    } else if (config().isAutoRead()) {
                        beginRead();
                    }
                }
                ......
        }

```

除了触发了几个事件之外，最神秘的当属`doRegister`方法，直觉告诉我，当看到带有do字样的方法的时候，就离终点不远了。

```java
    @Override
    protected void doRegister() throws Exception {
        boolean selected = false;
        for (;;) {
            try {
                selectionKey = javaChannel().register(eventLoop().unwrappedSelector(), 0, this);
                return;
            } catch (CancelledKeyException e) {
                if (!selected) {
                    // Force the Selector to select now as the "canceled" SelectionKey may still be
                    // cached and not removed because no Select.select(..) operation was called yet.
                    eventLoop().selectNow();
                    selected = true;
                } else {
                    // We forced a select operation on the selector before but the SelectionKey is still cached
                    // for whatever reason. JDK bug ?
                    throw e;
                }
            }
        }
    }

```

`doRegister`的主体是一个死循环，虽然这个死循环只会重复一到两次，在`javaChannel`上注册`selector`以及感兴趣的事件，同时，由于`AbstractNioChannel`本身是一个`AttributeMap`，因此自己作为属性的持有者也被注册到了`javaChannel`上。 这个`register`方法以及属于`java.nio`中的代码，总算可以说到终点了。 现在回到`AbstractBootstrap`的`doBind0`方法。

doBind0
-------

```java
    private static void doBind0(
            final ChannelFuture regFuture, final Channel channel,
            final SocketAddress localAddress, final ChannelPromise promise) {
        channel.eventLoop().execute(new Runnable() {
            @Override
            public void run() {
                    ......
                    channel.bind(localAddress, promise).addListener(ChannelFutureListener.CLOSE_ON_FAILURE);
                    ......
            }
        });
    }

```

`doBind0`在另一个线程中将监听的地址绑定到`channel`上去，猜测这个`channel`应该是一个`NioServerSocketChannel`。然而并不是：

```java
    @Override
    public final ChannelFuture bind(SocketAddress localAddress, ChannelPromise promise) {
        return tail.bind(localAddress, promise);
    }

```

netty试图找到`pipline`上的最后一个`OutboundHandler`，这个`handler`有一个与之关联的`HeadContext`，它的`bind`方法如下：

```java
        @Override
        public void bind(
                ChannelHandlerContext ctx, SocketAddress localAddress, ChannelPromise promise)
                throws Exception {
            unsafe.bind(localAddress, promise);
        }

```

```java
        @Override
        public final void bind(final SocketAddress localAddress, final ChannelPromise promise) {
            ......
                doBind(localAddress);
            ......
            if (!wasActive && isActive()) {
                invokeLater(new Runnable() {
                    @Override
                    public void run() {
                        pipeline.fireChannelActive();
                    }
                });
            }
        }

```

`unsafe`的`bind`方法在调用`doBind`同时，不忘发起一个`channelActive`事件。 最终让`javaChannel`监听该地址：

```java
    @Override
    protected void doBind(SocketAddress localAddress) throws Exception {
        if (PlatformDependent.javaVersion() >= 7) {
            javaChannel().bind(localAddress, config.getBacklog());
        } else {
            javaChannel().socket().bind(localAddress, config.getBacklog());
        }
    }

```

注意到，此时`javaChannel`上的`interestOps`只有0，也就是无论`channel`上发生什么事件，都不会被`selector`选中，作为一个服务器，是肯定要处理`ACCEPT`事件的，在`pipeline.fireChannelActive()`中，经过`pipline`，调用到了`unsafe.beginRead()`方法：

```java
    @Override
    protected void doBeginRead() throws Exception {
        ......
        final int interestOps = selectionKey.interestOps();
        if ((interestOps & readInterestOp) == 0) {
            selectionKey.interestOps(interestOps | readInterestOp);
        }
    }

```

这里的`readInterestOp`的值为16，对应的java nio中的`OP_ACCEPT`。

总结
==

netty启动过程还是很复杂的，启动过程总结如下：

1.  `channelFactory`通过反射实例化`ServerSocketChannel`对象。
2.  初始化`channel`的attrs和options。
3.  要求新连接到来的时候，在`pipeline`尾部添加一个`ServerBootstrapAcceptor`。
4.  选择一个`eventLoop`，注册到该`channel`上。
5.  在`javaChannel`上注册这个`eventLoop`的`selector`。
6.  触发`handlerAdded`和`channelRegistered`事件。
7.  将`javaChannel`绑定到指定的地址和端口上去。
8.  触发`channelActivated`事件。
9.  注册`OP_ACCEPT`到`selector`上去。