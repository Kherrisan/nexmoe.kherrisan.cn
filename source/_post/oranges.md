---
title: Orange'S——学习笔记
categories:
  - OS
tags:
  - OS
copyright: true
url: 875.html
id: 875
date: 2018-08-18 21:47:33
---

由于时间关系，不能够跟着书的进度自己一点点动手写出一个操作系统，因此想着先把书的内容过一遍，只要了解到OS底层运作思路即可。Orang'S下文简称为OS。

启动和加载

<!-- more -->

=====

OS的启动和加载主要分为三个阶段。

1.  BIOS检查外部存储设备并加载boot模块。
2.  boot模块从外部存储设备搜索并加载loader模块。
3.  loader模块从外部存储设备搜索并加载kernel模块。运行kernel.bin，正式进入系统。

由于BIOS对boot模块的大小有限制，只能有512字节，因此启动过程中的大部分操作都在loader中进行。

Boot
----

Boot是最先被读取并被加载进入内存的部分，根据约定，Boot不能超过512字节，且最后两个字节作为引导记录的标志，必须为0xaa55，这样BIOS才能识别的到。在OS中，boot、loader、kernel都是存放在floppy中的，为了方便写入文件，并且降低搜索文件和加载文件的复杂度，loader和kernel都是作为普通的文件写入floppy，而floppy被预格式化为了FAT12文件系统，这样boot只要按照读写FAT12文件系统的逻辑运行就可以读到loader和kernel。

Boot流程：

1.  软驱复位
2.  在根目录区，逐个读取条目，比对文件名，直到找到Loader.bin所在的扇区号（开始簇号）。
3.  在FAT表1，根据开始扇区号，读取该扇区在FAT表中的条目（簇号），读取该簇号对应扇区的文件。
4.  根据簇号读取该簇号（扇区号）在FAT表中的条目（另一个簇号），重复读取这样的链式结构，直到某个条目的簇号为结束标志符。
5.  跳转到Loader的入口代码处，交出控制权。

FAT12文件系统
---------

FAT12文件系统将存储空间分为四块：引导区，FAT表1和FAT表2，根目录区，用户数据区。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-08-18_18-42-39.png)

在FAT文件表中，每个条目占12位（一个半字节），条目所在位置或者说条目在表中的索引为该扇区簇号，条目内容为该文件下一部分簇号。

Loader
------

Loader的功能如下：

1.  通过BIOS的15号中断（SMAP）读取总的内存空间大小。
2.  以和Boot相同的方式，在floppy中定位到kernel.bin所在的位置，并加载到内存中。
3.  启动保护模式的一系列操作：关中断，打开A20地址线，修改cr0寄存器的值，跳转到32位代码段。从此正式进入保护模式。
4.  根据之前读到的内存空间大小，初始化足够的页目录和页表。
5.  由于kernel.bin是ELF格式的，因此要重整kernel.bin在内存中的数据。
6.  将控制权交给内核。

Loader将内存组织为下面这样子：

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-08-19_10-40-31.png)

ELF文件格式
-------

ELF是一种文件格式约定。对象文件有三类：

1.  可重定位文件。也就是.o文件。一个或多个.o文件可以被归档为一个静态库文件。
2.  可执行文件。
3.  可被共享文件。也就是.so动态库文件。

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-08-19_11-45-09.png)

上图中左侧为链接视图，右侧为运行视图。链接过程中以section为单位，运行过程中以segment为单位。整个文件可以分为4部分：

1.  ELF头部
2.  program header table（程序头部表）
3.  sections\\segments
4.  section header table（节头部表）

ELF头部结构如下：

