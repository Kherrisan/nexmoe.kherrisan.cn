---
title: Java Collection——LinkedList
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 459.html
id: 459
abbrlink: 7b8114a5
date: 2018-02-10 12:43:22
---

LinkedList不同于ArrayList，虽然二者都是List，呈现给用户的都是顺序列表容器，但是底层的实现是不一样的。ArrayList直接以Java的数组作为底层实现，数组中相邻元素在元素中也是相邻的，保持一致的顺序排列。而LinkedList的底层实现使用的是链表，即LinkedList中的元素在内存中不必相邻，不必连续排列，可以分散在各处，元素花费额外的空间存放指针来记录相邻元素的位置。 链表与数组各有各的优劣，数组的随机访问效率最高，但是要插入删除元素时必须要搬移其他元素；链表插入删除元素只需要常数时间复杂度，但是随机访问需要逐个遍历元素。 比较一下LinkedList和ArrayList分别继承了哪些类，实现了哪些接口。

<!-- more -->

public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable
{}

public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
{}

AbstractSequentialList是AbstractList的子类。AbstractList提供了少数的几个方法的实现，如indexOf、clear等，其余方法均是抽象方法。AbstractSequentialList继承了AbstractList，并已经实现了大部分如今使用容器时较为常用的方法，但是完全是基于迭代器ListIterator实现的。 Java标准库并不是仅仅只能提供实现好了的东西供人使用，他也提供了很多AbstractXXX类，这些抽象类实现了部分的功能，使得开发者只要根据自己的需求，实现少数的几个方法即可。**即花费最少的精力让满足自己需求的数据结构融入到JDK的容器类框架中。** 注释也写道：如果开发者想要实现自己的随机访问容器，可以继承AbastractList，如需要顺序访问容器，最好继承AbstractSequentialList。

