---
title: JavaEE——JSP概览
categories:
  - JavaEE
tags:
  - java
  - jsp
copyright: true
url: 784.html
id: 784
date: 2018-05-07 18:24:37
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-05-07_18-25-12.jpg) JSP是基于Servlet和模板渲染技术发展出来的一种后端开发技术（虽然现在JavaEE说到底都是用的Servlet）。其原理非常简单，模板引擎解析JSP文件之后，将其中的Java对象取出，其余的字面常量统统放入print函数中，以最为淳朴的字符串连接的操作组成最终完整的响应，填充到servlet的对应函数中。

<!-- more -->

生命周期
====

1.  编译：惰性编译，只有在第一次请求的时候，被请求的JSP会被编译为包含一个Servlet的java源码文件，然后再编译为class字节码文件。
2.  初始化：和Servlet的init方法一样，只初始化一次，常见的初始化操作有初始化一些变量、连接数据库、打开文件等。
3.  执行：调用一个以HttpServletRequest和HttpServletResponse为参数的方法。
4.  清理：和Servlet的destory方法一样。

九大对象
====

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-05-07_18-36-41.jpg) 因为JSP和SSM的思路脱节太严重了，所以我也只想了解到这个深度了。