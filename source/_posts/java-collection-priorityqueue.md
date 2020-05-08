---
title: Java Collection——PriorityQueue
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 982.html
id: 982
abbrlink: ecb1842
date: 2018-10-05 18:31:50
---

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/5e8210e35fb88ecb1fdf30acb61e0c78.png) Java中的优先队列采用的是最小堆的结构，即使用数组来保存一棵完全二叉树。**无界**，可以自动扩容。用于比较的元素值必须是不可变的否则最小堆的性质会被破坏。

<!-- more -->

 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/b969e51cd210f011a3bd6b8062a1e37b.png)

属性
==

1.  queue，一个Object类型的数组，这是保存完全二叉树的实体。
2.  size，优先队列的大小。
3.  comparator，比较器，优先队列有两种比较方式：直接传入comparator或者让元素继承comparable接口，大小关系由此确定。
4.  modCount，修改次数，避免一边遍历一边修改的情况发生。

方法
==

1.  构造函数

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/1fe7802e49a2a44c3ef2f4c7c76cfc70.png) 第一个参数是初始化容量，默认是11，**优先队列是本身是无界的**，因此初始化容量并不是最大容量。第二个参数是一个比较器。

2.  offer

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/998f055c56e027ba9469f64dfd25a4f5.png) 向优先队列中插入一个元素。由于offer的语义是向队列尾部插入一个元素，但是优先队列的首尾顺序是依靠元素大小顺序的，因此这里offer就是简单的插入一个元素的意思。

1.  判断是否需要扩容，如果要的话就grow。判断的标准是数组有没有满。
2.  如果数组为空的话，把元素放在第0位。
3.  如果数组不为空，把元素放在最后一位，并shiftUp该元素使其上浮到路径上的正确位置。

和教科书上的最小堆不一样，这个最小堆的第0位也是放东西的，这就说明第i个元素的父节点是（i-1）/2，子节点是2i+1和2i+2。

3.  grow

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/4cce5cea01ccdf0b5019a76c5a33966f.png) 扩容的过程贼简单，如果原先数组大小较小（比64小），就扩容一倍，否则扩容一半。然后Arrays.copyOf把原数组的元素复制到新数组即可。

4.  siftUp

元素上浮可以使用comparator也可以使用comparable的compareTo方法，但如果即没有comparator又没有实现comparable接口的话是不行的。而不论用哪种方式来表大大小关系，上浮算法的过程都是一样的。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/cb61a3363ccd546506cb98788c1d7c6a.png)

5.  siftDown

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/c41422d0eef4943e049b6eba218cfea9.png) 和上浮不同的是，下沉的过程中每个元素可能往两个位置下沉：他的左子节点和右子节点。如果是最小堆的话，就要和两个子节点中的最小的元素交换位置，以此保证最小堆的性质。但同时又要注意有的节点没有右子节点。如果父节点比两个子节点中的最小节点还要小，那就不需要继续迭代了。

6.  heapify

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/fe367d5c7ebba6912b9d555d9509cb1a.png) 从二叉树的倒数第二层开始，每个节点进行下沉操作。

7.  poll

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/1f31843643155b3db11d404e15bf4f5b.png) poll的语义是从队列首部弹出一个元素，这里即为从最小堆中弹出一个最小的元素，在数组中，最小的元素就是第0位的元素。 把数组最后一个元素放到第0位，然后下沉。最后返回原来在第0位的元素。

8.  removeAt

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/e4578ad3f1c3db8e7fcd0496f258ee49.png) 删除数组中的第i位元素，这个方法主要是为了remove(object)方法服务的。

1.  修改modCount，size。
2.  看删除的是不是最后一个元素，如果是的话，把最后一个设为null就行啦。
3.  把最后一个元素放到第i位上，先下沉。
4.  如果在上一步中最后一个元素不用下沉，那就说明该元素比它的两个子元素还要小，说不定比被删掉的元素还要小，出现这种情况的原因是最后一个元素不在原来第i个元素的子树中，这样他们的大小关系是不确定的。那就需要让现在的第i个元素上浮试一试了。
5.  如果上浮成功了，就返回原先的最后一个元素，否则返回null。返回值主要是为了迭代器move方法服务的。

Itr迭代器
======

属性
--

1.  cursor，下一次要返回的元素在数组中的位置。
2.  lastRet，上一次next操作返回的元素在数组中的位置。
3.  forgetMeNot，一个贼神奇的东西。。。
4.  lastRetElt，上一次next操作返回的元素。
5.  expectedModCount，修改次数。

方法
--

### next

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/9bd982b40e903e670d6f727ddd0734ad.png)

1.  检查有没有发生并发修改错误。
2.  如果cursor<size，就直接返回下一个元素。
3.  如果cursor已经走到头了，那有两种情况： 3.1. 真的走到头了，所有元素都遍历过一次了，就抛出NoSuchElemetException。 3.2. 如果走到头了，但是上浮的元素没有被遍历过，就从forgetMeNot中取出一个元素，返回他。

不论是普通系列，还是forgetMeNot中的序列，每次next之间都只能remove一次。

### remove

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/59384f64e44c67a6765cfea27c15617a.png)

1.  检查有没有发生并发修改错误。
2.  如果上一个返回的元素是有效的，不是-1，就用优先队列的removeAt方法删除该元素。lastRet变为-1，用于标识上一个返回的对象已经被删掉了，不存在了。 2.1. 如果removeAt方法返回的不是null，说明removeAt的删除过程中，最后一个元素被移动到了第i位，并且成功上浮了。如果还按照之前的规则一个一个向后遍历，那这个元素会被漏掉，这时候把这个元素加到forgetMeNot。 2.2. 如果返回是null，说明没有上浮，那就让cursor--，因为上一次next之后cursor等于i+1，这时把第i个元素删除，并把最后一个元素移到第i位，可能会下沉，但没有上浮，cursor需要从第i位开始。
3.  如果lastRtn是-1，但是lastRtnElt不为null，说明上一个元素就是从forgetMeNot里取出来的，这个元素本来是最后一个元素，由于某次remove导致其上位而被加到了forgetMeNot中，现在遍历到了他，并且要把他删掉，于是调用优先队列的removeEq方法将其从堆中删除（这时没人知道他在数组的哪个位置，因为它上浮了，也许上浮了很多步）。