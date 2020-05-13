---
title: JavaEE——Servlet总结
categories:
  - JavaEE
tags:
  - java
  - servlet
copyright: true
url: 688.html
id: 688
abbrlink: d1de75a8
date: 2018-05-01 15:54:58
---

谈到JavaEE，虽然如今绝大部分场合使用的都是SSH、SSM等框架，但这些都是基于Servlet技术所做的进一步发展，也就是说底层实现还是servlet，只是做了针对业务需求做了进一步的封装，使得开发人员能够更加有针对性的、更加高效的编写代码。这里稍微总结一下servlet技术的几个重要概念。 从没有在实际项目过程中使用过servlet，因此这里就从一个开发者的角度来考虑几个问题。

<!-- more -->

概念
==

Servlet是Java中一系列对象的统称，也可以说是一个标准，也可以说是java中的一个借口（interface）。

标准
--

和JDBC一样，Servlet规定了Java Web Server程序所需要的输入数据、输出数据的规范，遵守该规范的程序能够在常用的Servlet容器如Tomcat中运行。类比于JDBC规范，Servlet就是JDBC，在JDBC中，编写Java程序进行数据库的增删改查操作的函数接口都由JDBC规范约定好了，同一个Java程序可以应用于不同的数据库DBMC，只需要切换驱动即可；在Servlet中，Servlet容器也可以随意更换，编写的Servlet类是可以处处运行的。而Tomcat等容器对应于各种DBMS如MySQL、Oracle及其驱动。

对象
--

开发人员编写Servlet程序是以自定义类并覆盖抽象类，或实现接口，这两种形式进行的。在运行时，类在容器中被实例化为对象，容器负责管理对象的生死存亡，负责向servlet对象中传入参数或接收返回值。 以HttpServlet为例，servlet对象被实例化后存活于容器中，每当有HTTP请求进入容器，容器会将该请求报文封装为一个HTTP请求对象（该请求对象也要符合Servlet标准），传入对应的Servlet中，Servlet根据请求内容采取操作，最后返回一个HTTP响应对象，该响应对象经容器序列化为响应报文，返回给客户端。

接口
--

