---
title: JLink——借助JLink打包Java程序为可执行程序
categories:
  - JavaSE
tags:
  - java
copyright: true
url: 1077.html
id: 1077
abbrlink: 72407af
date: 2019-01-06 19:38:54
---

JDK9中的模块化技术使得原本一两百兆的JRE能够被拆分成多个较小的模块，因此如果想要把Java程序打包成可执行程序，并在没有JRE环境的机器上运行，不再需要带上一个庞大的JRE，而只需要额外增加几个JDK中的module。 项目目录结构如下，仅仅是一个很简单的Hello World程序。代码中仅仅使用到了System.out.println这一个JDK中提供的函数。 ![](https://oss.kherrisan.cn/b6fc620903896d3ef034f5bed269fcaa.png) 最重要的是module-info.jar文件，这个文件是module的定义文件，声明了我所编写的这个模块需要依赖哪些模块，以及对外暴露哪些东西。 由于只依赖java.base模块，而这个模块是默认包含的，因此module-info的大括号内可以为空。

<!-- more -->

```java
module dkm {
}

```

build.gradle文件也十分简单。

```groovy
plugins {
    id 'java'
}

apply plugin: 'application'
mainClassName = 'com.dokyme.Main'

group 'test-jlink-exe'
version '1.0-SNAPSHOT'

sourceCompatibility = 1.9

```

先运行`./gradlew build`，将该项目打成JAR包。接着再用JLink工具将多个模块链接成一个可执行文件，有没有一种C语言的链接器的既视感？

```
jlink --module-path /Library/Java/JavaVirtualMachines/jdk-10.0.2.jdk/Contents/Home/jmods:build/libs --add-modules dkm --launcher dkm=dkm/com.dokyme.Main --output dist 

```

*   --module-path 类似于CLASSPATH，JLink到哪里去找modules
*   --add-modules 要额外添加的module
*   --launcher dkm=dkm/com.dokyme.Main 启动器，或者说是可执行程序。后面跟着的是程序的名字以及入口主类的位置。
*   --output 输出路径

命令执行结束之后就会多出一个dist目录，里面的bin文件夹下存放着可执行文件，这个dist目录大约30MB左右。 ![](https://oss.kherrisan.cn/321c50d9e9ddc4d5a698214ac400d572.png) 这个入口文件实际上是一个shell脚本，调用同目录下的java程序载入模块中的主类，执行主类的代码。

```
#!/bin/sh
JLINK_VM_OPTIONS=
DIR=`dirname $0`
$DIR/java $JLINK_VM_OPTIONS -m dkm/com.dokyme.Main $@

```

找到一个gradle的plugin，挺有意思： [gradle-dplink-plugin](https://github.com/alkimiapps/gradle-dplink-plugin)