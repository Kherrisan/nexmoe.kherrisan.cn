---
title: Java Collection——HashMap
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 509.html
id: 509
abbrlink: 3bd06c35
date: 2018-02-14 16:08:09
---

**本部分的内容可能会随着java版本的变化而产生较大的变化，因此事先注明：下面的代码和原理都是基于JDK1.8。** ![](https://oss.kherrisan.cn/Snipaste_2018-02-14_13-15-56-1.jpg) Map是一种不同于List、Set和Queue的数据结构，其中存放的每个单元实际上包含两个元素————Key和Value，这两个元素都是开发人员所关心的。Map描述的是Key和Value的对应关系，就如同List中一个index对应一个element，只是Map的Key的类型并不一定是整数，可以是其他任何类型。

<!-- more -->

 ![](https://oss.kherrisan.cn/Snipaste_2018-02-14_15-53-23.jpg) HashMap继承了AbstractMap，实现了Map、Cloneable和Serializable接口。 其中Map接口如下：

```
public interface Map<K,V>{
    int size();
    boolean isEmpty();
    boolean containsKey(key);
    boolean containsValue(value);
    get(key);
    put(key,value);
    remove(key);
    putAll(map);
    clea();
    keySet();
    values();
    entrySet();
    getOrDefault(key,defaultValue);
    forEach(action);
    replaceAll(function);
    putIfAbsent(key,value);
    remove(key,value);
    replace(key,oldValue,newValue);
    replace(key,value);
    computeIfAbsent(key,mappingFunction);
    compute(key,remappingFUnction);
    merge(key,value,remappingFunction);
}

```

大部分函数的参数和返回值都是Key的类型或Value的类型，少数几个Java 8中的方法为函数式编程提供了支持，能够传lambda表达式为参数。 回到HashMap。

属性
--

### 静态类属性

静态属性中，除了两个用来约束capacity的属性之外：

#### DEFAULT\_LOAD\_FACTOR

默认装载因子，0.75。装载因子是一个很影响Hash容器效率的属性，反映的是Hash容器中数据的疏密程度。装载因子过大，Hash容器中绝大多数桶都放有元素，但每个桶中的链表很有可能会很长，这样在散列冲突的时候进行搜索就会花费一定的时间；装载因子过小，会导致空间利用率过低。 从直观上来说，装载因子决定了capacity的动态调节。

#### TREEIFY_THRESHOLD

HashMap使用的结构是可以动态变化的，可以是List或者Tree，做出选择的标准就是bucket（桶）的数量，如果数量大于这个阈值，就由List变为Tree。 取值为8。

#### UNTREEIFY_THRESHOLD

如果HashMap中桶的数量在remove的过程中逐渐变小，并越过了这个阈值，就untreeify这个map。换言之，使用Tree变为List。 取值为6。

#### MIN\_TREEIFY\_CAPACITY

如果table的capacity过小，是不允许treeify的，只有capacity超过这个值，并且某个桶的链表长度超过了threshold，才会将那个桶treeify。

### 实例属性

#### table

Node的列表。

#### entrySet

将一对key-value看做一个entry，在以entry为单位遍历的时候，就需要一个容器来承载所有的entry，entrySet属性用于保存这个容器。它是一个Set<Entry<K,V>>

#### threshold

下一个需要resize的值。

#### loadFactor

装载因子。size/capacity。

其他内部类
-----

### Node

桶节点，多个Node组成了一个链表。每个Node保存自身的hash、key、value和next。

方法
--

其实各个方法所起的作用大都很简单，无非就是增删改查，重点在于散列的原理和解决冲突的办法。首先来看getNode方法如何根据hash值找到对应的节点。 ![](https://oss.kherrisan.cn/Snipaste_2018-02-14_19-03-24.jpg) 该函数有两个参数，一个是hash值，一个是key值，hash值用来找到对应的bucket，key值用来验证或解决冲突。

1.  首先通过table\[(table.length - 1) & hash\]找到hash对应的桶。进行按位与的目的就是为了把hash的空间映射到表空间中，相当于hash%table.length。
2.  检查桶中的节点的hash、key是否和参数一致，确认是否是想要找的那个。
3.  如果通过散列找到的桶中的节点不是所要的节点的话，说明有冲突了，就需要进一步搜索。
4.  如果桶中的节点是树节点，调用getTreeNode方法进行搜索。其实是一颗红黑树。
5.  如果不是树节点，说明是一个链表，按照开链法的底层构造进行遍历搜索，直到找不到，返回null。这里判断是不是树节点使用了instanceof关键字。

其中第一步从table中取对应的桶，使用了按位与运算，将hash映射到table.length-1的空间内。**由于table的长度始终是2的整数次方**，转为二进制后各位均为1，因此这里的按位与运算从结果上看相当于取余（mod）运算。至于这里使用按位与而不是取余运算，我认为还是处于效率的考虑。 操作Map时，大部分函数都需要key作为参数，在HashMap结构内部通过key计算出一个hash值，hash值的计算过程如下图所示： ![](https://oss.kherrisan.cn/Snipaste_2018-02-14_19-12-49.jpg) 通过将key的hashCode方法的返回值无符号右移16位，再与自身异或，得到正式的用于散列的hash值。显然，在这个过程中，hashCode方法起到了较为重要的作用。先右移16位再与自己异或的目的是为了让低16位和高16位能够充分参与到散列键的运算中，16位是个不小的数字。 异或是一个神奇的运算符，他之所以神奇，是因为他和与、或相比，能够使结果最为均匀的分布。就像洗牌洗的最均匀一样。真值表就能说明这个问题：

and

or

xor

0

0

0

0

0

0

1

0

1

1

1

0

0

1

1

1

1

1

1

0

从表中可以看出，and和or得到的0和1的结果个数都不相同，只有xor得到的0和1的个数才是相同的。 使用hashCode的时候，通常要使得分布较为均匀，使用and和or运算都会造成0或者1的偏多或偏少，因此计算hashCode的代码常常用到异或操作。

### hashCode()

hashCode方法是Object类定义的方法之一，用来返回某个对象的散列值。在Object类的定义中，hashCode的默认实现返回的是该对象所在内存的地址。通常在涉及到HashSet、HashMap、HashTable之类的容器时，需要开发者重新考虑自定义的类的hashCode计算方式。 hashCode的计算需要遵循一些规则，这有助于容器类操作效率的提升以及正确性的保证。

> *   Whenever it is invoked on the same object more than once during an execution of a Java application, the hashCode method must consistently return the same integer, provided no information used in equals comparisons on the object is modified. This integer need not remain consistent from one execution of an application to another execution of the same application.（一个Java程序运行的过程中，同一个对象返回的hashCode必须一致。）
> *   If two objects are equal according to the equals(Object) method, then calling the hashCode method on each of the two objects must produce the same integer result.（两个相等（equals）的对象的hashCode必须一致。）
> *   It is not required that if two objects are unequal according to the equals(java.lang.Object) method, then calling the hashCode method on each of the two objects must produce distinct integer results. However, the programmer should be aware that producing distinct integer results for unequal objects may improve the performance of hash tables.（不想等的对象的hashCode不必不同，但不同更好。）

针对最后一点，可以假设如下情境： 一系列数个对象返回的hashCode都是相等的，那么HashMap或其他Hash容器散列的时间复杂度接近于线性，因为需要逐个遍历一边。 在网上找到一个计算hashCode的较为合适的模式：通过加入两个质数成分，将一个对象的属性映射到不同的域上面，最后相加得到散列值。虽然这个计算方法中没有用到异或操作，但应该也是值得借鉴的一种写法。

```
@Override
public int hashCode() {
    int hash = 7;
    hash = 31 * hash + (int) id;
    hash = 31 * hash + (name == null ? 0 : name.hashCode());
    hash = 31 * hash + (email == null ? 0 : email.hashCode());
    return hash;
}

```

### putVal

![](https://oss.kherrisan.cn/Snipaste_2018-02-15_12-05-09.jpg) **如果有多个线程同时运行到上面代码截图的光标所在行，会出现put的值丢失的问题。**

1.  检查table是否时null或者capacity是否为0，如果是，resize，调整table，准备放东西进去了。
2.  检查散列的桶table\[(n-1)&hash\]是否有元素，如果没有，就创建一个节点，把值放进去，就结束了。
3.  散列冲突时，用变量e保存存放该key的位置。 3.1 如果桶中第一个节点的key和hash都一致，则只需要在后续步骤修改该节点的value。 3.2 如果桶中第一个节点是一个树节点（红黑树），调用putTreeVal函数存放键值。 3.3 否则，从第一个节点开始，沿着链表逐个遍历，找到hash和key都一致的链表中的某个节点，如果找不到，就存放在最后一个节点。如果走到头了发现这个链表过长，就会把这个链表变成一颗红黑树，即只有在链表尾部增加节点的时候才会检测是否需要treeify。
4.  对找到的或者确定新增的节点，设定其value。如果是更新而不是新增，就返回原来的value。

putVal的过程用流程图描述如下：（图片来源：[https://www.cnblogs.com/softidea/p/7261111.html](https://www.cnblogs.com/softidea/p/7261111.html)） [![](https://images2017.cnblogs.com/blog/280044/201707/280044-20170731003658755-1433505876.png)](https://images2017.cnblogs.com/blog/280044/201707/280044-20170731003658755-1433505876.png) 也就是说，经过多次putVal之后的HashMap应该是链表和红黑树并存的情况，画出来就是下面这种结构：（图片来源：[https://www.cnblogs.com/zhangyinhua/p/7698642.html](https://www.cnblogs.com/zhangyinhua/p/7698642.html)） [![](https://images2017.cnblogs.com/blog/999804/201710/999804-20171020102900959-842879038.png)](https://images2017.cnblogs.com/blog/999804/201710/999804-20171020102900959-842879038.png)

### resize

resize用于动态调整table的大小，是HashMap成员函数中代码行数最长的函数，虽然逻辑并不复杂，但是有很多细节需要仔细考虑。

```
final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table;
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        int oldThr = threshold;
        int newCap, newThr = 0;
        if (oldCap > 0) {
            if (oldCap >= MAXIMUM_CAPACITY) {
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                newThr = oldThr << 1; // double threshold
        }
        else if (oldThr > 0) // initial capacity was placed in threshold
            newCap = oldThr;
        else {               // zero initial threshold signifies using defaults
            newCap = DEFAULT_INITIAL_CAPACITY;
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
        if (newThr == 0) {
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
        threshold = newThr;
        @SuppressWarnings({"rawtypes","unchecked"})
            Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
        if (oldTab != null) {
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    if (e.next == null)
                        newTab[e.hash & (newCap - 1)] = e;
                    else if (e instanceof TreeNode)
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    else { // preserve order
                        Node<K,V> loHead = null, loTail = null;
                        Node<K,V> hiHead = null, hiTail = null;
                        Node<K,V> next;
                        do {
                            next = e.next;
                            if ((e.hash & oldCap) == 0) {
                                if (loTail == null)
                                    loHead = e;
                                else
                                    loTail.next = e;
                                loTail = e;
                            }
                            else {
                                if (hiTail == null)
                                    hiHead = e;
                                else
                                    hiTail.next = e;
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        if (loTail != null) {
                            loTail.next = null;
                            newTab[j] = loHead;
                        }
                        if (hiTail != null) {
                            hiTail.next = null;
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }

```

1.  根据当前的capacity、threshold的情况，调整新的capacity和threshold到一个合适的值。
2.  创建新的table。
3.  把原来table中的元素搬移到新的table中去，在搬移的过程中，就会出现这样的问题：原来有些元素是冲突的，但table扩容之后就不一定冲突了。 3.1 如果是链表，并且没有后继节点，即没有冲突的，就直接复制到新的table中去。 3.2 如果是树节点，调用split方法。 3.3 否则，就搬移整个链表。开始遍历。 3.3.1 把从该节点出发的链表拆分成两个链表，如果节点的hash超过原table的长度的，放在lo中，如果没有超过，放在hi中。 3.3.2 lo还放在table原来的位置，hi放在原来的位置+原table长度的位置。

在1.7的时候，map的扩容是采用在链表头部插入元素的方式，是倒序的，在多线程并发的时候可能会导致循环链表的出现，在1.8中，我没有找出可能会出现循环链表的情况。

### treeifyBin

如果一个桶中链表存放的元素过多，在冲突后进行线性查找显然需要花费较多的时间，因此把结构修改为树型结构可以提高搜索的效率。 ![](https://oss.kherrisan.cn/Snipaste_2018-02-15_12-56-26.jpg)

1.  检查table的capacity是否达到要求，也就是说如果table长度过短，桶中的链表是没有资格treeify的，在这种情况下，往往resize就能够使链表长度缩短。
2.  从散列到的节点的首节点开始，逐个将链表中的节点替换为树节点，设置好每个节点的prev和next。
3.  treeify。

### removeNode

![](https://oss.kherrisan.cn/Snipaste_2018-02-15_13-07-42.jpg)

1.  根据hash和key，找到对应的节点node。
2.  如果是树节点，调用removeTreeNode方法；如果是链表节点，从链表中删掉。

迭代器
---

除了与其他数据结构中同样重要的conmodificatinexception之外，还需要关注一下遍历的顺序。

### HashIterator

是KeyIterator、ValueIterator、EntryIterator的基类，但并没有实现Iterator的接口。KeyIterator、ValueIterator、EntryIterator的next方法都是基于HashIterator的nextNode实现的。 ![](https://oss.kherrisan.cn/Snipaste_2018-02-15_13-29-03.jpg) 在构造时进行迭代器的初始化工作，从table的0开始，找到第一个不为null的桶，作为第一个桶。

#### nextNode

![](https://oss.kherrisan.cn/402986213d9199094e5db333036c6532.png) 首先检查conModification，如果modCount不一致就立刻fail。如果当前桶的链表中还存在下一个元素，就返回下一个元素；否则返回table中下一个不为null的桶。 显然next的顺序和存放元素的顺序没有太大关系，但是散列到同一个桶中的元素的先后与被遍历到的先后顺序可能是一致的。

#### remove

调用HashMap的removeNode方法。

其他内部类
-----

### TreeNode

继承了LinkedHashMap.Entry类。为了尽可能的减少搜索的时间，使用的是红黑树。 ![](https://oss.kherrisan.cn/Snipaste_2018-02-15_13-23-42.jpg)

### KeySet、Values、EntrySet

都是基于对应的Iterator实现的。