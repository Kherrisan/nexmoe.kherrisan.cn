---
title: Java Collection——ArrayList
categories:
  - Java Collection
tags:
  - java
  - 数据结构
copyright: true
url: 450.html
id: 450
date: 2018-02-09 18:18:05
---

```null
public class ArrayList<E> extends AbstractList<E> 
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
{}

```

<!-- more -->

ArrayList继承了AbstractList，实现了List、RandomAccess、Cloneable、Serializable接口。 RandomAccess接口定义里没有函数，他只是一个标记。如果一个实现了List接口的类支持快速的随机访问（一般是常数时间的），那就要用实现这个接口。或者说如果

```null
for (int i=0, n=list.size(); i &lt; n; i++)
    list.get(i);

```

比

```null
for (Iterator i=list.iterator(); i.hasNext(); )
    i.next();

```

快，那么就要实现该接口。对于使用该类的开发人员来说，在需要遍历一个List的时候，可以通过instanceOf判断是不是RandomAccess，如果是的话，用`get(i)`遍历更快，如果不是，用迭代器`next()`遍历更快。 ArrayList类似于C++中的vector，表示在内存中顺序存放的一组元素组成的数组。

属性
--

比较重要的属性有：

1.  Object\[\] elementDat：实际存放数组元素的数组。
2.  DEFAULT_CAPACITY：默认的数组大小。
3.  size：数组中实际存放的元素个数（不一定等于数组大小）。

方法
--

有三个构造函数，如果在构造函数中注明存放的元素个数，就会new一个这么大的数组；如果不注明元素个数，那么就不new数组，而是直接用一个静态空数组来表示存放内容；如果在构造函数中传入另一个collection对象，则会把所有的那个collection对象中的所有元素拷贝一份，作为本对象的存放内容。 常用的几个方法有：

### set

随机修改数组元素，只需要常数时间。

### get

随机访问数组元素，只需要常数时间。

### add

添加一个元素，可以以null为参数。

#### add

如果在数组末尾添加元素，只需要常数时间，如果是在数组中部插入新元素，需要让插入位置以后的所有元素都向后挪动，所以就需要线性时间了。 在数组的末尾或者指定位置添加一个元素，在添加之前会先检查容量是否满足需求，即capacity是不是比size大1，如果放不下，就要考虑扩容到指定长度的问题了。

#### ensureCapacityInternal

具体而言，判断的逻辑是这样的：先手动指定一个数组最小长度（比如，在add之前，指定这个数组最小长度为size+1），看这个数组是不是默认大小的空数组，如果是的话，取指定数组长度和10（默认空间大小）的较大值；如果不是默认大小的空数组，就直接取指定的数组长度。这个值作为新的capacity，如果新的capacity比当前的capacity大的话，就要扩大数组了。但并不是直接扩大到新的capacity，而是看当前的capacity的1.5倍和新的capacity谁大，取较大的那个值作为最终扩容的数组长度。 同时扩容的时候会检查扩容后的数组长度是不是比最大长度大（MAX\_ARRAY\_SIZE），如果是，检查指定的数组长度是不是溢出了，如果是，就抛出异常，如果没有溢出并且指定的数组长度比MAX\_ARRAY\_SIZE，就取Integer.MAX\_VALUE作为新的数组长度，否则就取MAX\_ARRAY\_SIZE作为新的数组长度。也就是说在数组长度较大的时候，长度要么是Integer.MAX\_VALUE，要么是MAX\_ARRAY\_SIZE。

```null
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}

```

比如：如果我调用默认构造函数，那得到的数组的capacity=0，size=0，如果我再add一次，那么我需要的size应该是1，但是由于当前数组是默认空数组，情况比较特殊，新的capacity是10，10>capacity，要扩容，capacity=0，1.5倍还是0，显然是10比较大，所以最终的数组长度就为1，并且把新的元素加add到最后一个。 如果现在有个ArrayList，size=20，capacity=32，add一个新的元素，需要的最小数组长度应该是20+1=21，21比32小，那就不用扩容了。 如果有个ArrayList，size=20，capacity=20，add一个新的元素，需要的最小数组长度应该是21，21>capacity，要扩容，扩容到30。

#### addAll

