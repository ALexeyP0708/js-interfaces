import {CriteriaPropertyType,InterfaceError,InterfaceTypeError} from './../../export.js';


QUnit.module( 'Class CriteriaPropertyType');
QUnit.test('test methods CriteriaPropertyType',function(assert){

    let criteria=Object.create(CriteriaPropertyType.prototype,{
        types:{
            enumerable:true,
            configurable:true,
            writable:true,
            value:['mixed'],
        },
        includes:{
            enumerable:true,
            configurable:true,
            writable:true,
            value:[]
        },
        excludes:{
            enumerable:true,
            configurable:true,
            writable:true,
            value:[]
        },
        options:{
            enumerable:true,
            configurable:true,
            writable:true,
            value:{}
        }
    });
    class A{};
    class B extends A{};


    // initOptions
    {
        let options={entryPoints:['test']};
        criteria.initOptions(options);
        let match=criteria.options!==options
                    &&options.entryPoints[0]==='test';
        assert.ok(match,'initOptions');

    }
    // initTypes
    {
        let types=['mixed','number',A,null,undefined];
        criteria.initTypes(types);
        assert.deepEqual(criteria.types,['mixed'],'initTypes');
        types=['number',A,null,undefined];
        criteria.initTypes(types);
        let match=[
            'number',
            A,
            'null',
            'undefined'
        ];
        assert.ok(criteria.types!==types,'initTypes 2');
        assert.deepEqual(criteria.types,match,'initTypes 3');

    }

    // instanceOf
    {
        class C{}; //  вдобавок тесты по интерфейсам как будет готов метод.
        let match=criteria.instanceOf(A,A)&&criteria.instanceOf(new A,A)&&criteria.instanceOf(B,A)&&criteria.instanceOf(new B,A)
            &&!criteria.instanceOf(C,A) &&!criteria.instanceOf(new C,A) && !criteria.instanceOf(10,A);
        assert.ok(match,'instanceOf');
    }

    // instanceOfInterface

    {

    }

    // validateType

    {
        criteria.validateType(1);
        criteria.validateType(A);
        criteria.validateType(new A);
        criteria.validateType(B);
        criteria.validateType(new B);
        criteria.validateType(null);
        criteria.validateType(undefined);
        assert.ok(true,'validateType');

        assert.throws(function(){
            criteria.validateType(new class C{});
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateType');

        assert.throws(function(){
            criteria.validateType(class C{});
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateType 2');

        assert.throws(function(){
            criteria.validateType('1');
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateType 3');
    }

    // initIncludes

    {
        criteria.initIncludes([10,null,undefined,new A,new B,A,B]);
        assert.ok(true,'initIncludes');
        assert.throws(function(){
            criteria.initIncludes(['11']);
        },function(e){
            return e instanceof InterfaceError;
        },'throw initIncludes');
        assert.throws(function(){
            criteria.initIncludes([10, class C{}]);
        },function(e){
            return e instanceof InterfaceError;
        },'throw initIncludes');
        criteria.initIncludes([10,null,undefined,A]);
    }
    // validateInIncludes

    {
        criteria.validateInIncludes(10);
        criteria.validateInIncludes(null);
        criteria.validateInIncludes(undefined);
        criteria.validateInIncludes(new A);
        criteria.validateInIncludes(A);
        criteria.validateInIncludes(new B);
        criteria.validateInIncludes(B);
        assert.ok(true,'validateInIncludes');
        assert.throws(function(){
            criteria.validateInIncludes(11);
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateInIncludes');
    }
    // validateInValues

    {
        criteria.validateInValues(10,criteria.includes);
        criteria.validateInValues(null,criteria.includes);
        criteria.validateInValues(undefined,criteria.includes);
        criteria.validateInValues(new A,criteria.includes);
        criteria.validateInValues(A,criteria.includes);
        criteria.validateInValues(new B,criteria.includes);
        criteria.validateInValues(B,criteria.includes);
        assert.ok(true,'validateInValues');
        assert.throws(function(){
            criteria.validateInValues(11,criteria.includes);
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateInValues');
    }

    // initExcludes

    {
        criteria.initExcludes([10,null,undefined,new A,new B,A,B]);
        assert.ok(true,'initExcludes');
        assert.throws(function(){
            criteria.initExcludes(['11']);
        },function(e){
            return e instanceof InterfaceError;
        },'throw initExcludes');
        assert.throws(function(){
            criteria.initExcludes([10, class C{}]);
        },function(e){
            return e instanceof InterfaceError;
        },'throw initExcludes 2');
        criteria.initExcludes([11,B]);
    }

    // validateExcludes

    {
        criteria.validateInExcludes(12);
        criteria.validateInExcludes(null);
        criteria.validateInExcludes(undefined);
        criteria.validateInExcludes(new A);
        criteria.validateInExcludes(A);
        assert.ok(true,'validateInExcludes');
        assert.throws(function(){
            criteria.validateInExcludes(11);
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateInExcludes');
        assert.throws(function(){
            criteria.validateInExcludes(B);
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateInExcludes 2');
        assert.throws(function(){
            criteria.validateInExcludes(new B);
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateInExcludes 3');
    }
    // validate
    {
        class C extends A{};
        class D extends B{};
        // initIncludes [10,null,undefined,A]
        criteria.initExcludes([10, B]);
        let match= criteria.validate(C)
        && criteria.validate(new C)
        && criteria.validate(null)
        && criteria.validate(undefined);
        assert.ok(match,'validate');
        assert.throws(function(){
            criteria.validate(D);
        },function(e){
            return e instanceof InterfaceError;
        },'throws validate');
        assert.throws(function(){
            criteria.validate(new D);
        },function(e){
            return e instanceof InterfaceError;
        },'throws validate 2');
        assert.throws(function(){
            criteria.validate(10);
        },function(e){
            return e instanceof InterfaceError;
        },'throws validate 3');
    }

    // compare
    {

        {
            let criteria2=new CriteriaPropertyType({

                types:[A],
                includes:[A],
                excludes:[B]
            });
            criteria.compare(criteria2);
            assert.ok(true,'compare');
        }
        {
            let criteria2=new CriteriaPropertyType({
                types:[class C{}],
            });
            assert.throws(function(){
                criteria.compare(criteria2);
            },function(e){
                return e instanceof InterfaceError;
            },'throw compare [check types]');
        }
        {
            criteria.initIncludes([B]);
            class C extends A{}
            let criteria2=new CriteriaPropertyType({
                types:[A],
                includes:[C],
                excludes:[B],
            });
            assert.throws(function(){
                criteria.compare(criteria2);
            },function(e){
                return e instanceof InterfaceError;
            },'throw compare [check includes]');
        }
        {
            class C extends A{}
            let criteria2=new CriteriaPropertyType({
                types:[A],
                includes:[B],
                excludes:[C],
            });

            assert.throws(function(){
                criteria.compare(criteria2);
            },function(e){
                console.log(e);
                return e instanceof InterfaceError;
            },'throw compare [check excludes]');
        }
    }
});
/*
QUnit.test('Передача параметров в конструктор',function(assert){
    assert.throws(
        function(){
            new CriteriaPropertyType('other_type');
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Ошибка-неустановленный тип'
    );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('undefined',['sfsdfsfsdf']);
            return criteria.typeof==='undefined'&&criteria.values.length===0

        })(),
        'Тип - undefined'
        );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('boolean',['sfsdfsfsdf']);
            return criteria.typeof==='boolean'&&criteria.values.length===0

        })(),
        'Тип - boolean'
    );

    assert.ok(
        (()=>{
            new CriteriaPropertyType('number',[1,undefined,null]);// good
            return true;
        })(),
        'Тип - number'
    );
    assert.throws(
        function(){
            new CriteriaPropertyType('number',[1,'1']);
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Ошибка, Тип - number, неверный тип элемента в values'
    );

    assert.ok(
        (()=>{
            new CriteriaPropertyType('string',['hello','1']);// good
            return true;
        })(),
        'Тип - string'
    );
    assert.throws(
        function(){
            new CriteriaPropertyType('string',[1,'1']);
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Ошибка, Тип - string, неверный тип элемента в values'
    );

    assert.ok(
        (()=>{
            new CriteriaPropertyType('symbol',[Symbol.for('hello'),undefined,null]);// good
            return true;
        })(),
        'Тип - symbol'
    );
    assert.throws(
        function(){
            new CriteriaPropertyType('symbol',[Symbol.for('hello'),'hello']);// bad
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Ошибка, Тип - symbol, неверный тип элемента в values'
    );

    assert.ok(
        (()=>{
            new CriteriaPropertyType('function',[function(){},undefined,null]);// good
            return true;
        })(),
        'Тип - function'
    );
    assert.throws(
        function(){
            new CriteriaPropertyType('function',[function(){},'hello']); //bad
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Ошибка, Тип - function, неверный тип элемента в values'
    );
    assert.ok(
        (()=>{
            class A{}
            new CriteriaPropertyType('class',[A,undefined,null]);// good
            return true;
        })(),
        'Тип - class'
    );
    assert.throws(
        function(){
            class A{}
            new CriteriaPropertyType('class',[A,'hello']); //bad
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Ошибка, Тип - class, неверный тип элемента в values'
    );
    assert.ok(
        (()=>{
            class A{};
            new CriteriaPropertyType('object',[A,Array,Object,undefined,null]);// good
            return true;
        })(),
        'Тип - object'
    );
    assert.throws(
        function(){
            class A{};
            new CriteriaPropertyType('object',[A,'hello']);// bad
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Ошибка, Тип - object, неверный тип элемента в values'
    );

    assert.ok(
        (()=>{
            class A{};
            new CriteriaPropertyType('mixed',['1',1,function(){},Symbol.for('hello'),A,undefined,null]);// good
            return true;
        })(),
        'Тип - mixed'
    );
    assert.throws(
        function(){
            class A{};
            new CriteriaPropertyType('mixed',['1',1,function(){},Symbol.for('hello'),A,undefined,null,{}]);// bad
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Ошибка, Тип - mixed, неверный тип элемента в values'
    );
});
QUnit.test('Валидация',function(assert){
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('undefined');
            criteria.validate(undefined);
            return true
        })(),
        'Тип - undefined'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('undefined');
            criteria.validate('qwer');
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - undefined Ошибка валидации'
    );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('boolean');
            criteria.validate(true);
            return true
        })(),
        'Тип - boolean'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('boolean');
            criteria.validate('qwer');
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - boolean Ошибка валидации'
    );


    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('number');
            criteria.validate(1);
            return true
        })(),
        'Тип - number'
    )
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('number',[undefined,null]);
            criteria.validate(1);
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - number + undefined и null'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('number');
            criteria.validate('1');
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - number Ошибка валидации'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('number');
            criteria.validate(undefined);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - number Ошибка валидации (undefined)'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('number');
            criteria.validate(null);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - number Ошибка валидации (null)'
    );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('number',[1,2,undefined,null]);
            criteria.validate(2);
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - number значение из values'
    );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('number',[undefined,null]);            criteria.validate(2);
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - number + undefined и null'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('number',[1,2,undefined,null]);
            criteria.validate(3);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - number  значение из values. Ошибка валидации.'
    );

    //--------------
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('string');
            criteria.validate('1');
            return true
        })(),
        'Тип - string'
    );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('string',[undefined,null]);
            criteria.validate('1');
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - string + undefined и null'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('string');
            criteria.validate(1);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - string Ошибка валидации'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('string');
            criteria.validate(undefined);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - string Ошибка валидации (undefined)'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('string');
            criteria.validate(null);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - string Ошибка валидации (null)'
    );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('string',['1','2',undefined,null]);
            criteria.validate('2');
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - string значение из values'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('string',['1','2',undefined,null]);
            criteria.validate('3');
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - string  значение из values. Ошибка валидации.'
    );

    //-----------
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('symbol');
            criteria.validate(Symbol.for('qwer'));
            return true;
        })(),
        'Тип - symbol'
    );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('symbol',[undefined,null]);
            criteria.validate(Symbol.for('qwer'));
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - symbol + undefined и null'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('symbol');
            criteria.validate(1);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - symbol Ошибка валидации'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('symbol');
            criteria.validate(undefined);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - symbol Ошибка валидации (undefined)'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('symbol');
            criteria.validate(null);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - symbol Ошибка валидации (null)'
    );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('symbol',[Symbol.for('1'),Symbol.for('2'),undefined,null]);
            criteria.validate(Symbol.for('2'));
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - symbol значение из values'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('symbol',[Symbol.for('1'),Symbol.for('2'),undefined,null]);
            criteria.validate(Symbol.for('3'));
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - symbol  значение из values. Ошибка валидации.'
    );


    //-----------
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('function');
            criteria.validate(function(){});
            return true
        })(),
        'Тип - function'
    );
    assert.ok(
        (()=>{
            let criteria=new CriteriaPropertyType('function',[undefined,null]);
            criteria.validate(function(){});
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - function + undefined и null'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('function');
            criteria.validate(1);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - function Ошибка валидации'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('function');
            criteria.validate(undefined);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - function Ошибка валидации (undefined)'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('function');
            criteria.validate(null);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - function Ошибка валидации (null)'
    );
    assert.ok(
        (()=>{
            function test(){};
            let criteria=new CriteriaPropertyType('function',[test,undefined,null]);
            criteria.validate(test);
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - function  значение из values'
    );
    assert.throws(
        function(){
            function test(){};
            let criteria=new CriteriaPropertyType('function',[test,undefined,null]);
            criteria.validate(function(){});
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - function  значение из values. Ошибка валидации.'
    );

    //----------
    assert.ok(
        (()=>{
            class A{};
            let criteria=new CriteriaPropertyType('class');
            criteria.validate(A);
            return true
        })(),
        'Тип - class'
    );
    assert.ok(
        (()=>{
            class A{};
            let criteria=new CriteriaPropertyType('class',[undefined,null]);
            criteria.validate(A);
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - class + undefined и null'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('class');
            criteria.validate(1);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - class Ошибка валидации'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('class');
            criteria.validate(undefined);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - class Ошибка валидации (undefined)'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('class');
            criteria.validate(null);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - class Ошибка валидации (null)'
    );
    assert.ok(
        (()=>{
            class A{}
            class B extends A{}
            class C extends B{}
            let criteria=new CriteriaPropertyType('class',[A,undefined,null]);
            criteria.validate(C);
            criteria.validate(B);
            criteria.validate(A);
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - class  значение из values'
    );
    assert.throws(
        function(){
            class A{}
            class B{}
            let criteria=new CriteriaPropertyType('class',[A,undefined,null]);
            criteria.validate(B);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - class  значение из values. Ошибка валидации.'
    );


    //------------
    assert.ok(
        (()=>{
            class A{};
            let criteria=new CriteriaPropertyType('object');
            criteria.validate(new A);
            return true
        })(),
        'Тип - object'
    );
    assert.ok(
        (()=>{
            class A{};
            let criteria=new CriteriaPropertyType('object',[undefined,null]);
            criteria.validate(new A);
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - class + undefined и null'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('object');
            criteria.validate(1);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - object Ошибка валидации'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('object');
            criteria.validate(undefined);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - object Ошибка валидации (undefined)'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaPropertyType('object');
            criteria.validate(null);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - object Ошибка валидации (null)'
    );
    assert.ok(
        (()=>{
            class A{}
            class B extends A{}
            class C extends B{}
            let criteria=new CriteriaPropertyType('object',[A,undefined,null]);
            criteria.validate(new C);
            criteria.validate(new B);
            criteria.validate(new A);
            criteria.validate(undefined);
            criteria.validate(null);
            return true;
        })(),
        'Тип - object  значение из values'
    );
    assert.throws(
        function(){
            class A{}
            class B{}
            let criteria=new CriteriaPropertyType('object',[A,undefined,null]);
            criteria.validate(new B);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - object  значение из values. Ошибка валидации.'
    );

    //------------
    assert.ok(
        (()=>{
            class A{};
            let criteria=new CriteriaPropertyType('mixed');
            criteria.validate(new A);
            criteria.validate('1');
            criteria.validate(1);
            criteria.validate(function(){});
            return true
        })(),
        'Тип - mixed'
    );
    assert.ok(
        (()=>{
            class A{};
            class B extends A{}
            function test(){};
            let criteria=new CriteriaPropertyType('mixed',[1,'2',Symbol.for('qwer'),test,A]);
            criteria.validate(1);
            criteria.validate('2');
            criteria.validate(Symbol.for('qwer'));
            criteria.validate(test);
            criteria.validate(B);
            criteria.validate(new B);
            return true;
        })(),
        'Тип - mixed  значение из values.'
    );
    assert.throws(
        function(){
            class A{}
            class B{}
            function test(){};
            let criteria=new CriteriaPropertyType('mixed',[1,'2',Symbol.for('qwer'),test,A]);
            criteria.validate(new B);
        },
        function (e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Тип - object  значение из values. Ошибка валидации.'
    );
});
QUnit.test('Расширение критериев ',function(assert){
    let criteria= new CriteriaPropertyType('number',[1,2]);
    let criteria2= new CriteriaPropertyType('number',[2,3]);
    let match={
        type:'property',
        typeof:'number',
        values:[2,3,1],
        options:criteria2.options
    }
    criteria2.expand(criteria);
    assert.deepEqual(Object.assign({},criteria2),match,'Расширение критериев');
    let criteria3= new CriteriaPropertyType('string',['2','3']);
    assert.throws(function(){
        criteria3.expand(criteria2);
    },function(e){
        return e instanceof InterfaceError && e.type==='ErrorType'
    },'Типы не соответствуют в критериях');
});

*/