typedef struct {   
	unsigned char e\_ident\[EI\_NIDENT\]; 	//一个数组，数组内容包括：魔数、32位/64位、大端/小端、文件版本等。  
	ELF32\_Half e\_type; 			//文件类型，可执行文件或者可重定向文件或者可共享文件  
	ELF32\_Half e\_machine; 			//架构  
	ELF32\_Word e\_version; 			//  
	ELF32\_\_Addr e\_entry; 			//可执行程序入口点地址  
	ELF32\_Off e\_phoff; 			//程序头部表地址  
	ELF32\_Off e\_shoff; 			//节头部表地址  
	ELF32\_Word e\_flags;   
	ELF32\_Half e\_ehsize; 			//ELF头部大小  
	ELF32\_Half e\_phentsize; 		//程序头部表单个表项大小  
	ELF32\_Half e\_phnum; 			//程序头部表表项个数  
	ELF32\_Half e\_shentsize; 		//节头部表单个表项大小  
	ELF32\_Half e\_shnum; 			//节头部表表项个数  
	ELF32\_Half e\_shstrndx; 			//名称表的位置  
}Elf32_Ehdr;

  
程序头部表结构如下：

  
typedef struct{  
    Elf32\_Word p\_type;  
    Elf32\_Off p\_offset;				//段相对于文件的偏移地址  
    Elf32\_Addr p\_vaddr;				//段在内存中的虚拟地址  
    Elf32\_Addr p\_paddr;				//段的物理地址  
    Elf32\_Word p\_filesz;			//段在文件中的长度  
    Elf32\_Word p\_memsz;				//段在内存中的长度  
    Elf32\_Word p\_flage;			  
    Elf32\_Word p\_align;				//字节对齐  
} Elf32_phdr;

节头部表的结构如下：

typedef struct{  
    Elf32\_Word sh\_name;  
    Elf32\_Word sh\_type;				//节区类型：程序定义、符号表、字符串表、重定位表等  
    Elf32\_Word sh\_flags;  
    Elf32\_Addr sh\_addr;  
    Elf32\_Off sh\_offset;  
    Elf32\_Word sh\_size;  
    Elf32\_Word sh\_link;  
    Elf32\_Word sh\_info;  
    Elf32\_Word sh\_addralign;  
    Elf32\_Word sh\_entsize;  
}Elf32_Shdr;

常见系统节区：

1.  字符串表。类似于JVM字节码文件的常量表。只负责定义常量，其他地方如果要用到某个字符串常量只要通过索引即可。一般会有一个或者多个字符串表。
2.  符号表。符号表格式相对复杂，每个符号表项约定了该符号的名字、值（某个具体值或者函数地址）、占用大小、可见性、类型（函数、变量、外部文件、某个节区）
3.  代码段（.text）。符号表中会有字段指向代码段中的某个位置，来表示函数的代码。
4.  全局偏移表（.got）。为了使得对全局变量的有效引用不依赖于实际的地址空间，因此为全局符号（静态函数或者变量）提供一个偏移量表。
5.  过程链接表（.plt）。
6.  哈希表。
7.  数据段（.data .bss .rodata）。

段页式存储
=====

逻辑地址经过分段转换变为线性地址，线性地址经过分页转换变为物理地址。段式存储是从逻辑上对内存的区域进行划分，以求对区域内内存的保护和管理，页式存储是从空间上对内存空间进行等分映射，目的在于控制内存分配粒度（外碎片）、虚拟地址空间。

分段
--

x86段表也成描述符表，有全局（GDT）和局部（LDT）两种描述符表，全局描述符表由内核管理，局部描述符表由进程管理。描述符表能够介入实模式中“段基址+段内偏移”的直接寻址模式，是一个中间步骤。

x86的段表项的结构如下：

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage.png "NewImage.png")

每个表项占8个字节，其中占字节位数最多的是base和limit，由于某些历史上的原因，base和limit各自都不是连续地存放在表项中的。

*   段基址共32位，4G，表示段的起点位置。
*   段界限共20位，表示段的长度，单位取决于G字段（1Byte或者4KByte）。
*   S为表示系统段、数据段。
*   DPL表示特权级，0、1、2、3。
*   P表示该段是否在内存中，和页表项的P位类似。
*   AVL位保留字段。
*   DB表示段的默认操作尺寸：16bit或者32bit。