同样要检查数组长度，有必要的话需要扩容，既可以在数组末尾添加元素，也可以在某个位置添加，显然需要线性时间，因为需要深拷贝。 **添加元素的顺序即为参数Collection的迭代器的顺序。**

### remove

删除某个位置的元素，或者删除数组中的某个对象。二者都需要线性时间。可以以null为参数。 remove(Object)会通过equals从数组中找到第一个和参数相等的元素，然后移除他。 值得注意的是，remove中并没有数组缩容的逻辑，也就是说ArrayList只会变大不会变小。这点值得再继续研究一下。 写了一小段代码来测试一下ArrayList扩容的原理，因为elementData是protected的，所以要用反射才能获取到capacity。

```null
package collection;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by intellij IDEA.But customed by hand of Dokyme.
 *
 * @author dokym
 * @date 2018/2/9-13:07
 * Description:
 */
public class LearnArrayList {
    private static Class arrayListClass;
    private static Field elementDataField;

    public static void main(String[] args) {
        try {
            arrayListClass = Class.forName("java.util.ArrayList");
            elementDataField = arrayListClass.getDeclaredField("elementData");
            elementDataField.setAccessible(true);
            List<ListElement> elements = new ArrayList<>();
            for (int i = 0; i < 100 ; i++){
                elements.add(new ListElement("Dokyme"));
                printListCapacity(elements);
            }
            for (int i = 0; i < 80; i++) {
                elements.remove(elements.size() - 1);
                printListCapacity(elements);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }

    }

    private static void printListCapacity(List<ListElement> listElements) throws Exception {
        System.out.println("Capacity is " + ((Object[]) elementDataField.get(listElements)).length);
    }
}

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-09_15-26-44.jpg) 在测试的的过程中的确没有发现缩容的现象。

#### batchRemove(Collection)

能够批量删除本数组中所有出现在参数中的元素。

### indexOf

查询一次需要线性的时间复杂度，可以以null为参数。

### forEach、removeIf、replaceAll

为函数式编程提供了支持。

### sort

调用Arrays.sort方法进行排序。排序算法今天暂时先不研究了。。。

迭代器
---

ArrayList有两个迭代器的内部类，一个是Itr，一个是ListItr，后者比前者的方法多一些。 Itr实现了next()、hasNext()、remove()、forEachRemaining()这些方法。 ListItr在Itr的基础上，多了add()、set()、previous()、xxxIndex()等方法。 **ArrayList的方法中没有出现对并发访问的控制，基本上没有见过哪里抛出了`ConcurrentModificationException`，但是在迭代器的方法中却经常见到抛出这个异常的代码。 会导致这个异常的最经典的场景就是在一个`for`循环中一边用迭代器遍历数组（或者用增强for循环）一边给数组添加或删除元素。**

### ConcurrentModificationException

ArrayList在add和remove的时候会自增一个modCount，这个modCount属性记录的是本对象的结构被修改的次数。迭代器也有一个相同功能的expectedModCount，在构造迭代器的时候，expectedModCount和modCount的值是相等的，一旦在循环体中调用了ArrayList的remove(index)或remove(Object)方法，使数组结构发生了变化，两个modCount就不一样了。 next函数的第一行就是检查两个modCount是否一致，不一致就抛出异常了。

```null
    @SuppressWarnings("unchecked")
    public E next() {
        checkForComodification();
        int i = cursor;
        if (i >= size)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            throw new ConcurrentModificationException();
        cursor = i + 1;
        return (E) elementData[lastRet = i];
    }

    public boolean hasNext() {
        return cursor != size;
    }

    public void remove() {
        if (lastRet < 0)
            throw new IllegalStateException();
        checkForComodification();

        try {
            ArrayList.this.remove(lastRet);
            cursor = lastRet;
            lastRet = -1;
            expectedModCount = modCount;
        } catch (IndexOutOfBoundsException ex) {
            throw new ConcurrentModificationException();
        }
    }

    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }

