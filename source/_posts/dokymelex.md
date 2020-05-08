---
title: 自制Lex程序总结
categories:
  - 编译原理
tags:
  - java
  - 编译原理
copyright: true
url: 389.html
id: 389
abbrlink: 4fe1d90d
date: 2017-12-22 00:12:11
---

编译原理实验一提供了三个层面的选择，第一层是最简单的，简单到我都忘记了是什么要求了；第二层是用程序实现基于DFA的词法分析器；第三层有些复杂，模仿Lex的功能，设计一个能够生成词法分析器源代码的程序，即“编译器的编译器”。我不自量力地选了第三层。 其实，第三次说难也不难，说简单的话倒真的到处都是坑。我停停写写，大概写了两三周，更加深刻地体会都自己写业务代码写的飞快，但是一旦碰到有些技术含量的代码就要开始面向Google编程的事实。 现在，程序写的差不多了，以及传到了Github上，还发了两个release版本，先贴上链接。 [DokymeLex](https://github.com/Dokyme/DokymeLex) 我作此文的目的是，对于程序的结构，设计和实现的思路，做一个记录和总结，也包括一些反思。

<!-- more -->

实现语言
----

我选择了Java，我感觉我的同学基本上都是用java的，极少数会用C++或者C完成本次实验，用Python或者其他脚本语言的估计也不多。选Java不选C++的原因是写java程序的效率相对来说更高一些，对于变量和对象的初始化和传递的把握更加的轻松。同时，处于实验的要求，即便尽量不使用第三方库，java本身提供的标准库比C++丰富的多。比如容器类、字符串处理、IO操作类。针对每个具体的问题，往往能够很轻松地找到多种解决方案，然后进行权衡选择。不像C++，类库不丰富，解决方案较为单一，弹性不足（也有可能是我孤陋寡闻了）。 当然，java作为一种纯面向对象的语言，和C++相比，最核心的代码会更多一些，比如类的声明、成员变量的定义等。尤其是在生成程序源代码的时候，需要加一些额外的代码来保证程序可以通过编译，但是这是可以接受的。以前听有人说，人的思维是面向过程的，面向对象的思维是反人类的，是牺牲程序可读性的，我倒是觉得在不采用常见的设计模式的情况下，面向对象的代码反而更加清晰。 虽然，实验嘛，避嫌，最好少用现成的类库。但是我还是偷偷找了一个用于辅助和图有关计算的库，还用了gradle来管理包。当时找到这个库的主要原因是了解到这个库可以将图可视化显示出来，想着如果能够把DFA中状态转移的过程可视化出来，一边显示，一边做词法分析，就厉害了。但是实际上几百个状态，显示到窗口中，根本没法看。。。但是图的结构还是借助了这个库，因为不想改代码了，而且自己实现图，又要写很长时间的代码，调很长时间的bug。 就算这是实验，也不能啥都自己实现吧，像HashSet、HashMap这些，我要是自己实现的话肯定完成不了。 此外还使用了Apache.commons.cli库来辅助实现命令行参数解析的功能。

程序结构
----

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2017-12-21_22-58-47.png) 类的功能和名字差不多，应该挺容易理解的吧。

重点
--

诸如文件解析、命令行参数解析这样的功能我就不详细介绍了。主要讲几个技术含量比较高的，同时也是词法分析中较为核心的部分。

### 由RE构造NFA

