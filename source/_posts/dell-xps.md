---
title: Dell XPS 9360上安装Ubuntu 18.04失败的情况
categories:
  - 未分类
copyright: true
url: 836.html
id: 836
abbrlink: befdb876
date: 2018-07-05 11:59:58
tags:
---

最近在我的xps 9360上安装Ubuntu18.04的时候出现这样一个问题：在硬盘分区完成之后，本来应该进入安装进度条，结果安装窗口突然变成了黑色，然后窗口自动消失，过了一分钟之后Ubuntu系统提示有一个crash。 后来经过搜索，找到了解决方案： [https://bugs.launchpad.net/ubuntu/+source/ubiquity/+bug/1751252](https://bugs.launchpad.net/ubuntu/+source/ubiquity/+bug/1751252)