```

以上是java中ArrayList的迭代器Itr的几个函数的定义，其中hasNext就可能因为一边遍历一边修改数组导致返回值出现错误。 但也并不是就不能一边遍历一边添加删除元素了，Itr提供了remove方法，用于删除迭代器当前指向的元素，这个remove方法实际上是调用了ArrayList的remove方法，并修改expectedModCount到与modCount一致的状态。 当然，Itr的remove方法是要有条件的，就是在remove之前至少要有一次next方法，否则lastRet无法得到正确的值，使得迭代器删掉了这个元素之后不知道该指向哪个元素了。 当然，一边遍历一边添加删除数组还有另一种写法，就是依靠ArrayList的remove函数和传统的for循环，不使用增强的for循环或迭代器。 又写了一段代码测试remove的特性。 10个元素，分别是0-9，四次不同的循环，分别删除3，4，5，6。

```null
package collection;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Created by intellij IDEA.But customed by hand of Dokyme.
 *
 * @author dokym
 * @date 2018/2/9-13:07
 * Description:
 */
public class LearnArrayList {

    private static void testTraditionalForLoop(List<ListElement> listElements) {
        try {
            //iterate using traditional for loop
            for (int i = 0; i < listElements.size(); i++) {
                ListElement cursor = listElements.get(i);
                if (cursor.getName().equals("3")) {
                    listElements.remove(i);
                }
            }
            System.out.println("testTraditionalForLoop");
            System.out.println(listElements);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void testForEachLoop(List<ListElement> listElements) {
        try {
            //iterator using foreach loop
            for (ListElement cursor : listElements) {
                if (cursor.getName().equals("4")) {
                    listElements.remove(cursor);
                }
            }
            System.out.println("testForEachLoop");
            System.out.println(listElements);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void testIteratorRemove(List<ListElement> listElements) {
        try {
            //iterate using iterator,remove using iterator.remove
            Iterator<ListElement> iterator = listElements.iterator();
            while (iterator.hasNext()) {
                ListElement current = iterator.next();
                if (current.getName().equals("5")) {
                    iterator.remove();
                }
            }
            System.out.println("testIteratorRemove");
            System.out.println(listElements);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void testIteratorRemove2(List<ListElement> listElements) {
        try {
            //iterate using iterator,remove using ArrayList.remove
            Iterator<ListElement> iterator = listElements.iterator();
            while (iterator.hasNext()) {
                ListElement current = iterator.next();
                if (current.getName().equals("6")) {
                    listElements.remove(current);
                }
            }
            System.out.println("testIteratorRemove2");
            System.out.println(listElements);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        try {
            List<ListElement> listElements = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                listElements.add(new ListElement("" + i));
            }
            testTraditionalForLoop(listElements);
            testForEachLoop(listElements);
            testIteratorRemove(listElements);
            testIteratorRemove2(listElements);

        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }

    }
}

```

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2018-02-09_20-05-15-1.jpg) 实验的结果是，使用传统for循环+ArrayList.remove，删除和遍历都没有问题；使用增强for循环和ArrayList.remove，删除成功，但是抛出了ConcurrentModificationException；使用迭代器循环+迭代器remove，遍历成功并且正确删除了5；使用迭代器循环+ArrayList.remove，抛出了ConcurrentModificationException。

### ListItr

继承了Itr，并提过了几个额外的方法:previous,set,add。这个add是可以配合迭代器对象在遍历过程中添加元素的。但是同样有前提条件：lastRet必须有效，即在add之前必须调用一次next。

### lastRet

这个变量很有意思，cursor代表写一个元素的index，那么上一个不就是cursor-1吗，为什么还要专门找一个变量来表示上一个变量的index呢？？？ 注意：Itr还是ListItr，都可以通过ArrayList的方法获得。

其他内部类
-----

### SubList

代表ArrayList的一部分，奇怪的是，没有继承ArrayList，而是直接继承AbstractList并实现了RandomAccess。概念类似于数据库中的视图，即把ArrayList中的内容截取一段，ArrayList和SubList中的数组元素实际上是相同的。任何一处修改，另一处也会更随着变化。 提供的数个方法和ArrayList相差无几（set、get、size、add、remove、addAll），区别在于要比ArrayList的对应方法多一步：检查comidification。 SubList也提供了自己的迭代器，是一个继承了ListIterator的匿名内部类。

### ArrayListSplitter

> Spliterator是一个可分割迭代器(splitable iterator)，可以和iterator顺序遍历迭代器一起看。jdk1.8发布后，对于并行处理的能力大大增强，Spliterator就是为了并行遍历元素而设计的一个迭代器，jdk1.8中的集合框架中的数据结构都默认实现了spliterator。

jdk8的新特性，暂不研究。。。