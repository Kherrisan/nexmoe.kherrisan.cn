---
title: Gradle——从各个“关键字”理解gradle
categories:
  - Gradle
tags:
  - Gradle
copyright: true
url: 653.html
id: 653
abbrlink: c39d8650
date: 2018-04-18 22:34:09
---

buildscript {
    ext {
        springBootVersion = '2.0.1.RELEASE'
    }
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    }
}

<!-- more -->

apply plugin: 'java'
apply plugin: 'eclipse'
apply plugin: 'org.springframework.boot'
apply plugin: 'io.spring.dependency-management'

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = 1.8

repositories {
    mavenCentral()
}


dependencies {
    compile('org.springframework.boot:spring-boot-starter-web')
    testCompile('org.springframework.boot:spring-boot-starter-test')
}

  以一个Spring Boot项目的build.gradle为例。

buildscript
-----------

指明了作用于该脚本文件的一些代码。这些代码和buildscript外的代码有所区别，外面的代码是作用于project的，buildscript内的代码是作用于该脚本文件的。 如

```null

repositories {
    mavenCentral()
}

```

这句话如果放在外面，就是声明project所需要依赖文件所在的仓库，放在buildscript里面，就是这个脚本文件所依赖的内容的仓库。 举个例子，比如我们要在运行这个build.gradle的过程中调用matplotlib画一张图（这是什么鬼需求），就需要在buildscript里注明所需要的仓库和所需要的依赖（虽然这个依赖实际上并不存在）。matplotlib仅仅是被导入到了build.gradle中，并没有被导入到项目中去，也就是说项目的依赖还是纯净无污染的。

apply plugin
------------

插件实际上就是一组task，只是将task做了一次包装，使得分发这些task的代码给他人使用时能够更加方便。 以插件Java为例 典型的Java项目的目录结构如下： ![](https://oss.kherrisan.cn/Snipaste_2018-05-01_16-32-41.jpg)

group
-----

包名

version
-------

版本号

sourceCompatibility
-------------------

兼容到哪个Java版本的一个标记

repositories
------------

仓库，这是一个挺重要的关键字。如果开发者需要引入别人开发的库，就需要从仓库下载，得益于gradle高度自动化的依赖管理，开发者不需要自己在浏览器下载然后倒入jar包，而是只要在gradle脚本中声明一个依赖库即可。gradle自动从仓库搜索这个依赖库、下载并导入到该项目中。 常用的仓库有以下几个： ![](https://oss.kherrisan.cn/Snipaste_2018-05-01_16-38-14.jpg) 要使用某个仓库的话：

repositories {
    mavenCentral()
}

如果想要直接导入本地的jar包，就需要声明本地仓库。

repositories {
    flatDir {
        dirs 'lib'
    }
    flatDir {
        dirs 'lib1', 'lib2'
    }
}

 

dependencies
------------

依赖，这也是一个很重要的关键字。开发者引入的第三方库并不一定是在编译时需要导入的，也有可能是运行时，或者测试时，因此gradle提供了一些属性，供开发者确定这个依赖何时引入。

1.  **compile：编译时**
2.  **runtime：运行时**
3.  **testCompile：测试代码（src\\test目录下）编译时**
4.  **testRuntime：测试代码运行时**
5.  **archives：项目打包时**

需要什么库，直接写在dependencies标签下就行

dependencies {
    compile "com.android.support:appcompat-v7:${SUPPORT\_LIBRARY\_VERSION}"
    compile "com.android.support:cardview-v7:${SUPPORT\_LIBRARY\_VERSION}"
    compile "com.android.support:recyclerview-v7:${SUPPORT\_LIBRARY\_VERSION}"
    compile "com.android.support:design:${SUPPORT\_LIBRARY\_VERSION}"
}