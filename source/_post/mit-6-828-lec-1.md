---
title: 'MIT_6.828 Homework: boot xv6'
categories:
  - MIT_6.828
tags:
  - MIT_6.828
  - OS
copyright: true
url: 191.html
id: 191
date: 2017-07-19 16:13:44
---

[![https://gyazo.com/43c38a68a3753834a69995cd0a6ee24b](https://i.gyazo.com/43c38a68a3753834a69995cd0a6ee24b.png)](https://gyazo.com/43c38a68a3753834a69995cd0a6ee24b)

<!-- more -->

HW:Boot xv6
-----------

[![https://gyazo.com/d3f45ea928d37d52128677cebab14745](https://i.gyazo.com/d3f45ea928d37d52128677cebab14745.png)](https://gyazo.com/d3f45ea928d37d52128677cebab14745) nm 命令能够列出一个obj文件的符号表，也就是说这行命令在kernel中找_start这个符号，并且获得了它所在的地址。接着启动qemu-gdb和gdb进入调试模式。这里需要两个终端开着，一个运行`make qemu-gdb`，另一个运行`gdb`(记得都要在`xv6-public`目录下启动啊！)。 在地址0010000c处设置断点，然后运行到这个断点。

```null
br * 0x0010000c
c

```

> 这里gdb报了个错误，好像是什么保护文件什么的导致不能调试了，按照他给出的提示修改.gdbinit文件就行了。其实在mit的HW提示中也有提到这个。

[![https://gyazo.com/1e3fd1122da481d365b5b4811b1bc1d3](https://i.gyazo.com/1e3fd1122da481d365b5b4811b1bc1d3.png)](https://gyazo.com/1e3fd1122da481d365b5b4811b1bc1d3) 然后看一看各个寄存器和堆栈中都有一些什么（主要就是为了熟悉一下gdb调试命令吧）。如果不熟悉某个命令可以直接`help [命令]`查看帮助，而且还挺详细的。 比如x这个指令的格式。 [![https://gyazo.com/15661ac2d82821d2e56dfcd6fa30dacb](https://i.gyazo.com/15661ac2d82821d2e56dfcd6fa30dacb.png)](https://gyazo.com/15661ac2d82821d2e56dfcd6fa30dacb) 查看一下各个寄存器的内容。 [![https://gyazo.com/9a876a061b842208e5b06c7cd8db643c](https://i.gyazo.com/9a876a061b842208e5b06c7cd8db643c.png)](https://gyazo.com/9a876a061b842208e5b06c7cd8db643c) 查看一下堆栈的内容（从esp开始，列出24个字，以16进制显示）。IO课结束了有一段时间了，有点忘记进制和字长的关系了。顺便复习一下。

> 一个word（字）应该是大多数指令能处理的最大长度，或者ALU能够运算的位宽度，字多长也就是常常说的32/64位机。那么问题来了，这个qemu是多少位的呢。。。。。。我猜是32位的，因为eax，ebx这些寄存器都是32位的。在make qemu-gdb的时候显示qemu-system-i386应该也能说明这一点吧。也就是说一个字应该是32位的，4个字节的。 16进制中，两个数字就能代表一个byte的值，即一个byte能存放0x00-0xff。那么一个字就应该是0xffffffff这样的规模。

也就是说这里从0x7bdc的位置开始打印出了24个word。 [![https://gyazo.com/6cb14362125238a4826b040fa01e1317](https://i.gyazo.com/6cb14362125238a4826b040fa01e1317.png)](https://gyazo.com/6cb14362125238a4826b040fa01e1317) exercise要求每个位置写一点注释，说明哪里是真正的堆栈，并且弄清楚现在堆栈里面存放的都是啥。要想弄清楚堆栈里面的数据的意义，就需要知道这些数据是什么时候被压入堆栈的，所以要从头开始单步运行。根据exercise的提示，从`bootmain.S`的`0x7c00`开始走一遍吧。一遍单步执行一遍可以对照着bootmain.S看，避免走过来头。 乱七八糟的指令先不去管，一直走直到有往esp放东西的时候（esp寄存器存放堆栈段栈顶的位置，如果往堆栈中push了，那么esp中的值会变小，32位机中esp一次移动4byte）。 [![https://gyazo.com/4b40ed2de60574be770dd96eddb19d71](https://i.gyazo.com/4b40ed2de60574be770dd96eddb19d71.png)](https://gyazo.com/4b40ed2de60574be770dd96eddb19d71) [![https://gyazo.com/a4f121bfcc5d762a73a41b303dd45877](https://i.gyazo.com/a4f121bfcc5d762a73a41b303dd45877.png)](https://gyazo.com/a4f121bfcc5d762a73a41b303dd45877) 这个7c00在bootmain.S中的符号是start，也就是一开始的时候的地址嘛。把这个地址赋给了esp。其实逻辑上是讲得通的，因为原来0x7c00-0x7c43存放的是bootmain.S中的指令，现在指令执行完毕了，那这一段内存就可以挪作它用，比如用来做堆栈的内存空间了。 第一个问题解决了：在0x7c43处初始化堆栈。 第二个问题，call bootmain的时候，堆栈只有一个东西（刚刚才初始化，堆栈应该还是空的），应该是call bootmain下一条指令的地址。 [![https://gyazo.com/5cf9f7ceb8ea51a7328d827b456f3f13](https://i.gyazo.com/5cf9f7ceb8ea51a7328d827b456f3f13.png)](https://gyazo.com/5cf9f7ceb8ea51a7328d827b456f3f13) 执行完call之后立刻看一下堆栈的内容。得到验证了。 [![https://gyazo.com/e2769500d04dac365752ccda41a81cea](https://i.gyazo.com/e2769500d04dac365752ccda41a81cea.png)](https://gyazo.com/e2769500d04dac365752ccda41a81cea) 第三个问题，对堆栈操作的第一条指令是push ebp，这时候ebp是0看不出什么。 [![https://gyazo.com/a7b5fc45d318e8269b32bceb88e16f80](https://i.gyazo.com/a7b5fc45d318e8269b32bceb88e16f80.png)](https://gyazo.com/a7b5fc45d318e8269b32bceb88e16f80) 第四个问题，问什么时候eip变成0x1000c了，显然是一个函数调用，bootmain中函数调用只有readseg，stosb，entry三个，前两个地址一看就不对，那明显就是调用entry函数的时候了。这个函数调用会将下一条指令的地址压栈，但是似乎这个下一条指令永远不会被执行，因为entry()函数不会返回！ [![https://gyazo.com/4b9d0bded291d5347311ffd9278cdda1](https://i.gyazo.com/4b9d0bded291d5347311ffd9278cdda1.png)](https://gyazo.com/4b9d0bded291d5347311ffd9278cdda1) [![https://gyazo.com/c18b6aa8330a337b4f6031035a85bf20](https://i.gyazo.com/c18b6aa8330a337b4f6031035a85bf20.png)](https://gyazo.com/c18b6aa8330a337b4f6031035a85bf20) 花了2个半小时才做完一个作业，太菜了。