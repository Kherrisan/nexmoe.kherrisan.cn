---
title: Git 算是比较系统的学习笔记
categories:
  - Git
tags:
  - Git
copyright: true
url: 235.html
id: 235
abbrlink: 5151ce74
date: 2017-09-07 19:50:05
---

Git 基础
======

git是一个分布式的版本管理工具。所谓的分布式就是每个人的电脑上都可以安装完整的git管理系统，进行本地的版本管理，而不需要中央服务器的集中管理。 git不同于其他版本管理系统，它保存的是一个项目中所有文件的集合的快照，如果文件没有被修改那就用一个指针指向之前那个版本。 ![](https://git-scm.com/book/en/v2/images/snapshots.png)

<!-- more -->

### 重点：三种状态

![](https://git-scm.com/book/en/v2/images/areas.png)

*   工作区：就是直接在资源管理器中显示的区域。
*   暂存区：保存了下次将要提交的文件的信息的一个文件。
*   Git仓库：保存项目元数据和对象数据库的地方。

基本的工作流程是这样子的：

1.  在工作目录中修改文件。
2.  暂存：将文件快照加入暂存区。
3.  提交：将快照存入Git仓库中。

也就是说，一个文件有四种状态：没有修改，已经修改但没有暂存，已经暂存但没有被提交，已经提交。

安装Git
=====

此部分省略。。。。。。

初次配置
====

Git的配置文件有两个版本：当前用户版本和系统版本（类似于用户环境变量和系统变量这样吧）。用户配置文件在`~/.gitconfig`，系统配置文件在Git安装目录下（linux在`/etc/gitconfig`）

### 用户信息配置

```null
$ git config --global user.name "Polydick"
$ git config --global user.email zdk_cz@sina.com

```

### 默认文本编辑器配置

```null
$ git config --global core.editor  code #这里用visual studio code

```

### 查看配置

```null
$ git config --list #查看所有的配置项
$ git config <key> #查看<key>配置项

```

获取Git仓库
=======

得到一个仓库有两种方法：1.从远程服务器下载。2.将本地的项目导入git中。 如果要将本地的项目文件夹使用git进行管理：

```null
$ git init

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/%E9%80%89%E5%8C%BA_003-300x68.png) 如果这不是一个空项目，那就需要把当前文件夹中的文件加入到git中。`git add`追踪文件，`git commit`提交文件。 `$ git add *.c $ git add LICENSE $ git commit -m 'initial project version'` 如果是想要从远程服务器上获取到话，`git clone`会从远程拷贝文件到本地到当前目录中。

记录更新
====

两种状态：已跟踪和未跟踪。已跟踪意味着该文件到修改将会被git记录，将会被纳入项目快照中，未跟踪的话git是不会搭理这个文件到。 ![](https://git-scm.com/book/en/v2/images/lifecycle.png) 一个文件就会在这四个状态中循环往复。

```null
git status #可以查看当前项目下文件的状态。

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/%E9%80%89%E5%8C%BA_011-300x159.png) README这个文件有一部分变更被暂存了，还有一部分变更没有暂存。如果要暂存新的这一次变更，就要再`git add`一次。

```null
$ git status -s #可以输出更加可读的信息。
    M      README #被修改，未暂存
MM    Rakefile #已暂存，又被修改
A        lib/git.rb #
M       lib/simplegit.rb #被修改，已暂存
??      LICENSE.txt #未追踪

```

在`.gitignore`中可以添加要忽略的文件。被忽略的文件对于git来说是不存在的。 `git diff`可以将暂存提交与否精确到行的级别。此命令比较的是工作目录中当前文件和暂存区域快照之间的差异， 也就是修改之后还没有暂存起来的变化内容。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/%E9%80%89%E5%8C%BA_012-300x182.png)

```null
git diff --cache #查看将要暂存到内容，即下次将要提交到内容。

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/%E9%80%89%E5%8C%BA_013-300x122.png)

```null
git commit -m "终于可以提交了好开心，这是一条提交信息。。。"

