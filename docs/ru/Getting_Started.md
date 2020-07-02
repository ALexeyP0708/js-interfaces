#  Interfaces
Если вы реализуете API в стиле ООП для JS и необходима командная работа, то вам понадобится реализация Интерфейсов в Вашем проекте. 
Это компонент симулирует возможности Интерфейсов в JS при написании ООП кода. 

## Введение
Простой пример.
```js
export {InterfaceManager} from './export.js';
class MyTypeClass{};
class MyInterface{ // обьявляем интерфейс
	// далее в методах/свойствах/реактивных свойствах указываем критерии для последующей валидации
	method(){}  // реализовать method c параметрами по умолчанию (любые аргументы, возвращет любой результат).
	method2(){ // реализовать method2
		return { // критерии для метода
			arguments:[
				{
					// 1 аргумент должен иметь тип 'string' или undefined или null
					types:['string',undefined,null]
				}
			],
			return:{
			// возвращаемый результат должен быть [object MyTypeClass]
				types:MyTypeClass 
			}
		}
	}
	static static_mithod(){} //  реализовать статичесий метод static_mithod c параметрами по умолчанию (любые аргументы, возвращет любой результат).
	
	get react function(){
		return { // критерии  для реактивного свойства get
			types:['string']
		}
	}
	set react function(v){ 
		return { // критерии  для реактивного свойства set
			types:['string']
		};
	}
}
MyInterface.prototype.prop={
	types:['string']
};
// обозначаем что это интерфейс
MyInterface.isInterface=true;

class MyClass extends MyInterface{
	// method (){} // Ошибка: должен присутствовать
	method2(arg){
		return 1; // Ошибка: должен вернуть [object MyTypeClass]
	}
	//static static_mithod(){}  // Ошибка: должен присутствовать
	get react(){
		return 1; // Ошибка: должен вернуть строку 
	}
	// set react (v){} // Ошибка : должен присутстствовать
	
}
MyClass.prototype.prop=1;// ошибка: должна быть строка.

InterfaceManager.implementInterfaces(MyClass); //сгенерирует ошибки на отсутствие необходимых свойств.
// после исправления ошибок
let myObj=new MyClass();
myObj.method2(1); //  Ошибка: аргумент должен быть строка или undefined или null
myObj.react=1; //  Ошибка: присвоение должно быть строкой.
class MyClass2 {
}
// альтернативный способ наследования интерфейсов.
InterfaceManager.implementInterfaces(MyClass2,MyInterface); // сгенерирует ошибки на отсутствие 	необходимых свойств
let myObj2=new MyClass2();
```
## Понятия

**Класс** - конструктор(функция),  который будет формировать новый объект на базе прототипа. 

**Интерфейс** - класс, который отмечен как интерфейс,  в целях установить правила взаимодействия с API.  

**Члены класса/интерфейса** - объявленные свойства/методы/реактивные свойства в классе.

**реактивные свойства** - член класса для которого определены геттер и/или сеттер.

**Менеджер интерфейсов** - статический класс который будет управлять интерфейсами.


**Критерии**- это набор ограничений  для членов класса которые объявлены в Интерфейсе. По ним будет проходить валидация.  

**Правила интерфейсов** - это сгенерированные для класса правила всех унаследованных интерфейсов. По данным правилам будет происходить валидация класса и сборка членов класса.  

**Цепочка прототипов**- это  последовательность унаследованных прототипов.
 
**Дескрипторы** - характеристики свойств объекта .см [Дескрипторы](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors)
  
  **Генерация правил интерфейсов** -  это вычисление Интерфейсов в цепочке прототипов, и вычисление  критериев для свойств через процессы сравнения или объединения критериев. 

**Песочница** -   функция которая выступает в качестве обертки  для членов класса, в целях валидации аргументов и возвращаемых результатов при исполнении метода.


## Базовые правила при написании кода в стиле ООП и применении интерфейсов.