```null
//预处理。
        Logger.debug("Raw input:" + re.re);
        re = prePreProcessor(re);
        Logger.debug("Added concat symbol and transform range format to or:" + re.re);
        re = infix2suffix(re);
        Logger.debug("Transform infix to suffix:" + re.re);

        //Tomphonson算法构造NFA。
        Stack<NoDefiniteAutomation> stack = new Stack<>();
        char[] characters = re.re.toCharArray();
        boolean converting = false;
        for (char cur : characters) {
            switch (cur) {
                case '~': {
                    if (converting) {
                        stack.add(new NoDefiniteAutomation(cur));
                        converting = false;
                        break;
                    }
                    NoDefiniteAutomation last = stack.pop();
                    NoDefiniteAutomation lastTwo = stack.pop();
                    stack.push(lastTwo.concat(last));
                    break;
                }
                case '+': {
                    if (converting) {
                        stack.add(new NoDefiniteAutomation(cur));
                        converting = false;
                        break;
                    }
                    NoDefiniteAutomation last = stack.pop();
                    State newStart = new State();
                    State newEnd = new State();
                    last.graph.addEdge(new Transition(), newStart, last.start, EdgeType.DIRECTED);
                    last.graph.addEdge(new Transition(), last.end, newEnd, EdgeType.DIRECTED);
                    last.graph.addEdge(new Transition(), newEnd, newStart, EdgeType.DIRECTED);
                    last.start = newStart;
                    last.end = newEnd;
                    stack.push(last);
                    break;
                }
                case '*': {
                    if (converting) {
                        stack.add(new NoDefiniteAutomation(cur));
                        converting = false;
                        break;
                    }
                    NoDefiniteAutomation last = stack.pop();
                    State newStart = new State();
                    State newEnd = new State();
                    last.graph.addEdge(new Transition(), newStart, newEnd, EdgeType.DIRECTED);
                    last.graph.addEdge(new Transition(), newStart, last.start, EdgeType.DIRECTED);
                    last.graph.addEdge(new Transition(), last.end, newEnd, EdgeType.DIRECTED);
                    last.graph.addEdge(new Transition(), last.end, last.start, EdgeType.DIRECTED);
                    last.start = newStart;
                    last.end = newEnd;
                    stack.push(last);
                    break;
                }
                case '|': {
                    if (converting) {
                        stack.add(new NoDefiniteAutomation(cur));
                        converting = false;
                        break;
                    }
                    NoDefiniteAutomation last = stack.pop();
                    NoDefiniteAutomation lastTwo = stack.pop();
                    stack.push(last.parellize(lastTwo));
                    break;
                }
                case '\\':
                    converting = true;
                    break;
                default:
                    if (converting && ConvertingMap.keySet().contains("\\" + cur)) {
                        stack.add(new NoDefiniteAutomation(ConvertingMap.get("\\" + cur)));
                        converting = false;
                        break;
                    } else if (converting) {
                        stack.add(new NoDefiniteAutomation(cur));
                        converting = false;
                        break;
                    } else {
                        stack.add(new NoDefiniteAutomation(cur));
                    }
                    break;
            }
        }
        if (stack.size() != 1) {
            Logger.error("The final element left in stack is not only one");
            return null;
        }
        NoDefiniteAutomation nfa = stack.pop();
        if (re.action != null) {
            nfa.end.tag = re.action;
        }
        nfa.re = re;
        nfa.end.precedence = re.precedence;
        return nfa;

```

代码很长，主要有三个部分：

1.  预处理：添加连接符~，把\[a-z\]的形式转换为(a|b|c|...|z)的形式。
2.  中缀转后缀。
3.  根据后缀表达式，按照Tomphson算法，生成NFA。

这段代码把1和2的过程浓缩为了两个函数，主要描述了3的实现。一个长长的switch语句，根据下一个符号，选择不同的策略，把栈中的小NFA转换成大的NFA，然后再压入栈中。每个case块都要先判断是否是转义过的，即上一个字符是不是反斜杠。 NFA的串联、并联方法的定义，我也是能放在NFA类中就放在NFA中的。

### 由多个NFA构造DFA

```null
private static DefiniteAutomation build(NoDefiniteAutomation nfa, Set<State> allEndState) {
        DefiniteAutomation dfa = new DefiniteAutomation();
        dfa.allTrans = nfa.getAllTransitionTag();
        dfa.nfa = nfa;
        dfa.table = new ArrayList<>();
        dfa.graph = new DirectedSparseMultigraph<>();
        Set<State> stateSet = new HashSet<>();
        stateSet.add(nfa.start);
        stateSet = dfa.getEpsilonClosure(stateSet);
        dfa.table.add(dfa.new TableEntry(stateSet));

        for (int i = 0; i < dfa.table.size(); i++) {
            TableEntry entry = dfa.table.get(i);
            for (Character transChar : dfa.allTrans) {
                Transition trans = new Transition(transChar);
                Set<State> extendedStates = dfa.getStateExtension(entry.nfaStates, trans);
                Set<State> epslnExtendedStates = dfa.getEpsilonClosure(extendedStates);
                TableEntry potentialEntry = dfa.new TableEntry(epslnExtendedStates);
                if (!epslnExtendedStates.isEmpty()) {
                    int existedEntryIndex = dfa.table.indexOf(potentialEntry);
                    if (existedEntryIndex == -1) {
                        dfa.table.add(potentialEntry);
                        entry.transitions.put(trans, dfa.table.size() - 1);
                        Logger.debug("Found new dfa state " + dfa.table.size());
                    } else {
                        entry.transitions.put(trans, existedEntryIndex);
                    }
                }
            }
        }

        State.resetId();
        List<State> dfaStates = new ArrayList<>();
        for (int i = 0; i < dfa.table.size(); i++) {
            dfaStates.add(new State());
        }

        Set<State> newEndStates = new HashSet<>();
        for (int i = 0; i < dfa.table.size(); i++) {
            boolean isEndState = false;
            TableEntry entry = dfa.table.get(i);
            for (State nfaEndState : allEndState) {
                if (entry.nfaStates.contains(nfaEndState) && (dfaStates.get(i).precedence == -1 || dfaStates.get(i).precedence > nfaEndState.precedence)) {
                    dfaStates.get(i).tag = nfaEndState.tag;
                    dfaStates.get(i).precedence = nfaEndState.precedence;
                    isEndState = true;
                }
            }
            if (isEndState) {
                newEndStates.add(dfaStates.get(i));
            }
            for (Transition trans : entry.transitions.keySet()) {
                dfa.graph.addEdge(new Transition(trans.tag), dfaStates.get(i), dfaStates.get(entry.transitions.get(trans)));
            }
        }

        dfa.start = dfaStates.get(0);
        dfa.endStates = newEndStates;
        return dfa;
    }

```

