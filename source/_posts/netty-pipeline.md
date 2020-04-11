---
title: Netty——Pipeline(1)
categories:
  - Netty
tags:
  - java
  - Netty
copyright: true
url: 1084.html
id: 1084
date: 2019-01-08 22:25:02
---

)Netty中使用Handler对数据包进行处理，每个Handler成为整个处理过程的一个阶段，几个Handler前后相连构成了一个处理数据包的流水线（Pipeline）。同一个Handler实现可以在多种不同的处理流程中发挥自身的局部作用，可复用。 `Pipeline`的继承结构： ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/e1fb7cb818b3cd0d10e25e3905f0efcb.png)

<!-- more -->

第一个Pipeline
===========

同样的，还是先寻找第一个`Pipeline`是在什么地方创建并初始化的。从我对Netty的了解来看，应该是`Channel`和`Pipline`之间关联较大，可能会具有一对一的关系。要么是`NioServerSocketChannel`，要么是它的某个父类。最终在`AbstractChannel`中找到了它：

```java
private final DefaultChannelPipeline pipeline;

```

倒也是直接，声明类型就是`DefaultChannelPipeline`，没有声明为其父类，说明`Pipeline`可能没有较多的多态特性需要表现出来。

```java
    protected AbstractChannel(Channel parent) {
        this.parent = parent;
        id = newId();
        unsafe = newUnsafe();
        pipeline = newChannelPipeline();
    }

```

```java
    protected DefaultChannelPipeline newChannelPipeline() {
        return new DefaultChannelPipeline(this);
    }

```

每个`AbstractChannel`对象都有一个属于自己的`Pipeline`，并且在它的构造函数中实例化pipeline对象。

```java
    protected DefaultChannelPipeline(Channel channel) {
        this.channel = channel;
        ......

        tail = new TailContext(this);
        head = new HeadContext(this);

        head.next = tail;
        tail.prev = head;
    }

```

至此第一个`Pipeline`诞生，这个`Pipeline`中只有两个节点：head和tail。`Pipeline`中的节点以双向链表的形式相连。

第一次插入节点
=======

下面来探索第一次向该`Pipeline`中插入节点的场景。在netty启动的过程中，`AbstractBootstrap`的`initAndRegister`方法会调用`ServerBootstrap`中的`init`方法，该方法第一次向`Pipeline`中插入元素。

```java
    @Override
    void init(Channel channel) throws Exception {
            ......
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

`init`方法的参数`channel`是刚刚通过反射创建出来的`NioServerSocketChannel`对象，该对象具有一个`Pipeline`对象，现在在这个pipeline的尾部插入一个`ChannelInitializer`，并且在将来的某个时候，会调用这个initializer的`initChannel`方法，执行重写的代码。 暂时不去理会重写的代码什么时候执行，先搞清楚`addLast`方法做了什么事情。在深入了几个重载函数之后，看到了`addLast`的真身：

```java
    @Override
    public final ChannelPipeline addLast(EventExecutorGroup group, String name, ChannelHandler handler) {
        final AbstractChannelHandlerContext newCtx;
        synchronized (this) {
            checkMultiplicity(handler);

            newCtx = newContext(group, filterName(name, handler), handler);

            addLast0(newCtx);

            // If the registered is false it means that the channel was not registered on an eventloop yet.
            // In this case we add the context to the pipeline and add a task that will call
            // ChannelHandler.handlerAdded(...) once the channel is registered.
            if (!registered) {
                newCtx.setAddPending();
                callHandlerCallbackLater(newCtx, true);
                return this;
            }

            EventExecutor executor = newCtx.executor();
            if (!executor.inEventLoop()) {
                newCtx.setAddPending();
                executor.execute(new Runnable() {
                    @Override
                    public void run() {
                        callHandlerAdded0(newCtx);
                    }
                });
                return this;
            }
        }
        callHandlerAdded0(newCtx);
        return this;
    }

```

```java
    private static void checkMultiplicity(ChannelHandler handler) {
            ChannelHandlerAdapter h = (ChannelHandlerAdapter) handler;
            if (!h.isSharable() && h.added) {
                throw new ChannelPipelineException();
            }
            h.added = true;
    }