要引用某个段表项时，只需要指定段表项相对于表头的索引，即索引加1对应内存地址加8。索引不是数字，而是段选择子（selector）。段选择子的格式如下：

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage-1.png "NewImage.png")

*   一个selector占16位。
*   高13位用于索引段表项。Index加1的话整个选择子的值增加8，正好对应每个段表项8个字节的特性。
*   TI位用于区分是GDT还是LDT。
*   RPL表示特权级，0、1、2、3。

真正使用时，将选择子放入段寄存器中（CS、DS、SS等），硬件就会自动通过选择子找到对应的段表项，取得段表项的基址和界限，确认逻辑地址的段内偏移在界限内之后，通过基址+段内偏移得到线性地址。

系统通过GDTR寄存器来找到GDT的位置。

LDT相当于GDT的后级段表。

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage-2.png "NewImage.png")

LDTR寄存器存放某个选择子，系统会根据该选择子从GDT中选择某个段，然后将该段的基址和界限内的内存空间视为一张LDT，通过逻辑地址SELECTOR:OFFSET的SELECTOR选择段表项，通过OFFSET得到具体的线性地址。

使用LDT的好处是，只需要切换LDTR，就可以让相同的逻辑地址指向不同的线性地址。

分页
--

OS中使用页目录——页表组成的二级页表结构来将线性地址转换为物理地址。

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage-3.png "NewImage.png")

页目录项和页表项的结构大致相同：

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage-4.png "NewImage.png")

*   Avail保留。
*   G位表示全局页，全局页表示当CR3加载时，该页目录项或者页表项也是有效的。
*   D位表示脏位。
*   A位表示是否被访问过。
*   PCD位表示单个页或者页表是否可以被缓冲。
*   U/S位表示特权级，与CPL（CR0中的WP位）一起共同控制读写权限。
*   R/W位表示读写权限，与CPL（CR0中的WP位）一起控制读写权限。
*   P位表示是否存在于内存中。如果不存在，会产生页错误。

注意：多个页表并不需要连续存放，页表可以存在于内存中的任何位置。

系统通过CR3寄存器获得页目录基址。

TSS（任务状态段）
----------

TSS可以看做一张表。

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage-5.png "NewImage.png")

TSS的用户：

*   保存ring0、ring1、ring2的栈顶和堆栈段选择子。
*   通过JMP+TSS段选择子，可以一次性切换一堆寄存器（先保存当前寄存器值到TR指定的TSS，再用新的TSS中的寄存器值替换寄旧值）。GDT中可以存放多个TSS，引用TSS同样需要使用selector。

据说设计TSS的初衷就是为了方便任务切换，但由于效率太低，因此已经被启弃用了。

中断
==

中断本质上是一种事件处理机制。

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage-9.png "NewImage.png")

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage-6.png "NewImage.png")

OS保护模式下的中断的处理机制如下：

1.  由外部设备或者CPU产生触发中断，硬件会根据中断号在中断描述符表（IDT）中选择一个表项，IDT中存放的表项成为门描述符，有3种：中断门、陷阱门、任务门。
2.  取出门描述符后，会进行一些检查：limit检查、权限检查。
3.  从门描述符中读取段表选择子，判断是LDT还是GDT（依靠TI位）。
4.  根据选择子从段表中读取代码段描述符，会进行一些检查：limit检查，权限检查。
5.  段描述符的base+门描述符的offset得到中断处理程序的地址。

x86提供了一些预制的中断和中断向量号。这些预制的中断能够保证在该事件发生时，硬件会根据中断向量号去调取相应的门描述符，但门描述符的内容需要操作系统自己去设置。还可以使用8259来处理新的外部中断。

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage-8.png "NewImage.png")

x86在进入中断处理程序之前，会把eflags、cs、eip、errorcode压栈，便于中断处理程序结束之后回到中断现场。

保护模式
====

![NewImage](https://www.dokyme.cn/wp-content/uploads/2018/08/NewImage-10.png "NewImage.png")

进程管理
====