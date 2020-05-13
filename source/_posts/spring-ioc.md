---
title: Spring——IOC流程概述
categories:
  - JavaEE
  - Spring Framework
tags:
  - SSM
copyright: true
url: 867.html
id: 867
abbrlink: e6be9c71
date: 2018-08-07 22:29:11
---

tiny-spring
===========

这是一个简化版的spring框架，模仿spring的思路实现了IOC和AOP的功能，是github上的一位开发者编写的。 [https://github.com/Dokyme/tiny-spring](https://github.com/Dokyme/tiny-spring) 其实spring IOC的步骤并不复杂，和把大象装进冰箱的过程（三步）是基本一致的，也可以说成是两步，根据我的理解：

1.  读取bean的xml配置文件，并解析每个bean的定义，及其属性。
2.  延迟bean的实例化，并根据依赖关系进行组装。

<!-- more -->

所用到的类文件如下： ![](https://oss.kherrisan.cn/Snipaste_2018-08-07_20-20-34.png)

Resource和ResourceLoader
-----------------------

Resouce代表一种资源，在SpringWeb项目中最常见的就是XML文件，spring内部通过Resource接口定义了资源实体所需要提供的数据。在tiny中，Resource接口只有一个函数，那就是得到一个InputStream。 Resouce不是凭空产生的，不是由用户new出来的，而是通过ResourceLoader制造出来的。ResouceLoader接口定义了制造Resouce的方法。在tiny中，ResourceLoader接口也只有一个函数，是根据一个字符串地址制造出一个Resouce实例。 Resouce和ResourceLoader接口都需要具体的实现类去实现各自的逻辑，tiny中只实现了Url资源的Resouce和ResourceLoader，即根据字符串地址得到Url，再建立Url连接，得到InputStream。

BeanDefinition和BeanDefinitionReader
-----------------------------------

在spring中，万物皆为bean，bean指的是一个提供了默认构造函数、setter和getter方法的类，这个类可以是数据实体类，也可以是封装了一些逻辑操作的类。spring体系中使用xml文件来定义bean，一个bean节点通常包含名称（id），具体实现类，属性列表等。 BeanDefinition封装了xml中的bean节点，因此spring读取并解析xml文件后得到的就是一个BeanDefinition的列表。 读取xml并解析的过程则交给了BeanDefinitionReader接口，在tiny中BeanDefinitionReader接口提供了一个函数（loadBeanDefinition），其直接实现类AbstractBeanDefinition没有实现这个方法，但是给出了用于缓存bean的数据载体——一个Map<String,BeanDefinition>，还有一个ResouceLoader，即该抽象类约定了其子类必须将多个bean保存在这个map中，但如何读取并解析，根据怎样的顺序，是实时还是延迟，该抽象类并没有做出规定。 tiny中XmlBeanDefinitionReader集成了AbstractBeanDefinition类，并实现了BeanDefinitionReader接口所留下的load方法。该类借用了AbstractBeanDefinition所维护的ResouceLoader获得Resource的InputStream，进而读取该InputStream，默认使用XML解析器来解析这个文件。解析完成之后遍历得到的所有XML节点，针对每个节点，Reader取出他们的id，类名，并遍历该节点内部的Property列表，针对每个Property，取出name和value，或者ref。最后将该节点的所有信息填入BeanDefinition对象中。

BeanFactory
-----------

如果说BeanDefinitionReader是做静态处理的话，BeanFactory所完成了bean组装就是动态的。BeanFactory负责对bean进行组装，包括组装的时机、方式、顺序的控制。在tiny中，BeanFactory是一个接口，这个接口只提供了一个方法getBean，根据名字返回一个bean实例。该接口的直接实现类AbstractBeanFactory没有完全实现getBean方法，而是给出了返回bean的逻辑：首先从map中找到对应bean的BeanDefinition，由于BeanDefinition是在最开始就初始化好的，所以如果找不到BeanDefinition，那肯定是异常情况。BeanDefinition对象除了维护bean的信息之外，还会维护该bean的实例，如果这个实例没有被初始化，name就根据该BeanDefinition创建一个bean实例并初始化；如果已经被初始化过了，那就直接返回。听起来有点像单例模式，实际上tiny中的bean都是singleton的，因此全程只维护一个实例。 BeanFactory根据BeanDefinition创建实例的过程很简单，只要从BeanDefinition中拿到类名，直接实例化即可。组装bean的过程稍微复杂一些，BeanDefinition会维护该bean的Property列表，如果该Property是基本类型的字面量，那就直接进行属性的赋值，如果是一个引用对象，并且该引用对象是另外一个bean的话，就通过getBean方法先得到那个bean，然后再赋值，当然得到该bean的过程可能也包含着创建和初始化的步骤。 需要注意的是，对于bean属性的赋值都是通过反射获取对应的setter方法进行处理的，而不是直接赋值或者通过反射修改属性的可见性后赋值。 在tiny中没有对循环依赖的情况进行判断和处理。

ApplicationContext
------------------

ApplicationContext接口继承了BeanFactory接口，因为其本质上也是负责进行bean组装的容器。在tiny中AbstractApplicationContext类实现了该接口，并持有一个BeanFactory对象，将getBean方法委托给BeanFactory，而自己负责将bean配置文件的加载、解析、注册过程结合起来，变为一个refresh函数。 ClassPathXmlApplicationContext类继承了AbstractApplicationContext，直接在构造函数里调用refresh函数，即在构造的时候进行一系列初始化操作，同时其规定了加载bean配置文件是通过xmlBeanDefinitionReader进行处理，并且逐个注册解析到的BeanDefinition。

BeanPostProcessor
-----------------

这个接口提供了两个方法来拓展bean初始化前后的操作，AbstractApplicationContext会将所有BeanPostProcessor类型的bean注册到beanFactory中去，当beanFactory初始化某个bean时，会调用该Processor的两个回调函数。 ![](https://oss.kherrisan.cn/tinyspring.jpg)

Spring
======

以ClassPathXmlAppliationContext的初始化为例。

public class ClassPathXml {
    public static void main(String\[\] args) {
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:config.xml");
        SimpleBean bean = applicationContext.getBean(SimpleBean.class);
        bean.hello();
    }
}

public class SimpleBean {
    public void hello() {
        System.out.println("SimpleBean Hello");
    }
}

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="simpleBean" class="com.testspringframework.bean.SimpleBean"/>
</beans>