1. Технология **Интерфейсов** написана по правилам объявления **класса** (создание конструктора) - ```class NameClass{}```. Применение интерфейсов к другой логике формирования класса (конструктора)  и/или создания объектов  не гарантирует правильность выполнения кода.
2. **Классы**, которые реализуют интерфейсы,  статичны.  Методы, свойства и реактивные свойства класса, для которых определены **правила интерфейса**  не должны изменяться после  объявления **класса** и генерации  правил интерфейсов.  
4.   Все **интерфейсы** статичны и после объявления  не должны изменяться.
5. Все  **сгенерированные правила интерфейсов**, статичны  и после генерации не должны изменяться.
6.  Методы и реактивные свойства класса, к которым будут применяться **правила интерфейсов** ,будут изменены (переопределены дескрипторы) , и исполнение  будет происходить в "песочнице" .  Набор правил будет храниться в самом классе. Исходя из этого вытекает нижестоящее правило.  
7.  **Классы**, к которым должны применяться **интерфейсы**, и их прототипы не должны быть [заморожены](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)  и [запечатаны](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) , а объявленные **члены класса** должны иметь следующие установки для дескрипторов `{configurable:true, writable:true}`. 
8. **Интерфейсы** предназначены для разработки.  В продакшен версии должна быть возможность  исключать **интерфейсы** из кода (примеры как это сделать описаны ниже). Поэтому реализация **интерфейсов** и проверки на **интерфейсы** не должны перемешиваться с основным кодом.  


## Концепция

1. Объявляется **класс** который помечается как **интерфейс**.
2. В  **Интерфейсе** каждый **член интерфейса** формирует собственные **критерии** проверок.
3. **Интерфейс** наследуется (прямое/посредственное наследование)  **классом** или назначается через **менеджер интерфейсов**.
4. С помощью **менеджера интерфейсов** осуществляется **генерация правил интерфейсов** для **класса**, а также происходит сборка **песочниц**  для **членов класса**  **класса** .
10. **Генерация правил интерфейсов** происходит  рекурсивно для каждого родительского **класса** по **цепочке прототипов** .
6. При  **генерации правил интерфейса** ,  интерфейсы сравниваются/объединяются  в единое правило.   Для каждого **интерфейса** **генерируются правила интерфейсов** из собственных сформированных правил и правил наследуемых интерфейсов.
7. После **генерации правил интерфейса**  для класса  запускается процесс валидации сборки класса по этим правилам. 
8. Валидация аргументов и возвращаемых результатов для методов или реактивных свойств класса происходит в момент выполнения метода/реактивного свойства.  
9. **Правила интерфейсов** инициализируются один раз и все объявленные  свойства/методы/реактивные свойства удаляются из **интерфейса**.
10. Для каждого **класса**  **генерируются свои правила** из наследуемых **интерфейсов** один раз. Далее эти правила используются на протяжении исполнения кода. 
11. Класс наследует (клонирует) правила родительского **класса**.


## Подключение менеджера интерфейсов.

Управлением **интерфейсами** занимается класс InterfaceManager.
Подключение InterfaceManager.
```js
export {InterfaceManager} from './export.js';
// указывайте реальный путь размещения компонента
```


## Объявление Интерфейса

Пример прямого наследования.
```js
class MyInterface {
	method(){}
	method2(){}
	get react(){}
	set react(){}
}
let MyInterface.prototype.prop={
	types:'mixed'
};
MyInterface.isInterface=true;
MyInterface2 extends MyInterface{
	method2(){ // переопределяем правила MyInterface
		return:{types:['string',undefined]}
	}
	method3(){} 
	get react(){} // переопределяем get - запрещено обьявлять если не обьявлен get в родительском интерфейсе
	set react(){} // переопределяем set - запрещено обьявлять если не обьявлен set в родительском интерфейсе
}
MyInterface2.isInterface=true;
MyClass extends MyInterface2{
	method(){} // должны объвить согласно MyInterface 
	method2(){ // должны объвить согласно MyInterface2 
		return 'Hello';
	}
	method3(){} // должны объвить согласно MyInterface2
	get react(){} //запрещено обьявлять если не обьявлен get в интерфейсе
	set react(){} // запрещено обьявлять если не обьявлен set в интерфейсе
}
MyInterface.prototype.prop='Hello'; // должны обьявить согласно MyInterface 
InterfaceManager.implementInterfaces(MyClass);
```

### Прямое наследование