由多个NFA转成DFA，采取的是在表格驱动的基础上，消除~边，并构造子集。 我想要来讨论一下这个函数中所用到的容器类。

1.  驱动表格，使用的是 `ArrayList<TableEntry>`，TableEntry是一个内部类。表格中的项肯定要保证有序，而且变长，如果用java原生数组的话很难预测需要开辟多大的空间。**注意**：对某个DFA状态，做子集构造、并求得epilison闭包之后，需要判断这个状态是不是已经求得的DFA状态，这里需要一个查找，我直接使用的indexOf方法，并且重写了TableEntry的equals方法。
    
2.  表格项TableEntry，既要记录其中包含的NFA状态号，又要记录每个项通过每个转换、做子集构造、eplision闭包后的状态。记录NFA状态号，我采用的是`HashSet`，不需要保序，只要集合，而且判断相等的话应该效率不差。各个符号转义对应的状态，我使用了`HashMap<Transition, Integer>`，Transition相当于一个字符，Integer标记了转移到的列表项的序号，将来就是DFA的状态号。字符和序号是一一对应的，看似用HashMap没什么问题。但是我觉得这个问题又要归结到为什么字符转换要用Transition，而不是char或者Character。因为我采用了现成库中的图的实现，而它要求每条边的类型的hashcode不能相同，即每条边不能相同，显然我用char或者Character肯定是不行的，所以就只能包一个类了。但是一个列表项里不会出现重复的字符转移，所以理论上这里用char也是可以的。但是用char和用transition差别应该只在存储空间不同，效率上的话，用transition也就是多调用一次hashcode方法而已。而整张表transition最多有26+26+10+一些符号，不超过80个，我觉得问题不大。
    
3.  运行过程中发现，在某些构造某些DFA状态的时候，花费时间很长。这个时间长可能有两方面原因，一是子集构造的时间较长，epilison边较多，二是判断子集构造完之后的状态是不是已知的状态，查找花费了较长的时间。后者，由于indexof是依次比较，对每个成员调用一次equals，因此把equals的逻辑简化应该可以节约一点时间。我的代码中，TableEntry的equals等价于HashSet的equals，又等价于其中每一个State的equals，State就是一个整数，并且是全局唯一的整数。试问：能不能找到一个HashSet的摘要变量？求和显然不行，直接相连得字符串的话，需要保证两个相同的集合中，把所有元素取出来，得到的元素的顺序是相同的，这样字符串比较才能够确保不漏判。如果顺序不一样，那就要排个序了。以下是HashSet的get和put的实现：
    

![](https://kherrisanbucketone.oss-cn-shanghai.aliyuncs.com/Snipaste_2017-12-21_23-53-34.png) 我觉得问题的关键在于indexFor的冲突的特性。 不过我在网上找到的，有人说，程序就不应该依赖HashSet的顺序。emmmmm，也就是说要排个序？但这样的话，每次子集构造出来的HashSet就都要排序了，感觉工作量很大的样子。**想到这里，要不干脆全部把HashSet换成有序的LinkedList结构？反正没有很多按索引引用的代码!** set还有一种官方实现叫TreeSet，还自带排序功能，今天太晚了，有空我去了解一下。 (忽然有一种开窍的感觉，还真是第一次真正地把数据结构知识应用到项目实践中分析问题。)

难点
--

未完待续