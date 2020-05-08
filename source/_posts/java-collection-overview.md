---
title: Java Collection——总览
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 443.html
id: 443
abbrlink: a80f8f54
date: 2018-02-09 13:00:50
---

说明： 1\. 本系列的内容主要为基于相关源码分析Java Collection的实现，包含List、Queue、Set 、Map这四大块。 2. 在学习和整理笔记的过程中，参考了网上其他前辈的资料，由于笔记最终会发布到网上，出于对原创的尊重和对原作者的感谢，需要在引用了前辈的文字、图片、代码处标记出处，但是为了方便（懒），我就不一一标注了，改为集中在本文开始部分罗列参考资料链接。**再次对把自己的研究成果和学习资源上传到互联网上供他人参考和学习的前辈们表示感谢** 参考链接： [\[CarpenterLee/JCFInternals\]深入理解Java集合框架](https://github.com/CarpenterLee/JCFInternals "深入理解Java集合框架")

<!-- more -->

总览
==

JDK提供的集合类包含两大块，一个是collection，一个是map，二者都提供了java对一些常用数据结构是实现，为开发者的日常使用提供了工具。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-09_12-43-43.jpg)

* * *

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-14_13-15-56.jpg) 俗话说，**不要重复造轮子**。既然JDK提供了相关实现，经过了JDK版本的迭代更新以及几十年的开发人员的使用和修改，经历了充分的检验，可以说是可靠的和可用的。

泛型
--

虽然Java的泛型饱受诟病，collection还是基于泛型设计了相关的函数。

接口
--

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-09_12-59-08.jpg)

目录（暂定内容，后期会增加）
==============

1.  [ArrayList](https://www.dokyme.cn/index.php/2018/02/09/java-collection-arraylist/ "ArrayList")
2.  [LinkedList](https://www.dokyme.cn/index.php/2018/02/10/java-collection-linkedlist/ "LinkedList")
3.  [CopyOnWriteArrayList](https://www.dokyme.cn/index.php/2018/02/11/java-collection-…onwritearraylist/ "CopyOnWriteArrayList")
4.  [Vector](https://www.dokyme.cn/index.php/2018/02/14/java-collection-vector/ "Vector")
5.  [HashMap](https://www.dokyme.cn/index.php/2018/02/14/java-collection-hashmap "HashMap")
6.  [HashSet](https://www.dokyme.cn/index.php/2018/02/14/java-collection-hashset/ "HashSet")
7.  [LinkedHashMap](https://www.dokyme.cn/index.php/2018/02/17/java-collection-linkedhashmap/ "LinkedHashMap")
8.  [LinkedHashSet](https://www.dokyme.cn/index.php/2018/02/19/java-collection-linkedhashset/ "LinkedHashSet")