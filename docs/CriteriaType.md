
Критерии - это классы которы определяют правила для каждого класса. 
Благодоря им Менеджер интерфейсов может устанавливать правила для классов и устанавливать для них поведение.
Их не обязательно знать, но с практической точки зрения помогут разобраться в правильности написания интерфейсов. 

##Критерии для свойств класса.
Критерии для свойств устанавливаются через класс CriteriaPropertyType.  
```js
let criteria= new CriteriaPropertyType(type_of,values,options);
//type_of - устанавливает тип свойства undefined|object|boolean|number|string|symbol|function|class|mixed
//values [] - массив, устанавливает какие значения могут использоваться в свойстве. 
// options {} - обьект дополнительных опций.
//или
let criteria= new CriteriaPropertyType({typeof:type_of,values,options});

```


### Правила обьявления 
```js

class A{}
A.isInterface=true;
// вариант 1
A.prototype.prop1={
  typeof:'number',
  values:[1,2,null,undefined],
  //options:{} указывать если необходимы какие либо расширения
};
// вариант 2
A.prototype.prop2=new CriteriaPropertyType('number',[1,2,null,undefined]); // возможно Deprecated в рамках оптимизации
// вариант 3
A.prototype.prop2=new CriteriaPropertyType({typeof:'number',values:[null,undefined],options:{}});// предпочтительный
```
Проверка на конфликты происходит после наследования класса и запуска для него проверок. 
Будут проведены проверки на соответствие критериям при наследовании. 
К сожалению свойства не поддаются проверке при изменении их значений в  обьекте реализующий соответствующий класс.
Но такие проверки можно установить через реактивные свойства  (getter/setter) (см CriteriaReactType).
Также свойства являющиеся методами могут проверять входящие параметры и возвращаемые значения (см CriteriaMethodType).. 
За валидацию данных для свойства отвечает метод
```js
criteria.validate(data,'errorPoint'); // если не пройдет валидацию , то выкинет ошибку. Ничего не возвращает
```
который запустится после наследования класса и запуска для него проверок.
### Значения 
```js
   let type_of='undefined';
   // разрешенные значения - только undefined.
   let values =[]; // не имеет смысла в установке 
   let criteria= new CriteriaPropertyType(type_of,values);
     criteria.validate(undefined,'point_test'); // success
     criteria.validate(1,'point_test'); // error
```
#### bool тип
```js
  let type_of='boolean';
  // разрешенные значения - только true|false.
  let values =[]; // не имеет смысла в установке 
  let criteria= new CriteriaPropertyType(type_of,values);
  criteria.validate(true,'point_test'); // success
  criteria.validate(1,'point_test'); // error
```
#### number тип
```js
    let type_of='number';
    // разрешенные значения - только  числа.
    let values =[null,undefined]; //    только числа или null или undefined
    let criteria= new CriteriaPropertyType(type_of,values);
    criteria.validate(100,'point_test'); // success
    criteria.validate(null,'point_test'); // success
    
    let values =[1,null,undefined]; //только 1 или null или undefined
    let criteria= new CriteriaPropertyType(type_of,values);
    criteria.validate(1,'point_test'); // success
    criteria.validate(null,'point_test'); // success
    criteria.validate(100,'point_test'); // error
```
#### string тип
```js
    let type_of='string';
    // разрешенные значения - только  числа.
    let values =[null,undefined]; //    только строки или null или undefined
    let criteria= new CriteriaPropertyType(type_of,values);
    criteria.validate('string','point_test'); // success
    criteria.validate(null,'point_test'); // success
    criteria.validate(100,'point_test'); // error
    let values =['string',null,undefined]; //только 1 или null или undefined
    let criteria= new CriteriaPropertyType(type_of,values);
    criteria.validate('string','point_test'); // success
    criteria.validate(null,'point_test'); // success
    criteria.validate('string2','point_test'); // error
```



### Опции
```js
  let options={
    errPoint:'MyErrorPoint', // точка возникновения ошибки. ?? Возможно deprecated
    descriptors:{}, //Не реализовано.  Дескрипторы для свойства
    deprecated:false, // Не реализовано.  Выкидывает warn-сообщение о каждом использовании
  }; 
```
  
```js
let type_of='mixed'; // undefined|object|boolean|number|string|symbol|function|class|mixed
let values=[1,'string',true]; // ...
let criteria= new CriteriaPropertyType(type_of,values);
```
#Критерии для методов класса.
#Критерии для реактивных свойств класса.