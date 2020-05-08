---
title: HTTP协议详解
categories:
  - HTTP
tags:
  - HTTP
  - 网络
copyright: true
url: 824.html
id: 824
abbrlink: b9e67ec1
date: 2018-06-30 20:45:00
---

HTTP协议应该是如今互联网中使用范围最广的协议了。现在对HTTP协议进行一个全面的分析，力求能够把常用的协议功能都覆盖到。

1 概述
====

HTTP协议全名为超文本传输协议，英文名为Hypertext Transfer Protocol，不出意外也是一个外国人发明的网络传输协议。这个协议大概在1960年左右被构思出来，后来经过多方合作，不断地被修改和完善，最终进入RFC，成为互联网标准之一，应该是和TCP协议重要性相当的。  

<!-- more -->

[RFC 1945 - HTTP1.0](https://tools.ietf.org/html/rfc1945)[RFC 2616 - HTTP1.1](https://tools.ietf.org/html/rfc2616)  

HTTP协议被广泛运用于浏览器访问Web网页的场景中，当然其灵活性也使得它能够在其他领域发挥优势比如API、RPC。

1.1 协议栈
-------

如今互联网绝大多数主机使用的是TCP/IP协议，这个协议有5层，分别是：物理层、链路层、网络层、传输层和应用层，所谓的4G、5G、WIFI为物理层技术；链路层常用协议有以太网、X.25、令牌环等（实际上除了以太网之外其他的链路层协议都已经基本上不存在了，只是在计算机网络课上介绍过而已）；网络层协议为IP；传输层协议为TCP或UDP；到了应用层，协议就多种多样了，常用的有FTP、HTTP，任何一个基于Socket编写的应用程序都可以说是实现了一个应用层协议，或者说工作在应用层上。  

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-06-30_20-37-53.jpg)

  
 

HTTP协议属于典型的应用层协议，其工作在应用层之上，屏蔽了TCP层的接口，同时应用程序可以直接使用HTTP协议进行通讯。虽然HTTP协议看起来不复杂，用起来也挺方便，但是要时刻记住它还是基于TCP/IP协议运作的，只是将下层的细节屏蔽了而已，但是真正运行起来它还是要遵循下层协议的规则，如TCP层的拥塞控制、IP层的报文分段（MSS）、IP寻址等等。  

如今将HTTP协议置于TLS层之上，变为HTTPS，也是一种较为流行的加密网络通讯协议。有关HTTPS协议的细节以后再谈，今天只看HTTP明文通讯。

1.2 运作流程
--------

以浏览器地址栏输入www.baidu.com并回车为例，一次典型的HTTP协议通讯过程如下：  

1\. 浏览器通过DNS协议解析得到baidu.com主机的IP地址（有关DNS的细节这里也不谈）。  

2\. 浏览器于该IP地址建立TCP连接，即Socket连接，HTTP服务一般是运行在80端口上，即本地的一个随机端口和远程服务器的80端口进行连接，需要进行3次握手（SYN、SYN+ACK、ACK）。  

3\. 在发送了三次握手的最后一次ACK报文之后，正式开始发送HTTP请求，这里可以先把请求理解为一个字符串，或者一个比特流，在该比特流外部包裹TCP头部、IP头部、以太网头部，然后经过网线发送给服务器。  

4\. 服务器逐层拆包，得到真正的HTTP请求内容后，根据请求内容中的具体信息，从服务器的硬盘或者内存中读取HTTP请求中所明确的具体资源（百度首页的html文件）作为响应内容，再次以比特流的形式，逐层打包，返回给客户端浏览器。  

5\. 浏览器逐层拆包，得到响应内容，经过浏览器渲染进而呈现出来。  

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-06-30_20-57-34.jpg)

  
 

以上是使用浏览器访问www.sina.com的过程中与服务器之间往返的数据。可以看到第四个报文才是HTTP请求报文，三次握手大概用了0.1s的时间，从HTTP请求到收到响应大概用了0.26s的时间，延迟还是很小的。当然到了HTTPS，由于交换证书和协商密钥的需要，又要花费更多的时间来建立连接（2-3个RTT）。

2 HTTP协议格式
==========

远程协议，最重要的就是协议格式，以太网、IP、TCP都有一套相当严格但又可扩展的格式，HTTP也有。

2.1 请求/响应格式
-----------

请求和响应统称为HTTP消息，他们的格式其实这么形容：  

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-06-30_21-16-03.jpg)

  
 

首先是一个开始行，然后是消息头（包含0个或多个，每个头部以回车换行结尾），接着是一个CRLF（回车换行），最后是消息体（可选）。  

