---
title: Typescript 接口
categories:
  - Typescript
copyright: true
url: 163.html
id: 163
abbrlink: d016d80b
date: 2017-07-13 10:40:41
tags:
---

```null
function printLabel(labelledObj: { abel: string }) {
  console.log(labelledObj.abel);
}

let myObj={size:10,abel:"size 10 object"};
printLabel(myObj);

interface LabelledValue{
    label:string;
}

function printLabel_2(labelledObj:LabelledValue){
    console.log(labelledObj.label);
}

let myObj_2={size:10,label:"Size 10 Object"};
printLabel_2(myObj_2);

interface SquareConfig{
    color?:string,
    width?:number
}

function createSquare(config:SquareConfig):{color:string,area:number}{
    let newSquare={color:"White",area:100};
    if(config.color){
        newSquare.color=config.color;
    }
    if(config.width){
        newSquare.area=config.width*config.width;
    }
    return newSquare;
}

let mySquare=createSquare({color:"black"});

interface Point{
    readonly x:number;
    readonly y:number;
}

let p1:Point={x:10,y:20}
// p1.x=5;

let a:number[]=[1,2,3];
let ro:ReadonlyArray<number>=a;
a=ro as number[];

let mySquare_2=createSquare({colorr:"red",width:100} as SquareConfig);

interface SearchFunc{
    (source:string,subString:string):boolean;
}

let mySearch:SearchFunc;
mySearch=function(source:string,subString:string){
    let result=source.search(subString);
    return result>-1;
}

mySearch=function(src,sub){
    let result=src.search(sub);
    return result>-1;
}

interface StringArray{
    [index:number]:string,
}

let myArray:StringArray;
myArray=["Bob","Fred"];

let myStr:string=myArray[0];

interface NumberDictionary{
    [index:string]:number;
    length:number;
    // name:string;
}

interface ClockInterface{
    currentTime:Date;
    setTime(d:Date);
}

class Clock implements ClockInterface{
    currentTime:Date;
    constructor(h:number,m:number){}
    setTime(d:Date){
        this.currentTime=d;
    }
}

interface ReadonlyStringArray{
    readonly [index:number]:string;
}

let myArray_2:ReadonlyStringArray=["Alice","Bob"];
// myArray_2[0]="Mallory"

interface Shape{
    color:string;
}

interface Square extends Shape{
    sideLength:number;
}

let square=<Square>{};
square.color="blue";
square.sideLength=10;

interface Counter{
    (start:number):string;
    interval:number;
    reset();
}

function getCounter():Counter{
    let counter=<Counter>function(start:number){}; //function 被转型为实现Counter接口的一个对象。
    counter.interval=123;
    counter.reset=function(){};
    return counter;
}

let c=getCounter();
c(10);
c.reset();
c.interval=0.5;

class Control{
    private state:any;
}

interface SelectabelControl extends Control{
    select():void;
}

class Button extends Control{
    select(){}
}

```

ts中，一个接口可以包含如下内容：

### 属性

包括基本类型的和类类型的，可以通过private等关键字修饰访问权限，可以通过readonly修饰可变性。从这个方面来开，ts中的接口和java中的接口还是类似的。

### 方法

包括匿名的和非匿名的。包含匿名函数的接口可以当成一个函数使用，也就是说这里的接口不再是只能由class实现的东西了，一个函数也可以实现一个接口。从动态的角度看，函数本身也是一个对象。函数可以转型成一个实现了接口的对象。

### 索引

包括数字索引和字符串索引，可以构件数组和字典的形式。

### 实例化

可以由对象进行实例化，也可以由函数实例化。

### 可见性，可访问性

这里对可见性讲的非常的粗糙，应该在后面的章节还会提到。

### 继承

接口可以继承接口，也可以继承类。