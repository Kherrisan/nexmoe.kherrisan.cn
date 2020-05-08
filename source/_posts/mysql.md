---
title: MySQL——总体架构
categories:
  - MySQL
tags:
  - MySQL
copyright: true
url: 679.html
id: 679
abbrlink: 77a52e0d
date: 2018-04-30 20:09:58
---

![](https://s3.51cto.com/wyfs02/M02/11/8A/wKiom1LUF8DS1inQAAE8bwOlNTY150.jpg)

层次结构
====

大致分为四层，从上往下看：

1.  客户端和连接管理层：主要用于和用户开展交互，或者提供应用程序开发接口。这层还负责管理用户连接会话、权限控制。使用线程池来处理用户连接请求。
2.  核心服务功能层：SQL的分析、优化、函数的执行，缓存结果的查询。这一层会负责生成查询操作。
3.  存储引擎层：如InnoDB和MyISAM。真正负责查询和修改磁盘上的数据。
4.  数据存储层：包括数据、日志、索引等文件。

<!-- more -->

内存分配
====

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-04-29_16-28-05.jpg)

```null
used_Mem =
+ key_buffer_size
+ query_cache_size
+ innodb_buffer_pool_size
+ innodb_additional_mem_pool_size
+ innodb_log_buffer_size
+ max_connections *(
    + read_buffer_size
    + read_rnd_buffer_size
    + sort_buffer_size
    + join_buffer_size
    + binlog_cache_size
    + thread_stack
    + tmp_table_size
    + bulk_insert_buffer_size
)

```

线程共享内存
------

在MySQL中，线程独享内存主要用于各客户端连接线程存储各种操作的独享数据，如线程栈信息，分组排序操作，数据读写缓冲，结果集暂存等等，而且大多数可以通过相关参数来控制内存的使用量。

1.  key_buffer：MyISAM索引缓存。
2.  query_cache：查询缓存，如果两次查询的结果相同，那么后一次查询的结果可以从缓存里得到。
3.  innodb\_buffer\_pool：innodb数据和索引缓存。
4.  innodb\_additional\_mem_pool：innodb字典信息缓存。
5.  innodb\_log\_buffer：innodb日志缓存，主要用于记录事务操作，缓存里日志足够多了之后才会写到外存的日志文件中去。

线程独享内存
------

1.  read_buffer：顺序读缓冲区，相当于一个窗口，满了就把查询的结果返回给上层。
2.  read\_rnd\_buffer：随机读缓冲区，同上。
3.  sort_buffer：排序缓冲区，数据在这里被排序，如果数据过多放不下，那就要放在外存进行排序，效率会大大降低。
4.  join\_buffer：join操作缓存，这里就不得不提一下join的原理——嵌套循环了，以驱动表的结果集作为基础，一条一条作为下一个表的过滤条件进行查询。如果说先把驱动表的关联字段读入join\_buffer，然后让下一张表直接和join_buffer中的字段比较，这样就可以减少下一张表的扫描次数，从而降低时间开销。
5.  binlog_cache：二进制日志缓冲。
6.  thread_stack
7.  tmp_table：如group by、order by等操作会产生临时表，如果表够小的话直接存放在缓存里即可。
8.  bulk\_insert\_buffer：批量插入操作缓存，如`insert into table_name values(),(),()`，会在缓冲区满的时候一次性写入磁盘。