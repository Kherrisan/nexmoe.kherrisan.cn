---
title: Typescript 类
categories:
  - Typescript
copyright: true
url: 165.html
id: 165
abbrlink: f5fd3baa
date: 2017-07-13 11:22:11
tags:
---

<!-- more -->

```null
class Greeter{
    greeting:string;
    constructor(message:string){
        this.greeting=message;
    }
    greet(){
        return "Hello,"+this.greeting;
    }
}

let greeter=new Greeter("World");

abstract class Animal{
    name:string;
    constructor(name:string){this.name=name;}
    move(distanceInMeters:number=0){
        console.log(`${this.name} moved ${distanceInMeters}m`);
    }
}

class Snake extends Animal{
    // constructor(name:string){super(name);}
    move(distenceInMeters=5){
        console.log("Slithering...");
        super.move(distenceInMeters);
    }
}

class Horse extends Animal{
    // constructor(name:string){super(name);}
    move(distanceInMeters=45){
        console.log("Galloping...");
        super.move(distanceInMeters);
    }
}

let sam=new Snake("Sammy the Python");
let tom:Animal=new Horse("Tommy the Palomino"); //有一点多态的感觉咯

sam.move();
tom.move();

class Person{
    protected readonly name:string;
    protected constructor(name:string){this.name=name;}
}

class Employee extends Person{
    private _department:string;
    constructor(name:string,department:string){
        super(name);
        this._department=department;
    }
    public getElevatorPitch(){
        return `Hello,My Name is ${this.name} and I work in ${this._department}.`;
    }
    public get department():string{
        return this._department;
    }
    public set department(newDepartment:string){
        if(newDepartment==""){
            console.log("Error:Unauthorized update of employee");
        }else{
            this._department=newDepartment;
        }
    }
}

let howard=new Employee("Howard","Sales");
howard.department="";
howard.department="Tech";

class Grid{
    static origin={x:0,y:0};
    calculateDistanceFromOrigin(point:{x:number,y:number}){
        let xDist=(point.x-Grid.origin.x);
        let yDist=(point.y-Grid.origin.y);
        return Math.sqrt(xDist*xDist+yDist*yDist)/this.scale;
    }
    constructor(public scale:number){}
}

```

嗯这一节的代码就看起来舒服多了，和java几乎没什么区别。get和set函数也是形如C#中的存取器的写法。 忽然就不想写什么了。