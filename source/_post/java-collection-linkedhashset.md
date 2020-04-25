---
title: Java Collection——LinkedHashSet
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 564.html
id: 564
date: 2018-02-19 19:06:22
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-19_18-57-54.jpg) 区别于HashSet，LinkedHashSet使用了一个双向链表来串联所有节点。LinkedHashSet的实现相当的简单，它继承了HashSet，在HashSet的构造函数中插入了一个直接以LinkedHashMap作为实现的构造函数。其余所有方法均与HashSet一致。但是由于在构造函数中少传了一个参数，因此LinkedHashSet无法由用户决定是按照accessOrder还是按照insertOrder。可以得出这样的结论：LinkedHashSet中遍历元素始终是按照插入元素的顺序遍历的。