---
title: Typescript 类型和变量
categories:
  - Typescript
tags:
  - Typescript
  - 前端
copyright: true
url: 156.html
id: 156
abbrlink: 6eb1636b
date: 2017-07-11 23:01:04
---

因为我js没有认真学，所以从typescript学起的话要从基础的一点一点来了。

<!-- more -->

基本类型
====

```null
let Done: boolean = false;

let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0x744;

let color: string = "blue";
color = "red";

let fullName: string = `Bob Bobbington`;
let age: number = 37;
let sentence: string = `Hello,my name is $(fullname).
I'll be $(age+1) years old next month.`;

let list: number[] = [1, 2, 3];
let list_2: Array = [1, 2, 3];

let x: [string, number];
x = ["helloworld", 10];

console.log(x[0].substr(1));
// console.log(x[1].substr(1));

x[3] = "world";
console.log(x[3].toString());

enum Color {
  Red,
  Green,
  Yello
}
let c: Color = Color.Green;
console.log(Color[1]);

let notSure:any=4;
notSure="maybe a string instead."
notSure=false;

function weather():void{
  alert("This is an alert.");
}

let unusable:void=undefined;

let u:undefined=undefined;
let n:null=null;

function error(message:string):never{
  throw new Error(message);
}

let someValue:any="this is a string.";
let strLength:number=(someValue).length;

let strLength_2:number=(someValue as string).length;

```

和其他解释型语言类似，基本类型主要有：boolean，number，string。数组的话有：Array和string\[\]。还有枚举类enum。 从我个人角度看，比较陌生的有：any，void，undefined，null，never。 **any**意思是不规定类型，常常用于使用第三方库的情况。一个any类型的对象既可以引用number，也可以引用string。在python和js中任意一个变量都可以像这样操作，但是在强类型的ts中就不行了，所以有js这种东西。 另外，any类型和Object类型（万物的父类）有所区别，any类型自带的一些方法，object类型并不能使用。 **void**类型的遍历只能被赋予undefined或者null，没什么大用处，但是void函数倒是很常见。 **never**类型的函数永远都不会返回，更不要说返回值类型了，要么函数中途抛出异常，要么函数里有死循环。

### 有关 Type assertions

（assertions好像是断言的意思，assert常常用来测试，如果不为真就抛出异常，姑且就翻译成类型转换吧） 类似其他语言的类型转换，只会在编译时产生影响，不会有额外的检查。有两种形式，一种是尖括号，一种是as（C#的影子）。注意类型转换的优先级较低，要用括号括起来。

变量
==

一提到变量，需要关注的点大概有这些：生命周期，static，const，作用域，可见性，值类型还是指针类型，浅拷贝深拷贝，还有一些常见的运算符，常见的方法。 ``` var a=10; function f(){ var message="Hello World"; return message; } function f\_2(){ var a=10; return function g(){ var b=a+1; return b; } } var g=f\_2(); g(); function f\_3(){ var a=1; a=2; var b=g(); a=3; return b; function g(){ return a; } } f\_3(); //return 2!!! function f\_4(shouldInitialize:boolean){ if(shouldInitialize){ var x=10; } return x; } f\_4(true); //return 10 f_4(false); //return undefined!!! function sumMatrix(matrix:number\[\]\[\]){ var sum=0; for(var i=0;i