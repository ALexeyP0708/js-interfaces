 
# Requirements
- ES6
- Node (??? No testing)  

# Installation

# generate babel script for commonjs

`npm install -g --save-dev @babel/core @babel/cli @babel/preset-env`- global install;
`npm install --save-dev @babel/core @babel/cli @babel/preset-env`- project install;

# Documentation API


# Getting started
 Цель компонента:
 -  создавать интерфейсы для взаимодействия между собой JS компонентов;
 -  создавать интерфейсы для написание API запросов.
 -  для налаженного и удобного взаимодействия между собой разработчиков.
 -  проектирование кода.
 - 
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

Не обязательно применять. Правила интерфейса могут сгенерироваться при наследовании интерфейса рабочим классом.
*/
let rules=InterfaceApi.extend(TestInterface); 
```
## Interface members

```js
class TestInterface {
	/**
		warn:rules for the constructor method cannot be set. since the class itself is a given constructor.
		do not declare a constructor in the interface.
	*/
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

Есть три типа критериев (классы для критериев)
- **CriteriaPropertyType** - описывает свойства класса, аргументы метода/функции, возвращаемое значение метода/функции.
- **CriteriaMethodType** - описывает методы класса, аргументы метода/функции и возвращаемое значение метода/функции если такие данные  должны быть вызываемыми. 
- **CriteriaReactType** - описывает реактивные свойства класса.
```js
	class TestInterface{
		method(){
			// return criteria for method	
			return {
				arguments:[],
				return:{}
			}
		}
	}
```
### template for CriteriaPropertyType
```js
{
	/**
	setting types to test a value
	*/
	types:[// optional
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

			/*
			Expands the current criteria with these criteria.It is used as a detached type.
			Use only in cases of complex interface implementation.
			*/
			new CriteriaPropertyType({}) 
			
			/*
			If the value is a function, then it sets the rules for it.
			*/
			new CriteriaMethodType({}) 
			
			/*
			any object will be checked against the specified interface.
			Designed to check the properties of an object for data correctness
			*/
			class extends MirrorInterface{}

			/*
			 checks if an object or function implements a given interface
			 */
			Object.assign(class Interface{},{isInterface:true})
		],
		
	/**
	указывает каким значением должны соответствовать данные
	Любые приметивы. И пременяются правила отношений к классам и интерфейсам.
	*/
	includes:[ // optional
		//any values ​​are strict comparison
		
		// or or redundant validate
		class A{}, // for check  object instanceof A or A.isPrototypeOf(function)
		{protoObject}, // for check   protoObject.isPrototypeOf(object)
		Object.assign(class Interface{},{isInterface:true})//checks if an object or function implements a given interface
		
	], 
	
	/**
	указывает каким значением не должны соответствовать данные
	*/
	excludes:[// optional
		//any values ​​are strict comparison
			
		// or or redundant validate
		class A{}, // for check  object instanceof A or A.isPrototypeOf(function)
		{protoObject}, // for check   protoObject.isPrototypeOf(object)
		Object.assign(class Interface{},{isInterface:true})//checks if an object or function implements a given interface
	] // optional
}
```
Example
```js
class A{
}
A.prop={
	types:['number'],
	excludes:[20,21]
};
A.isInterface=true;
```
### template for CriteriaMethodType

```js
	{
		arguments:[// optional
		
			{}, //arguments[1] -  CriteriaPropertyType template or  CriteriaMethodType template 
			{} //arguments[2] -  CriteriaPropertyType template or  CriteriaMethodType template 
			...
		],
		return:{} [// optional - template CriteriaPropertyType or template CriteriaMethodType 
		isBuildSandbox:true, //optional. default -  true or your settings. Denotes to collect method / function in sandbox . If false, then other method criteria will be for developer information only.
	}
	/*
		CriteriaPropertyType template - описывает обыное значение
		CriteriaMethodType template - описывает выполняемую функцию
	*/
```

Example
```js
class A{
	method(){
		return {
			arguments:[
				// name event
				{
					types:['string']
				},
				//callback
				{
					arguments:[
						types:['object']
					]
				}
			]
		}
	};
}
A.isInterface=true;
```
### template for CriteriaReactType
```js
	{
		get:{ 
			//  template CriteriaMethodType 
			retrun:{
					types:[],
					includes:[],
					excludes:[]
				}  
		}
		set:{ 
			//  template CriteriaMethodType 
			arguments:[{
					types:[],
					includes:[],
					excludes:[]
				}]  
		} 
	}
```
or
```js
	{
		//  template CriteriaPropertyType 
		get:{
			types:[],
			includes:[],
			excludes:[]
		}
		//  template CriteriaPropertyType 
		set:{
			types:[],
			includes:[],
			excludes:[]
		}
	}
```
Класс  должен не реализовывать "getter" или "setter" который не объявлен  в интерфейсе.
Example
```js
class A{
	// реактивное свойство должно принимать число и будет возвращать число.
	get react(){
		return {
			types :['number']
		}
	};
	set react(v){
		return{
			types:['number']
		}
	}
	// спомощью реактивного свойства должно  устанавливаться вызываемая функция которая принимает в качестве аргумента обьект, а возвращает строку. 
	set react2(){
		return {
			arguments:[{
				arguments:[
					{
						types:['object']
					},
				],
				return:{
					types:['string']
				}
			}]
		}
	}
	// если get react2 не обьявлен, то при попытке обьявить его в классе , вызовет ошибку. 
}
A.isInterface=true;

```
##  Inherit interface

```js
class TestInterface {  
    method(){}  
}  
TestInterface.isInterface=true;  
class Test extends TestInterface{  
    method(){}  
}  
InterfaceApi.extend(Test);
```
or
```js
class TestInterface {  
    method(){}  
}  
class TestInterface2 {  
    method2(){}  
}  
TestInterface.isInterface=true;  
class Test{  // create abstract class
    method(){}  
}  
InterfaceApi.extend(Test,TestInterface,TestInterface2);
```

or
```js
class TestInterface {  
    method(){}  
}  
class TestInterface2 {  
    method2(){}  
}  
TestInterface.isInterface=true;  
class Test{  // create abstract class
    method(){}  
} 

InterfaceApi.extend(Test,TestInterface,TestInterface2); 
class Test2 extends Test{  // create finaly class
    method2(){}  
}
// All interface rules for classes will be formed, and for the current class it will validate the compliance of the members with the established criteria.
InterfaceApi.implement(Test2);
```
## inherit interface  to interface

```js
class TestInterface {  
    method(){}  
    method3(){}  
      
}  
TestInterface.isInterface=true;  
class TestInterface2 extends TestInterface{  
    method2(){}  
    method3(){}  
}  
TestInterface2.isInterface=true;  
InterfaceApi.extend(TestInterface2);
```
or

```js
class TestInterface {  
    method(){}  
    method3(){}  
  
}  
TestInterface.isInterface=true;  
class TestInterface2{  
    method2(){}  
    method3(){}  
}  
TestInterface2.isInterface=true;  
InterfaceApi.extend(TestInterface2,TestInterface);
```
or hybrid

```js
class TestInterface {  
    method(){}  
    method3(){}  
    method5(){}  
}  
TestInterface.isInterface=true;  
class TestInterface2 extends TestInterface{  
    method2(){}  
    method3(){}  
}  
TestInterface2.isInterface=true;  
class TestInterface3{  
    method3(){}  
    method4(){}  
}  
TestInterface3.isInterface=true;  
  
class TestInterface4 extends TestInterface3{  
    method(){}  
    method4(){}  
}  
TestInterface4.isInterface=true;  
InterfaceApi.extend(TestInterface4,TestInterface2);
```

## методы сборки интерфейсов
```js
/*
Осуществляет генирацию правил  интерфейсов.
Cначала формирует правила интерфейсов из стека интерфейсов RestInterface, после  обьеденяет их с правилами интерфейса текущего класса/интерфейса CurrentClass.
*/
InterfaceApi.extendBefore(CurrentClass,...RestInterface);

// example
class iClass1{}
iClass.isInterface=true;

class iClass2 extends iClass1{}
iClass2.isInterface=true;

class iClass3{}
iClass.isInterface=true;

class iClass4 {}
iClass.isInterface=true;

InterfaceApi.extendBefore(iClass4 ,iClass2,iClass3);
// chain  =>iClass1=>iClass2=>iClass3=>iClass4=>(last rules)  
//each subsequent interface will override the preceding interface


```js
/*
Осуществляет генирацию правил  интерфейсов.
Cначала формирует правила интерфейсов для текущего класса/интерфейса CurrentClass после их переопределяет правилами  из стека интерфейсов RestInterface.
*/
InterfaceApi.extendAfter(CurrentClass,...RestInterface);

// example
class iClass1{}
iClass.isInterface=true;

class iClass2 extends iClass1{}
iClass2.isInterface=true;

class iClass3{}
iClass.isInterface=true;

class iClass4 {}
iClass.isInterface=true;

InterfaceApi.extendAfter(iClass4 ,iClass2,iClass3);
// chain  =>iClass4=>iClass1=>iClass2=>iClass3=>(last rules)  
//each subsequent interface will override the preceding interface
```
```js
/**
syntactic sugar.
 For interfaces, applies extendBefore method. For final / abstract classes apply extendAfter method.
*/
InterfaceApi.extend(CurrentClass,...RestInterface);
```

```js
/*
Applicable only for final classes
In addition to generating rules, it performs final class validation.
*/
InterfaceApi.implement(CurrentClass,...RestInterface);

```
## Настройки

## Правила создания интерфейсов


##  Другое

## Варианты подключения отключения интерфейсов в продакшене.

 
## Альтернативный синтаксис

## Примеры
# заметки

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