Наследование Интерфейсов через семантику JS (ES6) языка.
```js
export {InterfaceManager} from './export.js';
class MyInterface{
}
MyInterface.isInterface=true;

//Наследование интерфейса интерфейсом

class MyInterface2 extends MyInterface{

}
MyInterface2.isInterface=true;

// Наследование интерфейса

class MyClass extends MyInterface2{

}
/* генерация правил для класса (будут сгенерированы 
правила , собраны методы и реактивные свойства в 
песочнице)*/
InterfaceManager.extendIntefaces(MyClass);
/* предпочтительно использовать если генерируются абстрактные
 классы. 
*/

// или 
InterfaceManager.implementInterfaces(MyClass);
/* тоже что и extendIntefaces, но после сборки класс
 пройдет валидацию на соответствие правилам интерфейса.
Предпочтительно использовать если класс полнастью собран согласно правилам интерфейса.
*/

```
### Посредственное  наследование

Наследование интерфейсов через специальные методы.
```js
export {InterfaceManager} from './export.js';
class MyInterface{
}
MyInterface.isInterface=true;

class MyInterface2{
}
MyInterface2.isInterface=true;

class MyClass {

}
/*
Наследование происходит путем перечисления Интерфейсов в InterfaceManager.extendIntefaces
для класса MyClass 
*/
InterfaceManager.extendIntefaces(MyClass,MyInterface,MyInterface2);
/* предпочтительно использовать  если генерируются абстрактные классы.*/

// или 
InterfaceManager.implementInterfaces(MyClass,MyInterface,MyInterface2);
/* 
Тоже что и extendIntefaces, но после сборки,
класс пройдет валидацию на соответствие правилам интерфейса.
Предпочтительно использовать если класс полнастью собран согласно правилам интерфейса.
*/
```

###  Генерация правил интерфейса

Методы`InterfaceManager.extendIntefaces,  InterfaceManager.implementInterfaces, InterfaceManager.expandIntefaces ` осуществляют **генерацию правил интерфейсов** и сборку **членов класса**.   Соответствующие методы могут использоваться на любом этапе объявления **интерфейсов** или **классов**  при их наследовании . 

Например 
```js
class MyInterface{}
MyInterface.isInterface=true;
InterfaceManager.extendIntefaces(MyInterface);

class MyInterface2 extends MyInterface {
}
MyInterface2.isInterface=true;
InterfaceManager.extendIntefaces(MyInterface2);

class MyInterface3 {}
MyInterface3.isInterface=true;
class MyClass{}
InterfaceManager.extendIntefaces(MyClass,MyInterface2,MyInterface3);

class MyInterface4{}
MyInterface4.isInterface=true;

class MyClass2 extends MyClass{}
InterfaceManager.implementIntefaces(MyClass2,MyInterface4);
```
Если необходимо посмотреть **правила интерфейсов** для отладки
```js
let rules;
rules=InterfaceManager.extendIntefaces(MyClass2);
// или
rules=InterfaceManager.implementIntefaces(MyClass2);
// или, если правила уже сгенерированы
rules=InterfaceManager.getInterfaceData(MyClass2);
console.log(rules);
```

###  Сравнение и объединение интерфейсов

**Сравнение интерфейсов** - **критерии** дочернего интерфейса  сравниваются с **критериями**  родительского интерфейса и  если проверка успешно пройдена, то для **члена класса**, применяются критерии дочернего интерфейса .

**Объединение интерфейсов** - клонируются  критерии родительского интерфейса и  объединяются с критериями дочернего интерфейса. Такая реализация возможна только при *посредственном наследовании*. 

При *прямом наследовании*, сборка будет осуществляться через **сравнение интерфейсов**.

####  `InterfaceManager.extendIntefaces`
Генерирует **правила интерфейсов** и сборку **членов класса**.
При наследовании интерфейсов, осуществляет **сравнение интерфейсов**.

