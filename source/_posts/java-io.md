---
title: Java——IO体系概览
categories:
  - JavaSE
tags:
  - java
copyright: true
url: 769.html
id: 769
date: 2018-05-07 16:53:04
---

java整个io包主要分为四块：字节流、字符流、File、RandomAccessFile。其中最复杂的是字节流和字符流两个簇，File和RandomAccessFile的功能较为单一。从名字可以看出，RandomAccessFile用于随机读写，字节流和字符流则用于顺序读写。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-05-07_16-01-04.jpg)

<!-- more -->

字节流
===

字节流以字节为单位进行输入输出操作，也是JDK较早的版本中就存在的IO方式。字节流IO提供了两大接口InputStream和OutputStream，一个用于输入，一个用于输出。 输入是指从“外部”某个对象上读取数据到JVM内存中，这个对象可以是**磁盘上的一个文件**，可以是**套接字**，可以是另一个**进程的标准输出**，甚至也可以是一个本来就在这个进程的内存空间里的一个**字节数组或者字符串**。

InputStream
-----------

字节输入流的总接口，接口中规定了输入字节流的各种实现所需要提供的方法。接口中声明的方法只有寥寥数个。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-05-07_16-43-36.jpg) 由于是字节流，所以输入的最小单位是字节（Byte），但是read方法返回的是int，范围是0-255，如果读到了文件末尾，返回-1。不带参数的read方法返回的是一个字节，带参数的read方法将读到的数据直接填充进参数的byte数组中，返回的是实际读取的字节数，类似于Unix中的read方法。  

FileInputStream
---------------

文件输入字节流，用于从一个外存中的文件读取数据。在FileInputStream的源码中可以看到很多出native关键字，说明读取数据的方法主要由C++调用本地接口实现的。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-05-07_16-50-51.jpg)

ByteArrayInputStream
--------------------

从一个字节数组中读取数据，这个字节数组实际上就是内存里的一个byte\[\]对象。常见的用法是这个样子的： ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-05-07_16-56-46.jpg)

ObjectInputStream
-----------------

是一个包装器流，能够将一个输入的字节流自动根据字节序解序列化，转换成开发人员所需要的对象或基本数据类型。当然转换成什么数据类型必须要在代码中自己指定，如果指定错了就会导致数据出现错误。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-05-07_17-14-47.jpg) 如上图所示，ObjectOutputStream读取基本数据类型或者变量需要提前知道输入流的结构。如果输入时不按照字节流的结构，很有可能会抛出异常。 直接读写对象时，要求对象实现Serializable接口。虽然这个接口只是一个标记接口，没有函数。而且序列化的方式完全由JVM决定，序列化之后的结果对于人来说是不可读的。 默认会把对象的所有字段都序列化，如果需要略过某些字段，可以添加transient修饰符。当然被序列化的对象中包含的其他对象的引用的话，也是会被序列化的。 反序列化不会调用对象的构造函数。

BufferedInputStream
-------------------

是一个包装器流，在输入的时候提供一个缓冲。这个缓冲就是一个byte\[\]对象，默认大小为8k，最大大小为Integer.MAX_VALUE-8。 输入的时候，默认从缓冲中读取，如果缓冲中没有足够数据，就先把缓冲区填满，再读。

DataInputStream
---------------

类似于ObjectInputStream，能够提供一组与平台无关的函数来读取基本数据类型。至于ObjectInputStream和DataInputStream的区别：

> DataInput/OutputStream performs generally better because its much simpler. It can only read/write primtive types and Strings. ObjectInput/OutputStream can read/write any object type was well as primitives. It is less efficient but much easier to use if you want to send complex data. I would assume that the Object*Stream is the best choice until you _know_ that its performance is an issue.

意思就是，二者在读取基本数据类型的时候几乎没有区别。

PrintStream
-----------

这是一个输出流，System.out,System.err就是PrintStream实例。PrintStream所提供的方法与其他几个输出流不太一样，除了write其他的都是print。 PrintStream提供格式化输出字符串的方法printf，此外也可以输出各种基本数据类型和引用类型对象。相比于ObjectOutputStream和DataOutputStream，PrintStream的方法更加简练，一个print就可以应对各种数据类型。 PrintStream有两大特征：不会抛出IOException；自动flush（遇到换行、\\n、写byte\[\]）。

字符流
===

为了解决国际化的问题，JDK在某个较新的版本中引入了字符流，由Reader和Writer两大簇组成。字符流不论输入和输出，基本单位都是字符，字符在Java中是Unicode字符集的，占2个字节。 字符流家族中很多类都是和字节流中某个类对应的。如BufferedInputStream和BufferedReader，FileOutputStream和FileWriter等。 因为输入输出的单位都是字符，因此（输入时）函数返回值和（输出时）函数传入参数都是char或者char\[\]或者String类型，其中也有int类型的，这个int的范围应该是0-2^16-1。