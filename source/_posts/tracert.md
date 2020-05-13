---
title: TCP/IP实验 到指定目标的路由追踪（实现tracert功能）
categories:
  - TCP/IP
tags:
  - Python
  - scapy
  - TCP/IP
copyright: true
url: 277.html
id: 277
abbrlink: 652e246f
date: 2017-09-29 21:28:23
---

路由追踪指当访问一个远程的设备时，能够得到沿途的路由器的IP。这个功能已经由tracert（traceroute）程序实现了，我一来闲的没事，而来早就想做一些关于主机发现和路由追踪的小程序，因此就研究了一下。 使用python的scapy库进行数据包的收发，由于scapy已经实现了traceroute功能，更何况windows和linux都有tracert（traceroute）命令，但是我还是想从底层搞清楚原理，所有先用traceroute做追踪，同时使用wireshark抓包，研究一下包的结构和原理，再自己用scapy实现一下traceroute。 **注意：Win10 & Python2.7 环境下，使用pip安装scapy可能会遇到问题（global name xxx is not defined），建议直接clone github上的仓库，然后python setup.py install。** 使用我们学校jwc网站作为实验对象，所有实验都在seu内网进行（感觉内网变化小一些）。 先抓个包看看jwc网站ip地址是多少。其实应该是有更加简便的方法的，只是我不知道。而且tracert直接填主机名好像不行。

<!-- more -->

 ![](https://oss.kherrisan.cn/Snipaste_2017-09-29_22-12-19.png) 从wireshark中也可以看出tracert探测的模式：每个TTL发送三个ICMP报文，收到三个回复后再把TTL+1，再继续发送。 基于上述原理，可以开始尝试自己发送ICMP报文并实现tracert功能了。 注：由于国庆回家，网络环境发生了一些变化，我现在只能在家进行实验，因此每一条的结果肯定会和在宿舍进行追踪产生的结果不同。 下面先贴出我写的py程序：

```null
from scapy.all import *


def send_ICMP(ttl, dst):
    ans, unans = sr(IP(dst=dst, ttl=ttl) / ICMP(), timeout=8)
    if ans is not None and len(ans) is not 0:
        reply = ans[0]
        print "Hop:{} reach:{}".format(reply[0].ttl, reply[1].src)
        if reply[1].type is 11:
            return True
        else:
            print "Reach to the destination"
            return False
    else:
        return True


def tracert(dst):
    ttl = 0
    while send_ICMP(ttl, dst):
        ttl += 1
        if ttl &gt; 30:
            break


if __name__ == '__main__':
    tracert("jwc.seu.edu.cn")
    # traceroute("jwc.seu.edu.cn")

```

这是windows自带的tracert的输出结果。 ![](https://oss.kherrisan.cn/Snipaste_2017-10-01_20-47-17.png) 从图中可以看出，scapy的动作也是很有规律的，基本上符合发送两个ICMP报文，收到一个reply的模式，而且对同一个地址的两个ICMP之间相隔不到20ms。