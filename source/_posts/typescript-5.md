---
title: Typescript 函数
categories:
  - Typescript
tags:
  - Typescript
  - 前端
copyright: true
url: 203.html
id: 203
abbrlink: f8eab2f8
date: 2017-07-22 21:52:40
---

<!-- more -->

```null
function add(x: number, y: number): number {
  return x + y;
}

let myAdd: (x: number, y: number) => number = function(
  x: number,
  y: number
): number {
  return x + y;
};

function buildName(firstName: string, lastName?: string) {
  // function buildName(firstName:string,lastName="Smith"){
  if (lastName) return firstName + " " + lastName;
  else return firstName;
}

let result1 = buildName("Zou", "Dikai");
let result2 = buildName("ZouZOU");

function buildName_2(firstName: string, ...restOfName: string[]) {
  return firstName + " " + restOfName.join(" ");
}

let buildNameFun: (fname: string, ...rest: string[]) => string = buildName_2;

interface Card {
  suit: string;
  card: number;
}

interface Deck {
  suits: string[];
  card: number[];
  createCardPicker(this: Deck): () => Card;
}

let deck: Deck = {
  suits: ["heart", "spades", "clubs", "diamonds"],
  cards: Array(52),
  createCardPicker: function(this: Deck) {
    return () => {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);

      return { suit: this.suits[pickedSuit], card: pickedCard % 13 };
    };
  }
};

let suits = ["hearts", "spades", "clubs", "diamonds"];

function pickCard(x: { suit: string; card: number }[]): number;
function pickCard(x: number): { suit: string; card: number };
function pickCard(x): any {
  if (typeof x == "object") {
    let pickedCard = Math.floor(Math.random() * x.length);
    return pickedCard;
  } else if (typeof x == "number") {
    let pickedSuit = Math.floor(x / 13);
    return { suit: suits[pickedSuit], card: x % 13 };
  }
}

let myDeck = [
  { suit: "diamonds", card: 2 },
  { suit: "spades", card: 10 },
  { suit: "hearts", card: 4 }
];
let pickedCard1 = myDeck[pickCard(myDeck)];
let pickedCard2 = pickCard(15);


```

总结一下，总共四部分： 1\. 函数的类型，原型。 2. 可选参数，默认参数，变长参数。 3. this的坑。 4. 函数重载。