既然是标准，那肯定要有interface。 ![](https://oss.kherrisan.cn/v2-85bf84640fbc6b6e195b9c5b513b918f_hd.jpg)

生命周期
====

![](https://oss.kherrisan.cn/Snipaste_2018-04-30_20-27-04.jpg) Servlet的生命周期比较简单，过程中经历的函数也不是很多。

1.  1.  1.  Servlet会被惰性初始化（或者在容器启动时初始化，取决于配置），即在容器在处理某个请求的时候检查其需要的Servlet是否存在，如果不存在，载入该Servlet类，实例化，运行init方法，读入一些初始化参数。
        2.  在某个请求到来的时候，会运行servlet的service方法，并传入相关参数。这些参数由容器打包。servlet处理结束之后，其第二个参数——response会被容器提取，并返回给客户端。每个请求都会运行service方法。
        3.  由容器决定何时销毁servlet（就像JVM垃圾回收一样），销毁时执行destroy方法，释放资源。一般是容器关闭的时候销毁。</ol start="1.">

多线程
===

Servlet并不是单例，即允许实例化多个对象，尽管其在大多数情况下只有一个对象。一个servlet声明对应一个对象，声明多次就有多个。

> For a servlet not hosted in a distributed environment (the default), the servlet container must use only one instance per servlet declaration. 如果 servlet 不是在分布式环境下（默认），servlet 容器必须使一个 servlet 实例对应一个 servlet 声明。 However, for a servlet implementing the SingleThreadModel(Deprecated) interface, the servlet container may instantiate multiple instances to handle a heavy request load and serialize requests to a particular instance. 然而，实现了 SingleThreadModel 接口的 Servlet，可以有多个实例。以处理繁重的请求，并且序列化 request 到特定的 servlet 实例。

在面对并发的情况时，servlet对象会运行在多线程环境中。即一个servlet对象会被多个线程共享，每个线程可能对应于一个HTTP连接（线程的复用机制取决于容器）。在service方法内部的局部变量不会受线程切换而影响，但是如果servlet类中定义了实例变量，那么就有可能造成线程的冲突。 因此要避免在servlet中定义实例变量，或者手动同步，不过手动同步可能会影响处理性能。

过滤器（Filter）
===========

和servlet对象一样，过滤器概念也是来自于servlet标准，即如果我按照标准编写并配置了一个过滤器，那么容器就必须将该过滤器实例化并装载在合适的位置，对于HTTP请求进行过滤。

生命周期
----

和servlet类似，有init和destroy阶段，只初始化一次。初始化时机在servlet初始化之前，销毁于servlet之后。对应于servlet的service方法，filter有一个doFilter方法，表示在过滤HTTP请求时采取该行为。

配置
--

直接上代码吧，理解起来没什么难度。这是一个处理字符编码的过滤器。

<filter>  
    <filter-name>setCharacterEncoding</filter-name>  
    <filter-class>com.company.strutstudy.web.servletstudy.filter.EncodingFilter</filter-class>  
    <init-param>  
        <param-name>encoding</param-name>  
        <param-value>utf-8</param-value>  
    </init-param>  
</filter>  
<filter-mapping>  
    <filter-name>setCharacterEncoding</filter-name>  
    <url-pattern>/*</url-pattern>  
</filter-mapping>

  如果声明了多个servlet对象，HTTP请求入站过程经过过滤器的顺序为从上到下。

模式
--

一个HTTP可能会经过多个filter，filter的组装顺序和过滤控制是可以调整的。容器会自动把声明的过滤器组装在一个filterChain对象里面，在某个过滤器的doFilter方法中，如果想要让该请求进入下一个过滤器，就需要调用`chain.doFilter`方法。最后一个过滤器调用该方法把请求直接传给servlet对象。

监听器（Listener）
=============

监听器，顾名思义，就是监听某个事件发生并采取相应行动的组件。 监听器能够监视三类对象，ServletContext、HttpSession、ServletRequest，监听这三类对象的监听器的抽象类类名和接口名也不同：

1.  1.  1.  1.  监听应用上下文：ServletContextListener
            2.  监听用户会话：HttpSessionListener
            3.  监听请求：ServletRequestListener</ol start="1.">

![](https://oss.kherrisan.cn/Snipaste_2018-05-01_15-28-55.jpg) 每种监听器都有数个类似的方法，如监听对象的创建、销毁事件，增加、修改、删除某个属性的事件。有的监听器会有一些独特的方法。这里不详细解释每个监听器的原型。

配置
--

<listener>
    <listener-class>cn.itcast.web.listener.MyServletContextListener</listener-class>
</listener>

  如果在web.xml中声明了多个监听器，那么这些监听器会按照声明的顺序注册到相应对象中。

上下文（Context）
============

容器启动后，会为每个web应用创建一个context，只要不关闭容器或者卸载该web应用，context就不会被销毁。servlet之间通过context来通信，servlet也可以通过context来获取全局的资源文件等。

配置
--

 

<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                      http://xmlns.jcp.org/xml/ns/javaee/web-app\_4\_0.xsd"
    version="4.0" metadata-complete="true">
<!--配置和映射Servlet-->
<!--配置Servlet-->
<servlet>
       <servlet-name>FristServlet</servlet-name>
       <servlet-class>com.hello.com.FristServlet</servlet-class>
</servlet>
<!--映射Servlet -- >
<servlet-mapping>  
       <servlet-name>FristServlet</servlet-name>  
       <url-pattern>/test</url-pattern>  
   </servlet-mapping>  
</web-app>

  servlet和filter都是通过mapping-url来标识是否要选择此servlet或filter的，而监听器则是对于每个对象都会无条件绑定。

Web.xml
=======

web.xml是Jave Web应用程序所使用的配置文件，虽然它并不是必须的。web.xml中可以定义上文所提及的servlet、listener、filter对象，每种对象可以定义一个或多个，并通过xml语法指定他们的属性。

定义和加载顺序
-------

在web.xml中，servlet、listener、filter的定义顺序是随意的，但是Tomcat只会按照规定的顺序加载他们： Listener->Filter->Servlet 可以这么理解：Listener中有一个ContextListener用于监听ContextInitialize时间，由于该项目一启动就会有一个ApplicationContext，因此为了监听到这个事件就必须要在最前面初始化。Servlet是惰性初始化的，所以排在最后。

运作流程
----

![](https://oss.kherrisan.cn/invfilt.gif) 当一个web请求到来时，首先在在该请求上注册监听器（只有针对于请求的监听器才会再此时注册，针对其他对象的监听器在其他时刻注册，因为说不定其他对象还没有实例化呢），然后经过多个过滤器，最终到达servlet。  

实验
--

<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://java.sun.com/xml/ns/javaee"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app\_2\_5.xsd"
         version="2.5">

    <filter>
        <filter-name>MyFilter</filter-name>
        <filter-class>com.testwebxml.MyFilter</filter-class>
        <init-param>
            <param-name>name</param-name>
            <param-value>FirstFilter</param-value>
        </init-param>
    </filter>

    <filter-mapping>
        <filter-name>MyFilter</filter-name>
        <url-pattern>/</url-pattern>
    </filter-mapping>

    <filter>
        <filter-name>MySecondFilter</filter-name>
        <filter-class>com.testwebxml.MyFilter</filter-class>
        <init-param>
            <param-name>name</param-name>
            <param-value>SecondFilter</param-value>
        </init-param>
    </filter>

    <listener>
        <listener-class>com.testwebxml.MyServletContextAttritubeListener</listener-class>
    </listener>

    <listener>
        <listener-class>com.testwebxml.MyServletContextListener</listener-class>
    </listener>

    <listener>
        <listener-class>com.testwebxml.MyServletRequestListener</listener-class>
    </listener>
    
    <listener>
        <listener-class>com.testwebxml.MyHttpSessionActivationListener</listener-class>
    </listener>
    
    <listener>
        <listener-class>com.testwebxml.MyHttpSessionListener</listener-class>
    </listener>
    
    <servlet>
        <servlet-name>MyServlet</servlet-name>
        <servlet-class>com.testwebxml.MyServlet</servlet-class>
    </servlet>
    <servlet>
        <servlet-name>MyHttpServlet</servlet-name>
        <servlet-class>com.testwebxml.MyHttpServlet</servlet-class>
    </servlet>
    
    <servlet-mapping>
        <servlet-name>MyServlet</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
    <servlet-mapping>
        <servlet-name>MyHttpServlet</servlet-name>
        <url-pattern>/http/*</url-pattern>
    </servlet-mapping>

</web-app>

项目启动时

\[2018-08-06 10:32:26,102\] Artifact test: Artifact is being deployed, please wait...
Connected to server
\[com.testwebxml.MyServletContextAttritubeListener\]\[<init>\]
\[com.testwebxml.MyServletContextListener\]\[<init>\]
\[com.testwebxml.MyServletRequestListener\]\[<init>\]
\[com.testwebxml.MyHttpSessionActivationListener\]\[<init>\]
\[com.testwebxml.MyHttpSessionListener\]\[<init>\]
\[com.testwebxml.MyServletContextListener\]\[contextInitialized\]ApplicationContextFacade
\[com.testwebxml.MyFilter\]\[init\]FirstFilter
\[com.testwebxml.MyFilter\]\[init\]SecondFilter
\[2018-08-06 10:32:26,493\] Artifact test: Artifact is deployed successfully
\[2018-08-06 10:32:26,493\] Artifact test: Deploy took 391 milliseconds

接收第一个/请求时

\[com.testwebxml.MyServletRequestListener\]\[requestInitialized\]ApplicationContextFacade
\[com.testwebxml.MyServletRequestListener\]\[requestInitialized\]RequestFacade
\[com.testwebxml.MyServlet\]\[init\]
\[com.testwebxml.MyFilter\]\[doFilter\]FirstFilter ServletRequest:127.0.0.1
\[com.testwebxml.MyFilter\]\[doFilter\]SecondFilter ServletRequest:127.0.0.1
\[com.testwebxml.MyServlet\]\[service\]
\[com.testwebxml.MyServletRequestListener\]\[requestDestroyed\]ApplicationContextFacade
\[com.testwebxml.MyServletRequestListener\]\[requestDestroyed\]RequestFacade

接收第二个/请求时

\[com.testwebxml.MyServletRequestListener\]\[requestInitialized\]ApplicationContextFacade
\[com.testwebxml.MyServletRequestListener\]\[requestInitialized\]RequestFacade
\[com.testwebxml.MyFilter\]\[doFilter\]FirstFilter ServletRequest:127.0.0.1
\[com.testwebxml.MyFilter\]\[doFilter\]SecondFilter ServletRequest:127.0.0.1
\[com.testwebxml.MyServlet\]\[service\]
\[com.testwebxml.MyServletRequestListener\]\[requestDestroyed\]ApplicationContextFacade
\[com.testwebxml.MyServletRequestListener\]\[requestDestroyed\]RequestFacade

接收第一个/http请求时

\[com.testwebxml.MyServletRequestListener\]\[requestInitialized\]ApplicationContextFacade
\[com.testwebxml.MyServletRequestListener\]\[requestInitialized\]RequestFacade
\[com.testwebxml.MyHttpServlet\]\[init\]init()
\[com.testwebxml.MyFilter\]\[doFilter\]FirstFilter ServletRequest:127.0.0.1
\[com.testwebxml.MyFilter\]\[doFilter\]SecondFilter ServletRequest:127.0.0.1
\[com.testwebxml.MyHttpServlet\]\[doGet\]
\[com.testwebxml.MyHttpSessionListener\]\[sessionCreated\]
\[com.testwebxml.MyHttpServlet\]\[doGet\]HttpServletRequest.getSession()
\[com.testwebxml.MyServletRequestListener\]\[requestDestroyed\]ApplicationContextFacade
\[com.testwebxml.MyServletRequestListener\]\[requestDestroyed\]RequestFacade

接收第二个/http请求时

\[com.testwebxml.MyServletRequestListener\]\[requestInitialized\]ApplicationContextFacade
\[com.testwebxml.MyServletRequestListener\]\[requestInitialized\]RequestFacade
\[com.testwebxml.MyFilter\]\[doFilter\]FirstFilter ServletRequest:127.0.0.1
\[com.testwebxml.MyFilter\]\[doFilter\]SecondFilter ServletRequest:127.0.0.1
\[com.testwebxml.MyHttpServlet\]\[doGet\]
\[com.testwebxml.MyHttpServlet\]\[doGet\]HttpServletRequest.getSession()
\[com.testwebxml.MyServletRequestListener\]\[requestDestroyed\]ApplicationContextFacade
\[com.testwebxml.MyServletRequestListener\]\[requestDestroyed\]RequestFacade

项目停止时

信息: Stopping service Catalina
\[com.testwebxml.MyServlet\]\[destroy\]
\[com.testwebxml.MyFilter\]\[destroy\]FirstFilter
\[com.testwebxml.MyFilter\]\[destroy\]SecondFilter
\[com.testwebxml.MyServletContextListener\]\[contextDestroyed\]ApplicationContextFacade
八月 06, 2018 10:35:42 上午 org.apache.coyote.http11.Http11AprProtocol destroy
信息: Stopping Coyote HTTP/1.1 on http-21211
八月 06, 2018 10:35:42 上午 org.apache.coyote.ajp.AjpAprProtocol destroy
信息: Stopping Coyote AJP/1.3 on ajp-8009
Disconnected from server