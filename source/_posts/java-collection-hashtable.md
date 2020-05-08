---
title: Java Collection——HashTable
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 796.html
id: 796
abbrlink: 212ef57b
date: 2018-10-05 15:00:47
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-05-09_16-06-28.jpg) HashTable继承了Dictionary类，这个抽象类没有在HashMap中见到过。进入该Dictionary抽象类中，发现所有的方法都没有实现，而且和Map接口很相似。 初步浏览了一下HashTable，感觉比HashMap更轻量一些，同时额外地提供了同步机制（在方法之前加synchronized关键字，类似于Vector之于ArrayList）。

<!-- more -->

属性
==

1.  Entry\[\]类型的table，用于存放散列bucket
2.  count，计数
3.  threshold，重哈希的阈值，如果某次操作是的count超过这个值，就重新散列
4.  loadFactor，装载因子，衡量buckets的稀疏程度，数值上count*loadfactor=threshold，装载因子是可以人为规定的
5.  modcount，修改次数，避免一边便利一边修改结果

方法
==

contains
--------

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/198594764fd8a3073742d7dc3825e52e.png) 对于每一个bucket的每一个节点，根据equal的结果判断是否相等。

get
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/733aee9734108a82dbadfdfc92ecba62.png) 与HashMap不同的是，HashTable的许多方法的key参数都不能为null。包括get和上面的contains。 首先将hashCode映射到buckets空间中，找到bucket，接着遍历链表，根据hash和equals判断是否相等。

put
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/c4a91c12029e0d1787efd34cc39876c6.png) 首先将hashCode映射到buckets空间中，找到bucket，接着遍历链表，根据hash和equals判断是否相等。如果相等，说明原来就有这个key，只要修改该节点的value，如果找不到，调用addEntry来添加该key-value对。

addEntry
--------

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/e3ce2928965d23892192f82e3f3d5752.png)

1.  修改modCount，因为addEntry会改变HashTable的结构。
2.  检查是否要rehash。如果要的话，会重新计算散列index。
3.  直接将新的key-value封装到entry中，插入到链表的首位上。

rehash
------

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/d667be502658a6fa7ce02fd2634d0e8d.png)

1.  计算新的容量，扩容规则为oldCapacity<<1+1。
2.  开辟新的buckets数组。
3.  修改modCount，threshold，切换到新的buckets数组上（此时还是空的）。
4.  遍历老的buckets的每个bucket，遍历每个bucket的每个节点，对每个节点重新计算散列index，插入到index对应bucket的首位上。

remove
------

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/facc0b15f4599a2a37c32621576f81d5.png)

1.  计算散列的index，找到对应bucket。
2.  遍历bucket中每个节点，根据hash和equals判断是否相等，如果相等，就把该节点从链表中删除。