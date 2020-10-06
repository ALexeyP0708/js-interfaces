
# Requirements

- ES6
- Node (??? No testing)  

# Installation

# generate babel script for commonjs

`npm install -g --save-dev @babel/core @babel/cli @babel/preset-env`- global install;
`npm install --save-dev @babel/core @babel/cli @babel/preset-env`- project install;

# Documentation

[Russian](docs/_old/ru)
[English](https://github.com/ALexeyP0708/Js-Interfaces/wiki)


# заметик

```js
let object={
    /**
    *  может ссылаться на текущий обьект через this, и метод не имеет свойства prototype
    */
    method(){ 
        return this;
    },
    /**
    *  не может ссылаться на текущий обьект через this, и метод не имеет свойства prototype
    */
    method2:()=>{
        return this;
    },
    /**
    * может ссылаться на текущий обьект через this, и метод  имеет свойство prototype
    */
    method3:function(){
        return this
    }
};
// метод объекта
console.log('object.method',object.method.prototype===undefined,object===object.method());
// независимая функция
console.log('object.method2',object.method2.prototype===undefined,object===object.method2());
// конструктор (класс)
console.log('object.method3',object.method3.prototype===undefined,object===object.method3());
console.log(object);
```

```js
class A{

    // будут созданы критерии для метода
    static method(){} 
    
    // будут созданы критерии для метода, 
    static method2 =()=>{}
    
    // будут созданы критерии для свойства
    // так как передана функция конструктор, то конструктор установится в качестве типа в критериях
    static method3=function A(){};
};
A.isInterface=true;
```