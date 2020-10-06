
# Requirements

- ES6
- Node (??? No testing)  

# Installation

# generate babel script for commonjs

`npm install -g --save-dev @babel/core @babel/cli @babel/preset-env`- global install;
`npm install --save-dev @babel/core @babel/cli @babel/preset-env`- project install;

# Documentation API


# Getting started
 Цель компонента - это  создавать интерфейсы взаимодействия между собой JS компонентов, а также написание API запросов.
Примем за правило, что класс помеченный как интерфейс , будет называться интерфейс.

## Interface declaration

```js
// создадим класс интерфейса
class TestInterface {
} 
// обозначим что это интерфейс
TestInterface.isInterface=true;
/**
 собирем правила интерфейса. 
Warn: при сборке , генерируются правила интерфейса для членов и  члены интерфеса удаляются. 
Правила интерфейса хранаятся в интерфейсе.

Не обязательно применять. Правила интерфейса могут сгенерироваться при наследования интерфейса рабочим классом.
*/
let rules=InterfaceApi.extend(TestInterface); 
```
## Interface members

```js
class TestInterface {
	/**
		заявлем что необходим статический метод "method"
	*/  
    static method(){}  
   	
   	/**
		заявлем что в экземпляре обьекта должен быть метод "method"
	*/  
    method(){}  
    
    /**
		заявлем что необходимо статическое реактивное свойство "react" (getter)
	*/  
    static get react(){}  
    
    /**
		заявлем что необходимо статическое реактивное свойство "react" (setter)
	*/ 
    static set react(v){}  

   	/**
		заявлем что в экземпляре обьекта должно быть реактивное свойство "react" (getter)
	*/  
    get react(){}  

	/**
		заявлем что в экземпляре обьекта должно быть реактивное свойство "react" (setter)
	*/ 
    set react(v){}  
}  
	/**
		заявлем что в экземпляре обьекта должно быть прототипное свойство "prop".
		Warn: Указания наличия собственного свойства в экземпляре обьекта не представляется возможным. 
	*/ 
TestInterface.prototype.prop={}; 
 
/**
	заявлем что необходимо статическое свойство "prop"
*/  
TestInterface.prop={};  

TestInterface.isInterface=true;  
let rules=InterfaceApi.extend(TestInterface);
```


  

## Критерии

Каждый член интерфейса должен возвращать критерии (объекты с набором данных) по которым будут проводится валидация данных.
```js
	class TestInterface{
		method(){
			return {
				arguments:[],
				return:{}
			}
		}
	}
```
Есть три типа критериев (классы для критериев)
- **CriteriaPropertyType** - описывает свойства класса, аргументы метода/функции, возвращаемое значение метода/функции.
- **CriteriaMethodType** - описывает методы класса, аргументы метода/функции и возвращаемое значение метода/функции если такие данные  должны быть вызываемыми. 
- **CriteriaReactType** - описывает реактивные свойства класса.

### template for CriteriaPropertyType
```js
{
	types:[
			'null',// or null 
			'undefined', // or undefined
			'object', //typeof
			'boolean',//typeof 
			'number', //typeof
			'string', //typeof
			'symbol', //typeof
			'function', //typeof
			'mixed', // any types
			class A{}, // for check  object instanceof A or A.isPrototypeOf(function)
			{protoObject}, // for check   protoObject.isPrototypeOf(object)
			new CriteriaPropertyType({}) //expands the current criteria with these criteria.It is used as a detached type.Use only in cases of complex interface implementation.
			new CriteriaMethodType({}) //If the value is a function, then it sets the rules for it.
			class extends MirrorInterface{} //any object will be checked against the specified interface.Designed to check the properties of an object for data correctness
			Object.assign(class Interface{},{isInterface:true}) // checks if an object or function implements a given interface
			
			
		],// optional
	includes:[], // optional
	excludes:[] // optional
}

```
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