Использует **магические аргументы** ( динамическое добавление аргументов и в зависимости от типа аргумента будет зависит его роль)
```js
let Interfaces=[
	MyInterface1,
	MyInterface2
	MyInterface3
];
// 1 вариант
InterfaceManager.extendIntefaces (
	MyClass, // класс для которого формируются правила интерфейсов. Может указываться и интерфейс.
	false,  // - false (default) - сравнение интерфейсов, true - обьединение интерфейсов
	false, //  true - будут созданы собственные свойства по дескрипторам цепочки прототипов. false(dafult)
	...Interfaces // остальные аргументы - это Интерфейсы.  
);
	
// 2 вариант
InterfaceManager.extendIntefaces (
	MyClass, // класс для которого формируются правила интерфейсов
	false,  // - false (default) - сравнение интерфейсов, true - обьединение интерфейсов
	...Interfaces // остальные аргументы - это Интерфейсы.  
)

// 3 вариант
InterfaceManager.extendIntefaces (
MyClass, // класс для которого формируются правила интерфейсов
...Interfaces // остальные аргументы - это Интерфейсы.  
)
```

####  `InterfaceManager.implementIntefaces`
Генерирует**правила интерфейсов**, сборку **членов класса** и последующую валидацию класса.
Передача аргументов такая же как и при `InterfaceManager.extendIntefaces`

####  `InterfaceManager.expandIntefaces`
Используется при посредственном наследовании.
Формирует правила интерфейсов и сборку свойств класса.
При наследовании, осуществляет объединение интерфейсов.

```js
//1.вариант
	let Interfaces=[
		MyInterface1,
		MyInterface2
		MyInterface3
	];
InterfaceManager.expandIntefaces(
	MyClass, // класс для которого формируются правила интерфейсов
	false, //  true - будут созданы собственные свойства по дескрипторам цепочки прототипов. false(dafult)
	...Interfaces // остальные аргументы - это Интерфейсы.  
	);
	
//2.вариант
InterfaceManager.expandIntefaces(
	MyClass, // класс для которого формируются правила интерфейсов
	...Interfaces // остальные аргументы - это Интерфейсы.  
	)
```
 Эквивалент
```js
	let arguments=[
		arg,// [InterfaceClass] or [boolean]
		MyInterface2
		MyInterface3
	];
InterfaceManager.extendIntefaces(
	MyClass, // класс для которого формируются правила интерфейсов
	true,
	...arguments
	)
```

### Позднее связывание интерфейсов.

Это способ необходим когда класс был сформирован ранее и необходимо реализовать новый  класс по подобию существующего в соответствии с правилам интерфейса.
Возможно будет удобно применять при рефакторинге или создании класса на основе имеющихся методов.

```js
class MyClass {
	myMethod(){
		return 'Hello';
	}
}
class MyClass2 extends MyClass {
	myMethod2(){
		return 'bay';
	}
}

class MyInterface  { 
	myMethod(){}
	myMethod2(){
		return {
			arguments:[],
			return:{
				types:'string'
			}
		}
	}
	myMethod3(){
			return {
			arguments:[],
			return:{
				types:'string'
			}
		}
	}
}
MyInterface.isInterface=true;
class MyClass3 extends MyClass2 {
}
try{
// позднее связывание интерфейса с классом.
	InterfaceManager.implementInterfaces(MyClass3,MyInterface);// выдаст ошибку так как myMethod3 не реализован.
}catch(e){
	console.error(e);
}
// 
class MyClass4 extends MyClass2  {
	myMethod3(){
		return 'Word';
	}
}
// позднее связывание интерфейса с классом.
InterfaceManager.implementInterfaces(MyClass4, MyInterface); // успешно проверит на наличие методов myMethod,myMethod2,myMethod3
let myObj=new MyClass4 ();
myObj.myMethod(); // т.к. обьявлен в не интерфейса,не осуществит проверку на передачу аргументов и на возвращаемое значение

myObj.myMethod2(); // т.к. обьявлен в не интерфейса,не осуществит проверку на передачу аргументов и на возвращаемое значение

myObj.myMethod3(); // т.к. обьявлен в рамках интерфейса, осуществит проверку на передачу аргументов и на возвращаемое значение.

class MyClass5  {
	myMethod3(){
		return 'Word';
	}
}
InterfaceManager.implementInterfaces( MyClass5,false,true, MyInterface); // успешно проверит на наличие методов myMethod,myMethod2,myMethod3

let myObj2=new MyClass5 ();
myObj2.myMethod(); // т.к. обьявлен в рамках интерфейса, осуществит проверку на передачу аргументов и на возвращаемое значение. (см. 3 аргумент в implementInterfaces )
myObj2.myMethod2(); // т.к. обьявлен в рамках интерфейса, осуществит проверку на передачу аргументов и на возвращаемое значение. (см. 3 аргумент в implementInterfaces )
myObj2.myMethod3(); // т.к. обьявлен в рамках интерфейса, осуществит проверку на передачу аргументов и на возвращаемое значение.
```

