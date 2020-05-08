---
title: JUC——CopyOnWriteArrayList
categories:
  - JUC
tags:
  - java
  - 并发
copyright: true
url: 468.html
id: 468
abbrlink: c1bdaf6f
date: 2018-02-11 14:08:44
---

ArrayList和LinkedList都不是线程安全的。这时候就有必要研究一下CopyOnWriteArrayList了，一个略小众的容器类。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-11_12-06-22.jpg) 光看这个类的原型好像还挺简单的。

属性

<!-- more -->

--

就两个属性：一把ReentrantLock（可重入锁），一个Object数组（violatile修饰）。 在多线程的情景下，由于每个线程都有一个自己的工作内存（类似于高速缓存），在多个线程访问同一个变量的时候，可能会出现缓存不一致的问题，如线程1和线程2都把变量a读入到自己的工作内存中，线程1对a执行自增，线程2对a执行自增，这时候本来应该自增两次的a由于缓存不一致只自增了一次。 violatile关键字保证了不同线程对该变量的可见性，即一个线程修改了这个值，其他线程能够立即可见。 ReentrantLock：同一个线程可以多次获取一把锁，但是也需要释放多次，全部释放之后其他线程才能获得这把锁。因为还没有深入研究他的源码，所以这里就一笔带过了。

方法
--

### 构造函数

由于构造函数不太可能会受到多线程环境的影响，因此CopyOnWriteArrayList的构造函数和ArrayList的构造函数差不多，没有针对多线程的特殊处理。

### 所有只读操作

由于只读操作不会修改数组中的元素，因此也没有必要针对多线程进行特殊处理。 CopyOnWriteArrayList提供的只读操作包括：

*   size()
*   isEmpty()
*   contains(Object)
*   indexOf(Object)
*   toArray()
*   get(index)

### set

光看CopyOnWriteArrayList的实现，好像也就比ArrayList多了一个获取锁和释放锁的步骤。 下图是CopyOnWriteArrayList的set。 ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-11_13-15-44.jpg) 区别： 0\. 先获得锁，在finally中释放锁。 1. CopyOnWriteArrayList没有对index做检查，可能会出现数组越界。 2. CopyOnWriteArrayList是先拷贝了一个副本，然后在副本上修改，最后setArray设置对象的属性。这么做的原因可能是因为violetile对于引用类型只能使得引用指向不同的对象时其他线程可见，如果引用的对象的某个属性变了，或者引用的数组的某个元素变了，是不会触发对其他线程中该引用的变化可见的（和final的概念有点类似）。所以为了修改数组元素之后对其他线程变化可见，只能修改引用的数组。 这就是CopyOnWrite的名字的由来吧。 但这样，开发者可能就会担心效率问题了，毕竟每次简单的修改都要对数组拷贝一遍。

```null
package collection;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Created by intellij IDEA.But customed by hand of Dokyme.
 *
 * @author dokym
 * @date 2018/2/11-12:00
 * Description:
 */
public class LearnCopyOnWriteArrayList {
    private List<String> copyOnWriteList = new CopyOnWriteArrayList<>();
    private List<String> arrayList = new ArrayList<>();

    private static final int testCount = 1000000;

    public static void main(String[] args) {
        new LearnCopyOnWriteArrayList().run();
    }

    public void run() {
        testCopyOnWriteList();
        testArrayList();
    }

    public void testCopyOnWriteList() {
        System.out.println("testCopyOnWriteList");
        long start, end;
        start = System.currentTimeMillis();
        for (int i = 0; i < testCount; i++) {
            copyOnWriteList.add("" + i);
        }
        end = System.currentTimeMillis();
        System.out.println("Timespan: " + (end - start));
    }

    public void testArrayList() {
        System.out.println("testArrayList");
        long start, end;
        start = System.currentTimeMillis();
        for (int i = 0; i < testCount; i++) {
            arrayList.add("" + i);
        }
        end = System.currentTimeMillis();
        System.out.println("Timespan: " + (end - start));
    }
}

```

运行结果如下： ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-11_13-37-59.jpg) 类似的写操作还有：

*   add(index,object)及其他addXXX，虽然也是使用的数组，但是和ArrayList相比，逻辑相当直接，没有采用1.5倍扩容的策略。
*   remove(index)及其他removeXXX

以remove(index)为例，详细分析一下他的代码： ![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-11_14-14-10.jpg) 首先得到一个snapshot（其实就是记录一下引用，称不上快照），接着寻找对应需要被删除的那个object的index，再调用下一个remove函数。 下一个remove函数首先加锁，接着判断快照和当前的引用是不是同一个对象，如果不是，说明有其他线程在indexOf的过程中修改了数组，进入findIndex语句块。 findIndex语句块中首先在current中找有没有和要删除的object相同的，并且这个object的位置已经发生了变化的。如果在current中找到了，就删掉他。如果没有找到，下面有三个if。 如果current的长度比index小了，由于current已经被全部遍历过了，没有object，说明object已经在其他线程中被删掉了，那就直接返回。 如果current的长度比index大，index之前的已经全都找过了，没有object，那再看index处是不是object，如果是，就直接删除。 最后再在current中调用indexOf函数找一遍object，删掉它。 这段代码考虑了object在两个版本的数组中位置有没有发生变化，是否因为其他线程的修改导致object消失等因素。 做类似处理的还有addIfAbsent，其实只要让加锁的范围大一些就不需要写这么复杂的代码了，可能还是处于性能的考虑吧。

### forEach

forEach没有实现CopyOnWrite，也就是说通过forEach修改某个元素的值在其他线程是不可见的。当然forEach只能得到每个元素的引用，但是不能修改引用。 **实际上，通过get方法得到某个元素，然后修改那个元素的属性，这样的行为，对于其他线程也是不可见的。可以说，这个可见性不应该是COWArrayList所应该负责的。**

迭代器
---

不同于ArrayList和迭代器类，COWIterator是一个静态内部类，也就是不需要外部类的实例存在也可以实例化的内部类。 虽然该迭代器的形式和ArrayList的迭代器有所区别，但它不是线程安全的。

### 属性

因为是静态内部类，无法接触外部的实例变量，因此有一个COWArrayList的snapshot（一个Object数组）。 此外还有一个cursor记录下一个元素的index。 构造函数负责初始化snapshot。

### 方法

只支持hasNext,hasPrevious,next,previous,nextIndex,previousIndex,forEachRemaining。修改数组元素的方法在这个层面一律不支持。 由于不支持修改，也就没必要实现checkConmodification了。 **实际上COWArrayList也并没有记录modCount。**

其他内部类
-----

COWSubList，作为COWArrayList的视图，也是静态内部类，但是手都持有了以恶搞COWArrayList的实例变量，修改时调用COWArrayList的方法进行修改，如果说COWArrayList是线程安全的话，SubList也应该是安全的。