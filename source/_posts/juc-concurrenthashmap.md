---
title: JUC——ConcurrentHashMap
categories:
  - JUC
tags:
  - java
  - 并发
copyright: true
url: 988.html
id: 988
abbrlink: b6a54201
date: 2018-10-14 17:14:51
---

![](https://oss.kherrisan.cn/dbdcdc86ee06761292636a46d6fc8878.png) 1.7中的ConcurrentHashMap使用分段锁来解决并发线程之间的同步竞争问题，本文总结1.8中的实现。

<!-- more -->

属性
==

1.  table：Node类型的数组，用于存放散列桶
2.  nextTable：扩容阶段的新的table
3.  baseCount
4.  sizeCtl：一个状态变量
    *   -1表示map正在初始化
    *   -(1+n)表示正在有n个线程一起努力扩容map
    *   在初始化之后，正数表示下一次扩容的阈值
    *   在初始化之前，正数表示table的初始大小
5.  transferIndex
6.  cellsBusy
7.  counterCells：CounterCell的数组，CounterCell似乎是用来计数的。

* * *

方法
==

1\. putVal
----------

一个很长很长的方法：

```java
final V putVal(K key, V value, boolean onlyIfAbsent) {
        if (key == null || value == null) throw new NullPointerException();
        int hash = spread(key.hashCode());
        int binCount = 0;
        for (Node<K,V>[] tab = table;;) {
            Node<K,V> f; int n, i, fh;
            if (tab == null || (n = tab.length) == 0)
                tab = initTable();
            else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
                if (casTabAt(tab, i, null,
                             new Node<K,V>(hash, key, value, null)))
                    break;                   // no lock when adding to empty bin
            }
            else if ((fh = f.hash) == MOVED)
                tab = helpTransfer(tab, f);
            else {
                V oldVal = null;
               //省略部分代码
            }
        }
        addCount(1L, binCount);
        return null;
    }

```

1.  通过spread算出hash。spread的算法与HashMap中的hash函数类似，把高16位与低16位进行异或得到结果（当然高16位还是被保留的），区别在于这里hash值的最高位用作标志位，因此只能用低31位作为hash之后的index，最高位强制为0。

![](https://oss.kherrisan.cn/41c3beacdddb68b5f1d36a4c8f64e884.png)

2.  进入一个死循环。 2.1. 检查刚刚拿到的table是否为null，或者长度是否为0，如果是空的，就初始化一个table。这里有可能出现多个线程同时调用initTable的情况。initTable函数也是一个死循环，在这个循环中多个线程争夺修改sizeCtrl变量的机会：抢着把sizeCtrl改为-1，如果CAS修改操作成功，说明抢到了初始化table的机会，再次检查一下table是不是空，如果是空的，就让table指向一个长度为n的新的Node数组。最后把sizeCtrl改为原来sizeCtrl的0.75倍。也就是说，在table为null的时候，sizeCtrl会发生缩减。

**这里把sizeCtrl改为-1相当于一个latch，把其他线程锁在了外面（其他线程只能yield）。一旦某个线程完成了table的创建，所有线程就都会从循环中退出来，退出initTable函数。** **在while条件处会判断table是否为null，或者长度是否为0，当CAS操作成功只有还会再做一次判断，这样判断两次的目的应该是为了防止在进入while循环后，其他线程完成了table的创建，sizeCtrl变为正数，那如果当前线程再new Table的话就会造成资源的浪费了。（光一个创建数组操作就如此复杂，滴水不漏）** ![](https://oss.kherrisan.cn/e4d0c7796b2b0dcde9efc3856ef7cc13.png) 2.2.1. 如果f为空，通过CAS在table的hash位置插入一个新的node，插入成功则退出，插入失败则继续循环（回到2）。这里CAS操作只做一次，如果失败了就说明有另外一个线程在table的同样的地方插入了一个新的元素，而插入失败的线程就只能在下一次循环中遍历这个链表，把node插在链表尾部了。 2.3. 如果table的hash位置的f的hash==MOVED（-1），说明这个node后面的链表正在扩容，调用helpTransfer帮助其扩容。 2.4. 通过synchronize把这个桶加锁，尝试往这个桶中插入元素。 2.4.1. 如果是链表，就遍历链表并检查有无Node的key与目标key相等，如果存在就修改value为新的值，如果没有就在链表尾部插入一个新的节点。 2.4.2. 如果是红黑树，调用TreeBin的putVal方法插入元素。 2.4.3. 在遍历链表的过程中还会统计这个链表中节点个数，如果超过TREEIFY_THRESHOLD就会把这个链表变为一棵二叉树。 2.5. 调用addCount，元素个数加一。

> putVal的步骤总结一下： 1. 检验参数，计算hash，进入for循环2。 2. 一个循环。 2.1. 如果table为空，initTable。 2.2. 如果table\[hash&(table.length-1)\]为空，尝试CAS插入新节点。 2.3. 如果table\[hash&(table.length-1)\]的hash是MOVED，调用helpTransfer帮助其扩容。 2.4. 同步加锁，向链表或者红黑树中插入新节点，或者修改已有节点的value。 3. map元素个数加1。

* * *

2\. addCount
------------

addCount语义上的功能为让map的大小（size）加1。addCount的代码可以分为两段。 ![](https://oss.kherrisan.cn/987256f0e0ac59d7826222cacb3183a0.png)

1.  如果counterCells为null，就直接返回。
2.  如果通过CAS直接修改baseCount成功，就直接返回。
3.  如果刚刚拿到的counterCells为null（说明CAS是失败的），就调用fullAddCount，并返回。
4.  如果刚刚拿到的counterCells（记为as）不为null，而as长度为0（本质上和null是一回事），就调用fullAddCount，并返回。
5.  如果as的某个随机的位置为null，就调用fullAddCount，并返回。
6.  如果通过CAS直接修改CELLVALUE失败了，就调用fullAddCount，并返回。
7.  如果以上条件都不满足，调用sumCount计算得到一个s。

sumCount的实现逻辑是在baseCount的基础上，累加上所有的CounterCell的值。 以上是addCount的上半段，下半段应该是check>=0的时候需要进行的操作。 ![](https://oss.kherrisan.cn/470aa3a3a2732ede598cc39debc99980.png) 主体是一个while循环，循环判断的条件比较苛刻：

1.  刚刚计算的sumCount比sizeCtrl大： 1.1. table正在扩容 1.2. 或者sumCount比下一次扩容的阈值大
2.  table不为空
3.  table大小不超过最大容量

while循环体：

1.  根据table长度计算resizeStamp（记为rs）。
2.  如果sizeCtrl<0，说明要么是没有初始化，要么是正在扩容。 2.1. 如果sizeCtrl中保存的stamp（记为sc）和rs不相等，或者sc比rs大1，或者sc比rs大MAX_RESIZERS，或者transferIndex<=0，就直接返回。这里可以猜测，肯定是其他线程修改了sizeCtrl，导致sizeCtrl的stamp与rs不一致。 2.2. 如果通过CAS尝试让sizeCtrl加1成功了（多了一个线程参与扩容），就帮助其扩容。 2.3. 如果sizeCtrl>=0，说明当前不在扩容，通过CAS修改sizeCtrl为`(rs << RESIZE_STAMP_SHIFT) + 2`。（**其实这里会面临一个问题，就是sizeCtrl经过如此计算之后会变得特别大？**）
3.  每次循环都重新计算一次sumCount。

* * *

3\. resizeStamp
---------------

![](https://oss.kherrisan.cn/6640e8c8a5b2ab14a87427946e3893eb.png) 返回的是table长度的前导0的个数 按位或 2^15。table最大大小为`Integer.MAX_VALUE - 8`，`Integer.MAX_VALUE`是除符号位外全为1，也就是2^31-1，前导0的个数会是0-32，0-32的数占6个二进制位，这6个二进制位与2^15进行或操作，也就是说造出了个这样的数字： **0000 0000 0000 0000 1000 0000 00xx xxxx** 尝试反推为什么要这么做，比如table.length为30，31，32时，rs： **0000 0000 0000 0000 1000 0000 0001 1011** **0000 0000 0000 0000 1000 0000 0001 1011** **0000 0000 0000 0000 1000 0000 0001 1010** 注意，sizeCtrl也有保存stamp的功能，根据addCount的check中的代码，sizeCtrl的高16位保存的值应该和rs是同一个概念。

* * *

4\. helpTransfer
----------------

helpTransfer这个函数被调用的机会不多，主要都是在putVal、clear、replaceNode这三个函数中。刚刚在putVal的流程中涉及到了helpTransfer。 ![](https://oss.kherrisan.cn/c15c3369264dfd90022f2d40dfafd9e7.png) helpTransfer的第二个参数是一个Node，在putVal中，如果遇到某个node的hash==MOVED的情况，就对这个node调用helpTransfer。MOVED代表这个node是ForwardNode。 FowardNode类继承于Node类，它拥有一个叫nextTable的字段，所有的ForwardNode的hash值都是MOVED（-1），这个值是一个静态常量。 **在数组扩容（转移）的过程中，如果table的某个位置为null，则会在那里插入一个ForwardNode** helpTransfer的实现逻辑：

1.  检查table是null，或者该node（记为f）不是ForwardNode，或者f的nextTable为null，就直接退出。
2.  利用table的长度计算stamp（记为rs）。
3.  一个while循环，循环条件为：刚刚拿到的ForwardNode中的nextTable和map中的nextTable是同一个东西，并且table还是那个table，并且正在扩容！。 3.1. 和addCount中的check一样，把sizeCtrl和rs一顿比较，意义不明。 3.2. 通过CAS让sizeCtrl加1，代表又多了一个线程参与了扩容，如果CAS失败了的话就算了。

* * *

5\. transfer
------------

transfer应该是ConcurrentHashMap的方法中最长的方法了。 直接看代码不太好理解，先引用一段别人写的：

> 1.  如果当前的 nextTab 是空，也就是说需要进行扩容的数组还没有初始化，那么初始化一个大小是原来两倍的数组出来，作为扩容后的新数组。
> 2.  我们分配几个变量，来把原来的数组拆分成几个完全相同的段，你可以把他们想象成一个个大小相同的短数组，每个短数组的长度是 stride 。
> 3.  我们先取最后一个短数组，用 i 表示一个可变的指针，可指向短数组的任意一个位置，最开始指向的是短数组的结尾。bound 表示短数组的下界，也就是开始的位置。也就是我们在短数组选择的时候是采用从后往前进行的。
> 4.  然后使用了一个全局的属性 transferIndex（线程共享），来记录当前已经选择过的短数组和还没有被选择的短数组之间的分隔。
> 5.  那么当前的线程选择的这个短数组其实就是当前线程应该进行的数据迁移任务，也就是说当前线程就负责完成这一个小数组的迁移任务就行了。那么很显然在 transferIndex 之前的，没有被线程处理过的短数组就需要其他线程来帮忙进行数据迁移，其他线程来的时候看到的是 transferIndex 那么他们就会从 transferIndex 往前数 stride 个元素作为一个小数组当做自己的迁移任务。