```

```null
git rm -f somefile #从工作区和暂存区中删除这个文件。不在暂存区中的文件不会被追踪。
git rm --cache somefile #从暂存区中删除这个文件。

```

```null
git mv old_file_name new_file_name #用来改名的。

```

查看提交历史
======

```null
git log #查看提交历史到


```

```null
zdk@zdk-X550JX:~/testGit/simplegit-progit$ git log
commit ca82a6dff817ec66f44342007202690a93763949
Author: Scott Chacon 
Date:   Mon Mar 17 21:52:11 2008 -0700

    changed the verison number

commit 085bb3bcb608e1e8451d4b2432f8ecbe6306e7e7
Author: Scott Chacon 
Date:   Sat Mar 15 16:40:33 2008 -0700

    removed unnecessary test code

commit a11bef06a3f659402fe7563abf99ad00de2209e6
Author: Scott Chacon 
Date:   Sat Mar 15 10:31:28 2008 -0700

    first commit
zdk@zdk-X550JX:~/testGit/simplegit-progit$ 

```

列出的信息包括每次提交的检验和，提交者的邮箱，日期，说明。

撤销操作
====

```null
git reset HEAD <file> #取消某个文件的暂存。该文件变为修改未暂存的状态。
git checkout -- <file> #迅速还原某个文件的修改。

```

远程仓库
====

```null
git remote #列出仓库，clone的仓库至少有origin。
git remote add <shortname>  <url> #添加一个远程仓库。
git fetch <remotename> #从远程拉取一个仓库到本地仓库，但不会合并。
git push <remote> <branch> #向远程推送。
git remote show <remote-name> #查看远程仓库信息。

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/%E9%80%89%E5%8C%BA_014-300x169.png) 重命名和去除，操作还是很常规的。

```null
git remote rename <oldname> <newname>
git remote rm <remotename>

```

打标签
===

有两种标签，轻量标签就是一个不会被改变的分支，还有一种是附属标签，就好像一个文件，能够被提交。

```null
git tag -a v1.4 -m 'my version 1.4' #添加一个附属标签，名字是v1.4，附属信息为my verison 1.4。
git show v1.4 #输出标签信息。
git tag v1.4 #给当前的仓库添加一个轻量标签。
git tag -a v1.4 a3f4bc #给过去的一次提交添加一个轻量标签。
git push origin --tags #把不在远程仓库上的标签都推送到远程仓库上去（push是默认不带标签的）。

```

git分支简介
=======