```

```java
    private AbstractChannelHandlerContext newContext(EventExecutorGroup group, String name, ChannelHandler handler) {
        return new DefaultChannelHandlerContext(this, childExecutor(group), name, handler);
    }

```

`addLast`并不仅仅是将新的handler插入到链表中，还做了一些其他的事情：

1.  `checkMultiplicity`，检查该handler对象有没有被插入过，不管是该pipeline还是其他的pipeline。在netty中，只有被`@Sharable`注解的handler才可以被复用到pipeline中，否则一个handler对象只能出现在一处。这么做是为了保证状态变量的线程安全。
2.  `newContext`，用一个`ChannelHandlerContext`对象来包裹这个handler。
3.  `addLast0`，在链表中插入这个`ChannelHandlerContext`。
4.  检查pipeline有没有完成到某个`NioEventloop`的注册，即channel有没有注册到`NioEventloop`。 3.1. 如果没有注册，那么`handlerAdded`的回调函数是不能立刻调用的，因为还没有eventloop线程实体与之绑定——在netty中各种事件的回调函数都是在`NioEventloop`中调用的，在以后还会遇到很多体现这个特征的场景。 3.2. 如果已经注册过了，在eventloop中调用`callHandlerAdded0`。

这里遇到了一个类`DefaultChannelHandlerContext`，这个类的地位十分重要，承担了维系pipeline和handler的工作。

```java
    DefaultChannelHandlerContext(
            DefaultChannelPipeline pipeline, EventExecutor executor, String name, ChannelHandler handler) {
        super(pipeline, executor, name, isInbound(handler), isOutbound(handler));
        if (handler == null) {
            throw new NullPointerException("handler");
        }
        this.handler = handler;
    }

```

```java
    AbstractChannelHandlerContext(DefaultChannelPipeline pipeline, EventExecutor executor, String name,
                                  boolean inbound, boolean outbound) {
        this.name = ObjectUtil.checkNotNull(name, "name");
        this.pipeline = pipeline;
        this.executor = executor;
        this.inbound = inbound;
        this.outbound = outbound;
        // Its ordered if its driven by the EventLoop or the given Executor is an instanceof OrderedEventExecutor.
        ordered = executor == null || executor instanceof OrderedEventExecutor;
    }

```

`AbstractChannelHandlerContext`维护了pipeline对象，表明他是属于这个pipeline的一个节点，以后若是有需要可以直接通过这个pipeline成员调用其方法。netty中的handler可以分为两类：`inbound`和`outbound`（当然有的handler可以同时具有这两种特性），为了区分包含的handler的方向，`AbstractChannelHandlerContext`使用了两个boolean，由于之前括号里的情况存在，显然一个boolean是不够的。此外，`AbstractChannelHandlerContext`还有一个executor，这个executor是pipeline通过`childExecutor`方法分配给他的，这里先不谈分配方式。 再来看`addLast0`:

```java
    private void addLast0(AbstractChannelHandlerContext newCtx) {
        AbstractChannelHandlerContext prev = tail.prev;
        newCtx.prev = prev;
        newCtx.next = tail;
        prev.next = newCtx;
        tail.prev = newCtx;
    }

```

有数据结构基础的人都能够很快理解这段代码，对于没有学过数据结构的人来说双向链表的插入操作也不是很难。 停！现在来给pipeline拍一张快照： ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/44464b519546afc2bfeed5d917c1cd5f.png) 现在pipeline中有三个节点，其中`HeadContext`和`TailContext`都是没有handler的，中间的`HandlerContext`包含一个`ChannelInitializer`。 在链表中插入了新的handlerContext之后，需要决定是否需要调用它的`handlerAdded`方法。如果暂时不调用回调方法的话：

```java
    private void callHandlerCallbackLater(AbstractChannelHandlerContext ctx, boolean added) {
        PendingHandlerCallback task = added ? new PendingHandlerAddedTask(ctx) : new PendingHandlerRemovedTask(ctx);
        PendingHandlerCallback pending = pendingHandlerCallbackHead;
        if (pending == null) {
            pendingHandlerCallbackHead = task;
        } else {
            while (pending.next != null) {
                pending = pending.next;
            }
            pending.next = task;
        }
    }

