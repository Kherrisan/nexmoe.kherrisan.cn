---
title: Git 面向项目开发的git教程
categories:
  - Git
tags:
  - Git
copyright: true
url: 232.html
id: 232
abbrlink: 4d8d0ed2
date: 2017-09-04 19:28:24
---

Git是一种版本控制工具，Github是提供git服务器支持的一个社区。

### 首先在windows上安装git

https://git-scm.com/ 这个是git的官方网站。下载过程可能比较缓慢，需要耐心等待一下。在下载的过程中可以顺便把Github账户注册了。

<!-- more -->

### 注册Github账户

https://github.com/ 这个是github网站，怎么注册就不多说了，大家都是注册过千万网站账号的人。

### 配置ssh密钥

在git安装包下载完成并安装完成之后，启动git bash。输入命令

```null
ssh-keygen.exe -t rsa -C "注册github的邮箱"

```

后面会先后提示要求输入密码保存的文件，密码等。这里都不要输，直接回车就行了。 登陆github，点击用户头像，进入`settings`，选择`ssh and gpg keys`。新建一个key，title可以随便写，keys要填写的是当前用户目录下（形如`c/Users/zdksc`)的`.ssh`文件夹下的`id_rsa.pub`文件中的内容（全部复制过来）。提交，需要再输入一遍github密码。

### 第一次初始化仓库

选择一个合适的目录，运行命令：

```null
git clone git@github.com:polydick/OrderDishSystem.git

```

git会把该项目下载到当前路径下。 请先创建自己的分支，在自己的分支上提交代码。运行命令：

```null
git checkout -b yourOwnBranch

```

这行代码会建立一个叫yourOwnBranch的分支，并切换到该分支。然后就可以进行自己的开发了。

### 提交更改

如果对该项目的进行了修改之后需要提交，在`OrderDishSystem`文件夹下运行命令（#后面的是注释，不要输入）：

```null
git checkout yourOwnBranch # 切换到自己的分支
git add . # 将当前目录加入暂存区（包括所有新增的文件）
git commit -m "这次提交需要说些什么（比如修复了什么bug）" # 将变更提交到本地仓库，并加上注释。
git checkout master # 切换到主分支
git pull origin master # 将origin远程仓库中的master分支下载到本地，并与本地的master分支合并，这样你本地的master分支就是最新的了。
git checkout yourOwnBranch
git merge master # 把本地yourOwnBranch分支与本地master分支合并，这样本地的youOwnBranch分支就包含最新的master分支进度和自己写的代码的进度了。
git push origin yourOwnBranch # 提交到origin远程仓库的yourOwnBranch分支

```

### 及时更新自己的或者别人的代码

如果别人修改了代码，想要及时更新到自己的本地，运行命令：

```null
git checkout master
git pull origin master # 这样本地的master分支就是最新的了。

```

如果想要在别人写的最新的代码版本上添加自己的代码，运行命令：

```null
git checkout yourOriginMaster
git pull origin master

```

然后就可以愉快地在自己的分支上码代码了，码完了提交一下。

### 注意

1.  不要让自己的分支和除了master分支之外的其他分支合并，那样会变得很乱，非常乱。
2.  在commit之前请先确保在自己的分支上，不要直接commit到主分支。