![](https://git-scm.com/book/en/v2/images/commit-and-tree.png) 上图是某次提交之后git保存的对象结构，其中commit对象保存这次提交的基本信息，tree对象保存目录结构，blob对象保存文件快照。经过多次提交之后，就会有一个commit对象组成的单向链表，如下图所示。 ![](https://git-scm.com/book/en/v2/images/commits-and-parents.png) 而git所谓的分支就是某个指向commit对象的指针 创建一个testing分支

```null
git branch testing

```

![](https://git-scm.com/book/en/v2/images/two-branches.png) 一个特殊的指针：Head指针，指向当前所在的分支。在分支就是指针的前提下，切换分支起始就变成了把指针指向新的commit对象这样的简单操作。

```null
git checkout testing

```

![](https://git-scm.com/book/en/v2/images/head-to-testing.png) 这时候，当前的分支就变成了testing分支，所有的提交都会被提交到testing分支上，做一些修改，然后commit，head指针就会指向master之后的一个新的commit对象上。 ![](https://git-scm.com/book/en/v2/images/advance-testing.png)

> **切换分支所导致的切换commit对象会使得工作区内的文件内容发生变化，也就是说如果在命令行里切换了分支，文件资源管理器以及某个编辑器甚至ide中显示的当前目录结构会发生变化。**

这时，如果再切换到master分支，然后做一些修改，但是修改和之前testing分支上的修改内容不同。再暂存，提交一次。此时就会出现分叉。 ![](https://git-scm.com/book/en/v2/images/advance-master.png)

```null
git log --oneline --decorate --graph --all //查看当前项目的提交记录，以及分支记录，以图形的形式展示。(下图是另一个项目的log，和上图无关)。log输出的图还是挺漂亮的，就是看不太懂。。。

```

![](https://ww1.sinaimg.cn/large/0060lm7Tly1fjx9i02v14j31e00u811y.jpg)

git分支新建与合并
==========

因为分支就是指向commit对象的指针，所以分支的新建与合并也可以转换成指针的重新指向以及合并成新的提交。 ![](https://git-scm.com/book/en/v2/images/basic-branching-1.png) 从上图的场景出发，假设我们要解决#53问题，为了保证解决问题过程中修改的代码不会污染原来的代码，我们新建一个分支iss53。有人说既然每次提交都是有快照的，那我直接在master分支上做增量的修改不行吗，反正到时候也是可以恢复的。 我的理解是分支的意义就是为了能够更加清楚的描述工作流中的代码修改历史，多个分支可以确保多个开发工作流能够同时并行，并且代码互不干扰。就像上述场景中，如果想要同时解决#54问题和#55问题，如果都是在master分支上进行修改，那么代码就会改的很乱，并且在后期的测试和代码审查中也会出现不必要的麻烦。 ![](https://git-scm.com/book/en/v2/images/basic-branching-2.png) 在iss53分支上做一些修改，并提交，这样iss53分支就会在版本上超前于master分支，成为了master分支的子分支，不过我更喜欢叫“未来的分支”。 ![](https://git-scm.com/book/en/v2/images/basic-branching-3.png) 这时候，如果出现了一个bug，需要紧急修复代码，但是iss53分支还没有开发完成，更别提代码审议和测试，是不可能合并到master分支上的。这时候分支的并行能力就体现出来了。

1.  提交iss53分支，有多少提交多少，否则工作区和暂存区的内容会冲突。
2.  切换到master分支。
3.  创建另一个叫hotfix的分支。
4.  在hotfix分支上修改代码，解决bug，并提交。

此时master分支就会有两个“未来分支”，分叉了。 ![](https://git-scm.com/book/en/v2/images/basic-branching-4.png) 假设hotfix上的代码通过了审议，经过了测试，可以合并到master里面去了。切换到master分支，然后merge hotfix一下。 **由于hotfix是master的直接上游，因此这样的合并只要让master分支前移几个commit对象就行了，不会出现什么冲突的。在git输出中会出现fast forward字样** ![](https://git-scm.com/book/en/v2/images/basic-branching-5.png) hotfix存在的意义以及完成了，可以删掉他了。再切换到iss53分支，做一些修改，做一次commit。想要合并。 ![](https://git-scm.com/book/en/v2/images/basic-merging-1.png) 可以看出，这时候iss53分支和master分支的关系比较复杂，像是叔叔和侄子。只有父子关系的分支才能直接forward合并，这种叔侄关系的合并就比较厉害了（先切换到master，然后再merge iss53）： **git会自动合并两个分支的内容，并自动commit这个合并之后的内容。现在master分支指向新的commit，并且这个新的commit成为iss 53分支的“未来分支”** 这里master和iss53的公共祖先是c2，其实是git合并的是c2、c4和c5这三个commit。 ![](https://git-scm.com/book/en/v2/images/basic-merging-2.png) 现在iss 53分支的意义也以及完成了，可以说再见了。

git分支管理
=======

```null
git branch //罗列当前所有的分支
git branch -v //罗列当前所有的分支以及最新一次提交信息
git branch --merged //查看当前分支以及已经合并到当前分支的分支，--no-merged同理
git branch -d [branchName] //删除某个分支，如果没有合并过的话可能需要-D来强制删除

```

git分支开发工作流和
===========