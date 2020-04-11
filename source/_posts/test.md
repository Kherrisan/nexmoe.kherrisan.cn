---
title: 这是一个测试页
copyright: true
date: 2019-01-24 13:46:26
tags:
    - 测试
    - Markdown
    - 前端
    - 优化
categories: 测试
---

## Markdown语法渲染

这部分主要是为了测试Hexo渲染Markdown的编译器对常用记号的支持程度。

各级标题

# 一级标题

## 二级标题

### 三级标题

<!-- more -->

#### 四级标题

##### 五级标题

###### 六级标题

引用

> 白求恩同志是加拿大共产党员，五十多岁了，为了帮助中国的抗日战争，受加拿大共产党和美国共产党的派遣，不远万里，来到中国。去年春上到延安，后来到五台山工作，不幸以身殉职。一个外国人，毫无利己的动机，把中国人民的解放事业当做他自己的事业，这是什么精神？这是国际主义的精神，这是共产主义的精神，每一个中国共产党员都要学习这种精神。列宁主义认为：资本主义国家的无产阶级要拥护殖民地人民的解放斗争，殖民地半殖民地的无产阶级要拥护资本主义国家的无产阶级的解放斗争，世界革命才能胜利。白求恩同志是实践了这一条列宁主义路线的。我们中国共产党员也要实践这一条路线。我们要和一切资本主义国家的无产阶级联合起来，要和日本的、英国的、美国的、德国的、意大利的以及一切资本主义国家的无产阶级联合起来，才能打倒帝国主义，解放我们的民族和人民，解放世界的民族和人民。这就是我们的国际主义，这就是我们用以反对狭隘民族主义和狭隘爱国主义的国际主义。

列表

- jekyll
- hexo
- hugo
- wordpress

1. c++
1.1. VisualStudio
2. Java
2.1. IDEA
3. Python
3.1.    Pycharm

    Pycharm的第二段落

    > Pycharm的第三段落

4. PHP

代码区块（缩进）

    public class Server{
        public static void main(String[] args){
            System.out.println("Hello World");
        }
    }

代码区块（`)

```java
public class Server{
    public static void main(String[] args){
        System.out.println("Hello World");
    }
}
```

分割线

***

链接

This is [an example](http://example.com/ "Title") inline link.

This is [an example][id] reference-style link.

[id]: http://example.com/  "Optional Title Here"

强调

宫中府中，俱为一体，陟罚臧否，不宜异同。**若有作奸犯科及为忠善者**，宜付有司论其刑赏，以昭陛下平明之理，*不宜偏私，使内外异法也*。

## 前端加载

![中等图片](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/2019-01-23-121710.jpg)

![大型图片](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/2019-01-23-123408.jpg)

## Travis CI

测试一下持续集成。