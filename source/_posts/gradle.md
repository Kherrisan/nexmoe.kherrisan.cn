---
title: Gradle——从groovy语法角度理解Project
categories:
  - Gradle
tags:
  - Gradle
copyright: true
url: 649.html
id: 649
abbrlink: 35e8bc6d
date: 2018-04-18 22:31:37
---

这是一个Spring Boot项目的build.gradle文件。

<!-- more -->

```null
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


```

首先，要明确一点：在这个文件中所见到的如apply、repositories、dependencies这样的看似是gradle关键字的东西，其实并不是关键字，而是函数，具体的说是Project对象自带的成员函数（Java中叫对象的方法）。这个Project对象，就是build.gradle所在的目录。每个gradle项目都有至少一个Project，那么gradle项目的根目录在什么位置呢？在settings.gradle所在的目录。 也就是说，这个build.gradle定义了一个Project对象，这个Project对象本身自带了一些函数，在build.gradle里调用了这些函数，并且是带着一些参数调用这些函数。 如

```null
apply plugin: 'java'

```

这句话如果用groovy语言补全了，就是

```null
apply([plugin:'java'])

```

groovy用\[\]来定义map对象，也就是说这个apply的参数是个map。 再比如

```null
dependencies {
    compile('org.springframework.boot:spring-boot-starter-web')
    testCompile('org.springframework.boot:spring-boot-starter-test')
}

```

可以还原为

```null
dependencies ({
    compile('org.springframework.boot:spring-boot-starter-web')
    testCompile('org.springframework.boot:spring-boot-starter-test')
})

```

这个{}不是map，不要和python搞混了。groovy中用{}来定义闭包。闭包换种说法叫匿名代码块，即没有名字的函数。和C++中的代码块类似，区别在于闭包和lambda表达式比较接近，可以定义闭包的参数。

```null
{int a,int b->println 'a + b = ${a+b}'}

```

这就是一个简单的求a+b并打印出来的闭包。 回到dependencies，这个闭包作为一个参数传入dependencies，即gradle调用dependencies函数的时候，会把这个闭包对象传递到dependencies函数里面去，至于什么时候执行，有dependencies内部决定。 根据我的理解，把这个build.gradle翻译成python脚本文件，应该是这样。 （可能有语法错误，意思到了就行）

```null
project=Project()

def buildscript_closure():
    def ext_closure():
        springBootVersion='2.0.1.RELEASE'

    def repositories_closure():
        mavenCentral()

    def dependencies_closure():
        classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    ......
    ext_closure()
    ......
    repositories_closure()
    ......
    dependencies_closure()

project.buildscript(buildscript_closure)
project.apply([plugin:'java'])
project.apply([plugin:'eclipse'])
project.apply([plugin:'org.springframework.boot'])
project.apply([plugin:'io.spring.dependency-management'])

project.group='com.example'
project.version='0.0.1-SNAPSHOT'
project.sourceCompatibility = 1.8

def repositories_closure():
    mavenCentral()

project.repositories(repositories_closure)

def dependencies_closure():
    compile('org.springframework.boot:spring-boot-starter-web')
    testCompile('org.springframework.boot:spring-boot-starter-test')

project.dependices(dependencies_closure)

```

所以build.gradle中的groovy看似很像DSL（Domain Specified Language），实际上也就是语法糖多了一点而已。