### Точки Завершения

Это классы на которых завершается анализ и поиск интерфейсов в цепочке прототипов.
Правила интерфейсов генерируются по всей цепочке прототипов Класса.  Чтобы прекратить дальнейший анализ на конкретном прототипе, необходимо указать соответствующую точку.
Такими классами могут быть и системные Классы. Например Audio или Node.
Есть глобальные конечные точки (применяются для всех классов) и есть локальные (устанавливается для каждого класса отдельно)

#### Установка глобальных точек завершения
Установка глобальных точек завершения осуществляется перед объявлением первого Интерфейса. 
```js 
InterfaceManager.addGlobalEndPoints([
	MyPointClass,
	MyPointClass2,
]);

```

#### Установка локальных точек завершения
Устанавливается после объявления класса, но перед объявлением генерации правил интерфейса.
```js 
class MyInterface extends OldClass { }
MyInterface.isInterface=true;
class NewClass extends MyInterface {
}
InterfaceManager.setEndPoints(NewClass,[OldClass]);
InterfaceManager.extendInterfaces(NewClass);
```

### Заморозить  существующие свойства класса

Ниже код замораживает собственные свойства Класса.
Класс будет расширяем другими свойствами. Но изменить или удалить существующие будет невозможно.
Замораживать необходимо после генерации правил интерфейса.
```js
	class MyInterface {}
	MyInterface.isInterface=true;
	class MyClass{}
	InterfaceManager.implementInterfaces(MyClass,MyInterface);
	InterfaceManager.freezePropСlass(MyClass);
```

## Критерии

Критерии - это набор параметров, которые описывает  "член  класса" при наследовании интерфейса и формируется одноименным **членом  Интерфейса**.
Критерии бывают трех видов - свойство (CriteriaPropertyType)/метод(CriteriaMethodType)/реактивное свойство (CriteriaReactType).  Критерии создаются на основе соответствующих шаблонов.

***шаблон CriteriaPropertyType***  -простой объект [object Object] который повторяет частично конструкцию объекта   [object CriteriaPropertyType ] 
***шаблон CriteriaMethodType***  -простой объект [object Object] который повторяет частично конструкцию объекта   [object CriteriaMethodType] 
***шаблон CriteriaReactType***  -простой объект [object Object] который повторяет частично конструкцию объекта   [object CriteriaReactType] 
```js

class MyType{};
  
 /* критерии для свойств класса, аргументов метода класса, возвращаемого результата метода класса, для get или set реактивного свойства класса */ 
let criteriaProp={ // шаблон CriteriaPropertyType
 
	// определяем ожидаемые типы значений в результате 
	// отсутствие параметра или отсутствие типов равносильно types:['mixed']	 
	 types:[ 
	 // перечисляем типы и/или классы 
			 'null', // или null
			 'undefined', // или undefined
			 'object', // [object ClassName]
			 'boolean', 
			 'number', 
			 'string',
			 'symbol',
			 'function',
			 'mixed', // если указан, то все остальные типы не имеют значения
			 MyType 
			 /* если в "types" указан конструктор, то осуществит проверки 
				 [Function === MyType] |
				 [object instanceof MyType] |
				 [MyType.isPrototypeOf(Function)] |
				 [InterfaceManager.instaceOfInterface(Function,MyType)] 
			 */
	 ], 
	 /*types:'number' //- one type */
	 
	// если необходимо принимать определенные значения в результате. 
	//Если пустой или отсутствует, то не применяется это правило 
	 includes:[], // перечисляем значения|обьекты|функции|классы. 
	 /* если в "includes" указан конструктор, то осуществит  проверки 
				 [Function === MyType] |
				 [object instanceof MyType] |
				 [MyType.isPrototypeOf(Function)] |
				 [InterfaceManager.instaceOfInterface(Function,MyType)] 
	 */
	
	// если необходимо исключить значения из результата
	//Если пустой или отсутствует, то не применяется это правило 
	 excludes:[], // перечисляем значения|обьекты|функции|классы 
	  /* если в "excludes" указан конструктор, то осуществит проверки 
				 [Function === MyType] |
				 [object instanceof MyType] |
				 [MyType.isPrototypeOf(Function)] |
				 [InterfaceManager.instaceOfInterface(Function,MyType)] 
	 */
 }
/*
	критерии для методов Класса
*/
let criteriaMethod={// шаблон CriteriaMEthodType
	// критерии аргументов
	// перечисляются шаблоны типа  CriteriaPropertyType
	// отсутстствие прааметра равносильно, arguments:[]
	arguments:[
		{},
		{},
		//...
	],
	// критерий возвращаемого результата типа CriteriaPropertyType
	return:{}
}
/*
	критерии для реактивных свойств класса
*/
let criteriaReact={//шаблон CriteriaReactType 
	get:{  // шаблон CriteriaPropertyType | CriteriaMethodType {return:{}}
		types:[],
		includes:[],
		excludes:[]
	},
	set:{ // шаблон CriteriaPropertyType | CriteriaMethodType {arguments:[{}]}
		types:[],
		includes:[],
		excludes:[]
	}
}

class MyInterface{
	// criteria for function/method
	method(){
		return criteriaMethod;
	}
	get react (){
		return criteriaReact.get;
	}
	set react (v){
		return criteriaReact.set;
	}
	static s_method(){
		return criteriaMethod;
	}
	static get s_react (){
		return criteriaReact.get;
	}
	static set s_react (v){
		return criteriaReact.set;
	}
}
MyInterface.prototype.prop=criteriaProp;
MyInterface.s_prop=criteriaProp;
MyInterface.isInterface=true;

class MyClass{}
InterfaceManager.extendInterfaces(MyClass,MyInterface);
InterfaceManager.freezePropСlass(MyClass);
```