```

handlerContext会被包装成一个`PendingHandlerCallback`，插入到由pipeline维护的`PendingHandlerCallback`的链表的末尾。 如果我们在pipeline注册到eventloop之前，在pipeline中插入多个handler，那么这些handler的`handlerAdded`方法都会被包装成pendingTask，接续到链表后。同样的，如果是在注册之前删除某个handler，它的`handlerRemoved`也会被包装，并插入链表。 **我认为这么做的目的是保证在注册前发生的add和remove操作都会导致其对应事件的回调函数能够被正确的调用，这里的正确指的是按照正确的顺序在eventloop中调用。不能因为某个handler先被add然后被remove就认为它从没有出现过。** 当然了，也有可能注册得比较早，那么`handlerAdded`方法可以立刻执行，没有必要等什么。

```java
            EventExecutor executor = newCtx.executor();
            if (!executor.inEventLoop()) {
                newCtx.setAddPending();
                executor.execute(new Runnable() {
                    @Override
                    public void run() {
                        callHandlerAdded0(newCtx);
                    }
                });
                return this;
            }
            callHandlerAdded0(newCtx);

```

```java
    private void callHandlerAdded0(final AbstractChannelHandlerContext ctx) {
            ......
            ctx.handler().handlerAdded(ctx);
            ......
    }

```

现在，把时间轴向前推进，直接走到`initChannel`调用之前：

```java
        private void register0(ChannelPromise promise) {
            try {
                doRegister();
                pipeline.invokeHandlerAddedIfNeeded();
                safeSetSuccess(promise);
                ......
            } catch (Throwable t) {
                ......
            }
        }

```

`invokeHandlerAddedIfNeeded`就是专门用来触发之前pending的`handlerAdded`事件的。

```java
    final void invokeHandlerAddedIfNeeded() {
        assert channel.eventLoop().inEventLoop();
        if (firstRegistration) {
            firstRegistration = false;
            callHandlerAddedForAllHandlers();
        }
    }

```

`callHandlerAddedForAllHandlers`也的确只会被调用一次，就是在这里。在其他地方，handler的added事件不会延迟执行，是即时的。

```java
    private void callHandlerAddedForAllHandlers() {
        ......
        PendingHandlerCallback task = pendingHandlerCallbackHead;
        while (task != null) {
            task.execute();
            task = task.next;
        }
    }

```

沿着pendingTask的链表，逐个执行`handlerAdded`和`handlerRemoved`回调事件。当然这里的`execute`方法会保证在当前的eventloop中执行`handlerAdded`或`handlerRemoved`回调函数的代码。 **也就是说，为了让handler的added和removed事件不遗漏、不乱序、串行地得到执行，netty采用将added和removed事件包装成pendingTask的方式，在pipeline注册到某个eventloop后，再在一个方法中去逐个回调pendingTask。** 回到`ChannelInitializer`中，它的`handlerAdded`实现如下：

```java
    @Override
    public void handlerAdded(ChannelHandlerContext ctx) throws Exception {
        if (ctx.channel().isRegistered()) {
            initChannel(ctx);
        }
    }

```

`ChannelInitializer`作为一种特殊的handler，主要用于在channel启动时做一些初始化工作，为了达成这样的效果，它的做法是在它自身被插入到pipeline之后立即做`initChannel`操作。

```java
    private boolean initChannel(ChannelHandlerContext ctx) throws Exception {
            try {
                initChannel((C) ctx.channel()); // 调用重写的initChannel方法
            } catch (Throwable cause) {
                ......
            } finally {
                remove(ctx); // 把自己从pipeline中删掉
            }
        }
    }

```

在`ServerBootstrap`中见到的`ChannelInitializer`匿名内部类的`initChannel`做了这些事情：

```java
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

```

1.  从`config()`中取出一个handler，添加到pipeline的末尾。从调试时的结果来看，这是一个`LoggingHandler`（估计就是专门负责打日志的）。
2.  异步地在pipeline末尾插入一个`ServerBootstrapAcceptor`。

再给pipeline拍一张快照： ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/1d0c5dc9d01a99fbdf25dadaac0b36d9.png)