/\*\*
 \* This class provides a skeletal implementation of the {@link List}
 \* interface to minimize the effort required to implement this interface
 \* backed by a "random access" data store (such as an array).  For sequential
 \* access data (such as a linked list), {@link AbstractSequentialList} should
 \* be used in preference to this class.
 \*
 \* <p>To implement an unmodifiable list, the programmer needs only to extend
 \* this class and provide implementations for the {@link #get(int)} and
 \* {@link List#size() size()} methods.
 \*
 \* <p>To implement a modifiable list, the programmer must additionally
 \* override the {@link #set(int, Object) set(int, E)} method (which otherwise
 \* throws an {@code UnsupportedOperationException}).  If the list is
 \* variable-size the programmer must additionally override the
 \* {@link #add(int, Object) add(int, E)} and {@link #remove(int)} methods.
 \*
 \* <p>The programmer should generally provide a void (no argument) and collection
 \* constructor, as per the recommendation in the {@link Collection} interface
 \* specification.
 \*
 \* <p>Unlike the other abstract collection implementations, the programmer does
 \* <i>not</i> have to provide an iterator implementation; the iterator and
 \* list iterator are implemented by this class, on top of the "random access"
 \* methods:
 \* {@link #get(int)},
 \* {@link #set(int, Object) set(int, E)},
 \* {@link #add(int, Object) add(int, E)} and
 \* {@link #remove(int)}.
 \*
 \* <p>The documentation for each non-abstract method in this class describes its
 \* implementation in detail.  Each of these methods may be overridden if the
 \* collection being implemented admits a more efficient implementation.
 \*
 \* <p>This class is a member of the
 \* <a href="{@docRoot}/../technotes/guides/collections/index.html">
 \* Java Collections Framework</a>.
 \*
 \* @author  Josh Bloch
 \* @author  Neal Gafter
 \* @since 1.2
 */

List接口规定了List必须提供的几个方法。 Deque是Double End Queue（双端队列）的缩写，常常发音为“deck”，队列的两端都可以添加、删除元素。

Node
----

提到LinkedList，就不得不先提一下这个静态内部类。他表示LinkedList中的节点，封装了列表中每个元素的值、前驱和后继节点的引用。LinkedList是典型的双向链表。没有成员函数。

    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }

属性
--

与ArrayList相比，LinkedList（以下简称链表）的属性更少，因为不需要额外表示空列表了。 只有三个属性：size，first，last。 first代表链表的头节点，需要遵循一个不变式：要么first和last都是null，要么first的前驱为null并且first的值不为null。 last代表链表的尾节点，也要遵循：要么first和last都是null，要么last的后继为null并且last的值不为null。 也就是说空链表的first和last都是null，如果有元素，那么first和last都有可能被存放元素。

方法
--

 

### linkFirst

在链表头部插入一个新的元素。这需要修改老的头节点的前驱、新的头节点的后继、链表的头节点。如果头节点为null，说明是个空链表，那么这个链表的头节点和尾节点应该都是这个新加入的节点。

### linkBefore

在某个节点之前插入一个元素，顺序需要稍微注意一下。

### unlinkXXX

从链表中删除一个节点。

### node

根据索引获得链表中的元素。如果索引比size/2大，就从尾节点走，如果比size/2小，就从头节点开始遍历。

### indexOf

根据元素的equals方法，返回元素在链表中的索引。

### addAll

把参数（Collection）中的元素全部添加到某个index位置上。

    public boolean addAll(int index, Collection<? extends E> c) {
        checkPositionIndex(index);

        Object\[\] a = c.toArray();
        int numNew = a.length;
        if (numNew == 0)
            return false;

        Node<E> pred, succ;
        if (index == size) {
            succ = null;
            pred = last;
        } else {
            succ = node(index);
            pred = succ.prev;
        }

        for (Object o : a) {
            @SuppressWarnings("unchecked") E e = (E) o;
            Node<E> newNode = new Node<>(pred, e, null);
            if (pred == null)
                first = newNode;
            else
                pred.next = newNode;
            pred = newNode;
        }

        if (succ == null) {
            last = pred;
        } else {
            pred.next = succ;
            succ.prev = pred;
        }

        size += numNew;
        modCount++;
        return true;
    }

我觉得这段代码是LinkedList中比较有代表性的代码，要把一个集合中的所有元素插入到链表中的某个index上去，首先获得对于添加进来的所有元素的前驱和后继节点，如果在最后一个地方插入，后继为null，前驱为尾节点；如果在其他地方插入，后继为index处的节点，前驱为index处节点的前驱。然后就是一个一个插入，插入时如果前驱为null，说明是在链表头部插入，那么链表的首节点就是这个新的节点，后则的话前驱的后继节点就是新的节点，然后让新的节点成为下一个新的节点的前驱。

迭代器
---

和ArrayList一样，LinkedList对于concurrentModification也有限制，不能一边用foreach循环或迭代器遍历，一边用链表的remove或unlink方法删除元素。 ArrayList使用一个lastRet记住上一个返回的元素的位置，用于调用迭代器的remove方法时能够返回上一个节点的位置。链表也有一个lastRet记录上一个返回的节点。

### 深入探究Array和LinkedList中迭代器的lastRet的作用

ArrayList的迭代器中这么用lastRet ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-10_16-40-55.jpg) lastRet初始化时是-1，也就是说，如果刚刚初始化了一个迭代器，还没有next，这时就remove，是不行滴。这符合一般的认识：迭代器在初始化的时候一般是指向第一个元素的前面，也就是说要next才能返回第一个元素。 为什么在add和remove之后，lastRet都要变成-1，从而禁止多次连续修改数组元素呢？从一般的认识上来说，连续的remove应该是符合需求的。 从使用的角度看

while(iterator.hasNext()){ //不管是从前往后还是从后往前。
    E cur=iterator.next();
    if(cur......){ //做一些检验，如果检验通过，就删除他。
         iterator.remove();
    }
}

那么如果我在remove之后让lastRet变成lastRet-1是否可行呢？首先，iterator并不是只能单向移动的，ListIterator都可以previous，如果一个元素一定要先取得——检验之后再决定删除的话，就不能保证lastRet-1是否被检验过（可能这个iterator一直是从后往前走的呢。。。）既然方向不确定，就不能根据上一个推出上上一个，把遍历顺序记录下来肯定也不现实，所以就干脆把lastRet改为-1，这样连续remove就会直接报错了吧（应该也是**fail-fast**的一种体现）。 太无聊了，写个benchmark来比一比ArrayList和LinkedList的插入效率吧。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-10_15-36-25.jpg) 众所周知，人们常说，ArrayList中进行插入删除元素的操作，由于需要元素的搬移，效率往往低于LinkedList。结果倒还真的出乎我意料。 如果仅仅是在列表尾端插入元素，那么二者的运行时间没有什么大的差别，如果是在固定位置（往往是较靠前的index）插入，LinkedList的优势才能显现出来。 从代码上来看，LinkedList在固定位置插入，需要线性时间来找到那个位置所对应的节点（也就是node函数），然后再用常数时间插入新元素，因为在代码中我把index固定为了0，较为靠前，因此找到节点花费的时间近似为常数时间。ArrayList在0处插入新元素，每次都要搬移后面的元素，更不要提数组的扩容后的复制了。 但是在第一张图中，在列表尾端插入元素，ArrayList却比LinkedList更快呢？即便ArrayList不需要搬移元素，但是数组的扩容，扩容之后的集体复制也需要线性时间啊。 忽然灵光一现，想到了分摊复杂度的概念，顿时就豁然开朗了。由于数组扩容并不是每次都扩容，每次都批量复制，把少数几次扩容和批量符指分摊到每次操作上，每次操作所需要的时间也就接近与常数时间了。 所以，还是那句话，数据结构的选择是要根据具体的情境、具体的业务需求决定的，不是简单的一句链表比数组插入得快所能概括的了的。