### Правила объявления  и сравнения Критериев при наследовании Интерфейса.

#### Критерии Свойства (шаблон CriteriaPropertyType)
Критерии дочернего свойства должны соответствовать  критериям родительского свойства.

```js
class TypeA{}
class TypeA1{}
class TypeB extends TypeA{}
class TypeC extends TypeA{}
class TypeD extends TypeA{}
class MyInterface {}
MyInterface.prototype.prop={
	types:['number','string','object','undefined','null'], 
	includes:[1,2,3,4,5,'Hello',undefined,null,TypeA],
	excludes:[TypeB,TypeC].
};
MyInterface.prototype.prop2={}; // равносильно {types:'mixed'}
MyInterface.isInterface=true;

class MyInterface2 extends MyInterface {

}
MyInterface2.prototype.prop={
	// парметр  не должен быть пустым и иметь значения из списка родительского интерфейса
	types:['object','undefined','null'], // compare success
	
	// парметр  не должен быть пустым и иметь значения из списка родительского интерфейса
	// значения должны  соответствовать установленным типам
	includes:[undefined,null,TypeA],//compare success
	
	// параметр должен быть сопоставим родительскому интерфейсу и может расширяться. 
	// значения должны  соответствовать установленным типам
	// Если зн
	excludes:[TypeB,TypeC,TypeD] // compare success
};
MyInterface2.isInterface=true;
InterfaceManager.extendInterfaces(MyInterface2);

class MyInterface3 extends MyInterface {

}
MyInterface3.prototype.prop={
	// парметр  не должен быть пустым и иметь значения из списка родительского интерфейса
	types:types:['function','undefined','null'], // compare error - does not expect function

	// парметр  не должен быть пустым и иметь значения из списка родительского интерфейса
	// значения должны  соответствовать установленным типам
	includes:[undefined,null,TypeA1],// compare error - does not expect TypeA1
	
	// параметр должен быть сопоставим родительскому интерфейсу и может расширяться. 
	// значения должны  соответствовать установленным типам
	excludes:[TypeB] // compare error - Missing TypeC
};
MyInterface3.isInterface=true;
InterfaceManager.extendInterfaces(MyInterface3);
```
#### Критерии Метода(шаблон  CriteriaMethodType)

