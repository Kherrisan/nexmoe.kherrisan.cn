---
title: Java Collection——HashSet
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 498.html
id: 498
abbrlink: 4e69e352
date: 2018-02-14 14:57:23
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-16_15-13-28.jpg) HashSet的实现是基于HashMap的，与Map不同的地方在于HashSet中Key对应的Value只需要一个标记即可。 由于HashSet最核心的部分————Hash已经由HashMap完成，因此只要加一个包装即可。

<!-- more -->

属性
--

保存了一个hashMap。此外还有一个静态属性来发挥标记的作用。

方法
--

```null
iterator();
size();
isEmpty();
contains(Object);
add(Object);
remove(Object);
clear();

```

基本上所有方法都是直接调用HashMap中的方法，比如empty方法直接返回map.isEmpty()的结果，contains直接返回map.containsKey(Object)的结果。

迭代器
---

没有直接定义迭代器的内部类，而是复用HashMap的迭代器。

其他内部类
-----

无。