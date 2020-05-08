---
title: Java Collection——LinkedHashMap
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 551.html
id: 551
abbrlink: c2915911
date: 2018-02-17 14:31:56
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-17_12-14-56.jpg) LinkedHashMap和HashMap的区别在于前者在HashMap的基础上还维护了一个贯穿所有节点的双向链表，该链表决定了遍历的顺序，形如一个队列。 当然，这个链表并不会影响HashMap的结构，和HashMap的table或者链表或者红黑树是完全独立的一个结构。该链表的顺序可以是插入元素的顺序也可以是访问元素的顺序，具体选择何种顺序取决于accessOrder属性是true还是false。 在hashmap中预留了几个抽象方法，并在put和get等操作内调用了这些方法，为子类提供了可扩展的点。**我认为这是“模板方法模式”的体现。** 

<!-- more -->

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/4d2e73e200c8762093663515560758e2.png) 在HashMap的Node中，就已经提供了next属性，但没有用到。在LinkedHashMap中，每个节点的next属性根据访问或者插入顺序连接下一个节点。

属性
--

为了记录双向链表的头和尾，使用了两个节点记录head和tail。 另外，使用了一个boolean标记访问顺序。如果为true，则遍历顺序为访问顺序，否则按照插入顺序遍历。默认为false。 这个值是final的，也就是说一旦构造完毕就不能再修改的，因为一旦决定了该值为true，在后续插入删除访问节点时就会做额外的操作来修改链表，这时再修改该值显然是无法还原访问顺序的。

方法
--

### afterNodeRemoval

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/6f431e4c3251e60f0ba1376cb918b5d4.png) 在HashMap的removeNode方法中被调用。这个方法在一个节点被删除之后，删除该节点存在的前向和后向链接，并将该节点的前驱的后向链接和后继节点的前向链接重新设置。

### afterNodeInsertion

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/0e70b312ef4a5d30d59b107fbafcaa59.png) 在HashMap的putVal方法中被调用。在插入新的节点之后，根据需求判断是否需要把最老的节点删掉，如果需要，就调用HashMap的removeNode方法。默认的判断结果为false。

### aftetNodeAccess

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-17_13-14-41.jpg) 在HashMap的putVal方法中被使用到。在访问某个节点后（比如通过put修改该节点的值），把该节点移动到链表的最后。

### transferLinks

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-17_13-34-35.jpg) 拷贝src节点的链接情况到dst节点上。

### put

由于可以针对插入顺序和访问顺序进行遍历，因此在get和put方法中必须要添加额外的代码来修改链表。LinkedHashMap并没有重写put方法，而是在HashMap中就定义了几个回调函数（afterNodeXXX），然后重写了这些回调函数。

### get

LinkedHashMap重写了get方法，在调用HashCode的putVal之后再调用afterNodeAccess回调函数。将访问的节点移动到链表的最后一个。

迭代器
---

### LinkedHashIterator

是一个抽象类，从双向链表的头节点开始遍历，提供了nextNode方法供其他迭代器使用。nextNode方法和remove方法都是fail-fast的。

### LinkedKeyIterator、LinkedValueIterator、LinkedEntryIterator

继承了LinkedHashIterator并完整实现了Iterator接口。