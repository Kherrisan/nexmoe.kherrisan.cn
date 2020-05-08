---
title: Typescript 简述，安装，开发环境配置
categories:
  - Typescript
tags:
  - Typescript
  - 前端
copyright: true
url: 155.html
id: 155
abbrlink: f576dfeb
date: 2017-07-11 14:20:15
---

简述
==

Typescript是一个由微软开发的编程语言，听说有C#的首席架构师助阵Typescript的开发。是Javascript的超集，提供了可选的静态类型和基于类的面向对象编程，感觉就像C#和JavaScript之间的一种语言。 废话少说，先把环境搞起来，环境搭好了就可以码代码了。 以下所有的代码都来自于 [Typescriptlang](http://www.typescriptlang.org "Typescript") 这个网站，感觉比较良心，大家可以参考一下。

<!-- more -->

安装
--

1.  用vs插件
2.  用nodejs的npm

我选择用npm

```null
npm install -g typescript

```

编辑器的话，这次就不靠jetbrain家族了，尝试一下vscode吧，好像vscode对typescript的支持也是相当充足的。说来也有趣，vscode里typescript的插件几乎有一般都是用来自动import的。。。。。。

Hello World
-----------

我觉得还是先码一点代码，看看效果，再决定是否要找插件比较好。

```null
function greeter(person) {
    return "Hello, " + person;
}
var user = "Jane User";
document.body.innerHTML = greeter(user);

```

嗯这就是一段HelloWorld，不是从标准输出而是在网页上输出的。另存为`greeter.ts`。

```null
tsc greeter.ts

```

这一步将ts代码编译为js代码了，因为helloworld实在太简单，所以ts和js应该是没有区别的，除了他会帮你自动格式化一下。这还不算ts，毕竟还没有引入静态类型呢。

加上一点点类型信息
---------

```null
function greeter(person: string) {
    return "Hello, " + person;
}
var user = [0, 1, 2];
document.body.innerHTML = greeter(user);

```

还没运行呢，编辑器就报错了，类型不对。Number\[\]无法适用于string。不写参数也算错。虽然tsc依然会生成js代码，但似乎不保证js代码运行的正确。

其他插件
----

```null
npm install -g typings
typings install dt~node –global

```

typings是一个自动补全的工具，除了对语法块（snippet）补全之外，还可以对其他模块，其他包的内容进行分析，并提供自动补全的候选。

创建一个完整的项目
---------

```null
mkdir ts_demo
cd ts_demo

```

然后创建一个tsconfig.json文件，一般这个文件都是用来写ts项目的配置文件的。

```null
{
    "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "sourceMap": true
    }
}

```

然后写一个java风格的HelloWorld。

```null
class Startup {
    public static main(): number {
        console.log('Hello World');
        return 0;
    }
}

Startup.main();

```

再然后，调处vscode的命令`Configure Task Runner`，选择`TypeScript - tsconfig.json`，他会在.vscode目录下新建一个task.json文件，文件内容如下：

```null
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "0.1.0",
    "command": "tsc",
    "isShellCommand": true,
    "args": ["-p", "."],
    "showOutput": "silent",
    "problemMatcher": "$tsc"
}

```

这个文件描述的应该是把ts文件转换为js文件的操作。只要新建就可以了，不需要修改什么。保存一下以后，Ctrl+Shift+B会转换当前文件夹下的所有ts文件为js文件，然后用node运行相应的js文件即可。