```js
class MyInterface{
	method(){
		return{
			arguments:[
				
				{
					types:'number'
				}
			],
			return:{
				types:'number'
			}
			 
		}
	}
}
MyInterface.isInterface=true;

class MyInterface2 extends MyInterface{
	method(){
		return{

// критерии аргументов должны быть перечислены в соответствии критериям родительского интерфейса, и могут добавляться новые аргументы. 
// сравнения критериев аргументов метода сопоставимы правилам сравнения критериев CriteriaPropertyType
			arguments:[
				{
					types:'number'
				},
				{
					types:'number'
				}
			],
// сравнения критериев возвращаемого значения метода сопоставимы правилам сравнения критериев CriteriaPropertyType
			return:{
				types:'number'
			}
			 
		}
	}
}
MyInterface2.isInterface=true;
InterfaceManager.extendInterfaces(MyInterface2);
```

#### Критерии реактивного свойства (шаблон CriteriaReactType)

```js
class MyInterface{
	get react(){ // шаблон CriteriaPropertyType
		return:{
			types:['number','string']
		} 
	}
	set react(v){ // шаблон CriteriaPropertyType
		return{
				types:'number'
			} 
		}
	}
	get react2(){ // шаблон CriteriaMethodType {return:{}}
		return{
			return:{
				types:'number'
			} 
		}
	}
	set react2(v){ // шаблон CriteriaMethodType {arguments:[{}]}
		return{
			arguments:[{
				types:'number'
			}] 
		}
	}
	set react3(value){ // альтернативная установка критериев set
		value.types=['number'];
	}
}
MyInterface.isInterface=true;
class MyInterface2 extends MyInterface{
	//   если get обьявлен в родительском Интерфейсе, то должен быть обьявлени get в дочернем интерфейсе, иначе запрещено обьявлять
	//   если set обьявлен в родительском Интерфейсе, то должен быть обьявлени  set в дочернем интерфейсе,  иначе запрещено обьявлять
	get react(){ // шаблон CriteriaPropertyType
	 // переопределяем get
		return:{
			types:'number'
		} 
	}
	set react(v){ // шаблон CriteriaPropertyType
	// переопределяем set 
		return {
				types:'number'
			} 
		}
	}
}
MyInterface2.isInterface=true;
InterfaceManager.extendInterfaces(MyInterface2);
```
### Правила  объединения критериев при наследовании Интерфейса. 



##  Подключение и Отключение интерфейсов.

По своей сути Интерфейс в отлаженном коде - это Излишняя опция. 
Написание и применение  Интерфейсов необходима при разработке кода.
Поэтому данный компонент разработан таким образом чтобы была возможность Интерфейсы убирать из кода.
 
### Примеры подключения отключения интерфейсов.

```js
 // export_modules.js
// подключение Менеджера интерфейсов
import {InterfaceManager} from './lib/Interfaces/InterfaceManager.js';


// Обьявление интерфейсов

import {MyInterface} from './Interfaces/MyInterface.js';  
import {MyInterface2} from './Interfaces/MyInterface2.js';
Object.assign(window,{MyInterface,MyInterface2});// глобальное обьявление


// Импорт рабочих классов


import {MyClass} from './core/MyClass.js';
import {MyClass2} from './core/MyClass2.js';
import {MyClass3} from './core/MyClass2.js';

// Наследование интерфейсов

InterfaceManager.expendInterfaces(MyClass,MyInterface);
InterfaceManager.freezePropСlass(MyClass,MyInterface2);

InterfaceManager.implementInterfaces(MyClass2,MyInterface2);
InterfaceManager.freezePropСlass(MyClass2);

InterfaceManager.implementInterfaces(MyClass3);
InterfaceManager.freezePropСlass(MyClass3);


// экспорт классов. 
Object.assign(window,{MyClass,MyClass2});// глобальное обьявление
export {MyClass,MyClass2};
```

При прямом наследовании интерфейсов	`class MyClass extends MyInterface{} `   исключить класс интерфейса можно только редактированием кода.  Чтобы не редактировать код, можно интерфейс заменить на пустой класс. 

```js
 /* export_interfaces.js */

// productions
 // export class MyInterface3 {} // если 

// developers
import {MyInterface3} from './Interfaces/MyInterface.js';  
export MyInterface3;

```

```js
/* ./core/MyClass3.js */
import {MyInterface3} from '/export_interfaces.js';

class MyClass3 extends  MyInterface3 {
	
}
```
