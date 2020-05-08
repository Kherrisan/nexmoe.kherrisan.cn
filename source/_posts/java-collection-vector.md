---
title: Java Collection——Vector
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 484.html
id: 484
abbrlink: 1b534228
date: 2018-02-14 14:45:43
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-14_13-22-11.jpg) Vector类的原型和ArrayList是一模一样的，实现了RandomAccess接口说明遍历的时候使用get方法比使用迭代器方法快（LinkedList就不必实现该接口），继承了AbstractList提供的一些较为基础和简单的方法实现（比如常常提到的modCount）。

<!-- more -->

属性
--

Vector也是基于数组实现的列表，因此拥有一个Object数组来存放元素，其长度就是概念上的Capacity。 此外，还有elementCount和capacityIncrement，前者用来记录数组中有效元素的个数（size），后者表示当size>capacity时，自动增长的长度。

方法
--

绝大多数方法都用synchronized修饰。

### ensureCapacity

在添加元素时确保数组够大，如果不够就需要扩容。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-14_13-31-38.jpg) 在grow时会使用到capacityIncrement，如果这个值大于0，就按这个值看扩大数组尺寸，否则就扩大一倍。当然还是要和minCapacity比一比，和Vector类的最大尺寸比一比。

### elements

在之前的所有List中都没有见过类似的方法，该方法返回一个实现了Enumeration接口的匿名内部类的对象，供外部程序遍历。 在内部类中实现的方法也是保证了同步。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-14_13-49-36.jpg) 之所以在其他的List实现类都没有遇到类似的方法，是因为Enumeration接口的功能以及被迭代器所取代，现在已经很少使用了。 Enumeration只支持两个操作，一是判断是否还有元素，二是返回下一个元素。

### synchronized

除了构造函数外，所有的public方法都用synchronized修饰，或者其间接的调用synchronized方法，如remove(Object)虽然没有synchronized修饰，但是其调用的removeElement(Object)是有synchronized的。 包括capacity(),size(),isEmpty()这些只需要返回一个属性的较为简单的方法，也是有同步控制的。

迭代器
---

和其他List基本一致，除了多了额外的synchronized之外。

总结
--

Vector和CopyOnWriteArrayList都是线程安全的List，二者的区别在于:

1.  锁的方法不同：前者为使用synchronized，后者为使用ReentrantLock。但是二者都是可重入锁，也就是说一个synchronized的函数内部再调用一个synchronized函数是不会死锁的。
2.  同步的范围不同，前者的读操作和写操作都同步了，后者读的操作没有加锁。