消息头部中有一些头部字段是请求和响应都可以使用的，称为通用头部。

### 2.1.1 通用头 GeneralHeader

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-06-30_21-25-03.jpg)

  
 

Cache-Control：指定缓存机制，请求和响应头中都可以使用该字段。请求头：no-cache、no-store、max-age、max-stale、min-fresh、only-if-cached，响应头：public、private、no-cache、no-store、no-transform、must-revalidate、proxy-revalidate、max-age。  

Connection：由于HTTP1.1默认使用长连接，因此如果要拒绝使用长连接，可以将该字段设为false。只要有一方的头部的false就不会使用长连接。  

Via：报文经过的中间节点，网关或者代理。  

Trailer：有一些字段的值可能是随着发送动态生成的，比如Expire，Date，Trailer允许指定某个字段的值被推迟到某个响应体的数据块的尾部。  

Upgrade：希望升级的协议信息。

2.2 请求格式
--------

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-06-30_21-28-36.jpg)

### 2.2.1 请求行

#### 2.2.1.1 URI

全名为统一资源定位符，明确指定了一个资源或者多个资源的所在的位置。URI可以是相对的也可以是绝对的，如之前访问sina的请求中URI就是相对的，即服务器根目录，而具体的主机地址则在请求头的Host字段中。

#### 2.2.1.2 Method

如今流行一种成为Restful风格的后端API设计风格，这其中就充分利用了Method字段，Method字段描述了这个HTTP请求的动作意图，是查询数据（GET）、提交数据（POST），还是删除数据（DELETE），甚至是只请求响应的头部而不要响应体（HEAD）。从语义上来说Method字段并没有明确的规范，如果你同时负责了客户端和服务器端的开发，那你完全可以随意约定，只需要保证一致性即可。当然尽量符合语义来总归是好的。

#### 2.2.1.3 HTTP-Version

采用的HTTP协议的版本号，常用的有1.0、1.1、2.0，不同的版本号代表客户端可以接受的HTTP协议版本，版本越低功能越low。

### 2.2.2 请求头 RequestHeader

除了通用头部之外，请求头还可以使用如下字段：  

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-06-30_21-38-17.jpg)

  
 

Accept：请求方希望接收的数据类型，常见的有text/html，application/json，以及通配符*/*。  

Expect：客户端在发起请求前可以在该字段中注明将要进行的操作，然后将这个请求发给服务器作为一个握手信息，等到服务器返回接受后再发送真正的请求。在POST大对象的时候常常使用此字段来避免传输无效的流量。  

Host：主机名。  

Range：请求方希望接收的是完整响应文件的某一段数据，那么可以通过该字段来指定第一个字节和最后一个字节的偏移，这个字段常常用于HTTP断点续传。  

Referer：从哪个链接过来的。服务器通过限制该字段可以防盗链。  

User-Agent：标识了浏览器相关信息。服务器可以通过该字段来判断访问的是PC还是移动设备，或者根据更加详细的信息来返回充分适配的网页资源。

### 2.2.3 实体头 EntityHeader

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-07-31_13-45-00.jpg)

  
 

Allow：严格限定该URL能够接受的method。  

Content-Encoding：编码方式，如gzip、x-gzip压缩。  

Content-Length：数据实体的大小，用十进制整数表示。注意这个数字是数据实体的大小，和是否压缩无关。  

Content-Type：数据实体的媒体类型，格式为 Type/SubType，如 text/html。  

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-07-31_13-53-09.jpg)

  
 

Expires：一个时间。既然HTTP是一个远程协议，那就会出现分布式系统中一定会出现的数据一致性的问题。Expire字段用于标识该资源的有效期，客户端能够在该有效期内缓存该资源。  

Last-Modified：该资源上次被修改的时间，类似于文件属性的修改时间。当然如果资源实体的类型不同，也能够表示成别的意思，如某个数据表的某一行被修改的时间，某个实体的某个组件被修改的时间。

### 2.2.4 请求体

请求也是可以

2.3 响应格式
--------

响应格式其实和请求格式大同小异。  

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-07-31_14-10-34.jpg)

### 2.3.1 状态行

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-07-31_22-24-20.jpg)

  
 

响应报文的状态行的格式为HTTP版本+状态码+ReasonPhrase，  

其中最重要的就是状态码。  

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-07-31_22-26-26-1.jpg)

  
 

RFC认为应用程序不必完全理解每一个状态码，但是必须能够区分状态码是什么类型的。

### 2.3.2 响应头

### 2.3.3 响应体

3 字段重新整理
========

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/HTTP头部字段.png)

X 常见问题
------

X.1 GET和POST有什么区别