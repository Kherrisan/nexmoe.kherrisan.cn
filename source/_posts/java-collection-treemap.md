---
title: Java Collection——TreeMap
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 573.html
id: 573
abbrlink: '3265045'
date: 2018-02-21 14:12:22
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-21_14-15-34.jpg) TreeMap继承了AbstractMap抽象类，实现了NavigableMap接口。这个接口是HashMap和LinkedHashMap的定义中都没有见过的，从字面意思上来看，应该是“可导航Map”，到底是怎么个导航法，需要先了解一下这个接口。 

<!-- more -->

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-21_14-21-43.jpg) NavigableMap也不是一个顶级的接口，它实现了SortedMap接口。SortedMap接口描述了Map的排列方式的一种特殊情形：所有的Key-Value对都是按照Key的大小一致升序或者降序排列，这里的大小指的就是Comparable接口。降序或者升序集中体现在遍历该Map的时候。有了这个特性，就可以提供一些其他的功能。如给定一个key，返回所有的大于这个key的Key-value组成的Map（视图），或者所有小于这个key的key-value组成的Map（视图）。 NavigableMap在SortedMap提供有序key-value的基础上拓展了一些功能，能够提供离某个key最近的entry，可以以目标key为上界，也可以之为下界。有点类似于向上取整和向下取整的意思。 再回到TreeMap，根据它的注释，可知TreeMap是基于红黑树实现的Map（注释中还特别强调了是算法导论中的红黑树hhh），基本的增删改查需要log(n)的时间复杂度，这比HashMap慢一些，因为HashMap使用的是散列表，访问元素只需要线性时间。 TreeMap是一个相当复杂的类，不仅仅是在算法的实现上，更在于类结构的设计上。

属性
--

一个Comparator，用于记录比较运算符。如果key实现了Comparable方法，就不需要这个Comparator。 一个Entry，用于记录根节点。 一个size，用于记录元素个数。 一个modCount，用于检查conModification。

方法
--

### getEntry

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-21_15-04-14.jpg) 从代码中可以看到，如果没有comparator，那么key是不允许为null的，否则可以通过comparator来实现对于null键的判断规则，即便是根节点，也可以是null。而在HashMap中，null键是可以插入、查询的。

### getEntryUsingComparator

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-21_15-19-06.jpg) getEntry和getEntryUsingComparator的实现思路是相同的，都是从树根出发，向左或向右行走，直到找到相等的节点。两个方法的区别在于一个是通过comparator做比较，一个是通过key的compareTo方法。在注释中解释说把getEntryUsingComparator方法抽取出来的目的在于提高效率。

### put

put方法用于向TreeMap中插入新元素，或者修改原有的key的值。由于使用的是红黑树，因此插入元素可能涉及一些对于红黑树结构的修改。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-21_15-31-19.jpg) 插入新节点后调用fixAfterInsertion方法插入新元素并调整树结构。 这里先跳过红黑树相关操作的实现。

### getCeilingEntry

找到某个key对应的entry，如果找不到，就取比这个key大并且紧邻着这个key的entry，类似于向上取整。根据二叉搜索树的性质，需要向下遍历。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-23_13-44-25.jpg) 如果给定的key比此节点的key大，就向右子树走，如果没有右子树，沿父节点回溯，直到某个节点是其父节点的左儿子，返回其父节点；如果给定的key比此节点的key小，就向左子树走（显然右子树的节点都会比此节点的key大），如果没有左子树，就取这个节点。

### getHigherEntry

和getCeilingEntry类似，区别在于不找相等的key对应的entry，而是直接命中比给定key大并且紧邻着这个key的entry。

迭代器
---

### PrivateEntryIterator

这是一个其他迭代器类的父类，实现了Iterator接口及其方法，同样控制了modCount，保证在遍历的时候map的结构不发生改变。

### EntryIterator、ValueIterator、KeyIterator、DescendingKeyIterator

分别是针对Entry、Value、Key的四个具体的迭代器。

其他内部类
-----

### Entry

TreeMap的静态内部类，定义了一个Key-Value对的节点。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-23_14-40-47.jpg) 此内部类只有寥寥数个方法，都是setter和getter方法，没有什么特别的。唯一有些特殊的是hashCode，这个函数根据key和value计算出hashCode，方法是将key的hashCode异或value的hashCode。

### NavigableSubMap

### Values、EntrySet

定义了两个视图。