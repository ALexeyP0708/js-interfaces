import {CriteriaPropertyType,CriteriaMethodType,InterfaceTypeError,InterfaceError} from './../../export.js';

QUnit.module( 'Class CriteriaMethodType');

QUnit.test('Передача параметров в конструктор',function(assert){

    {
        let criteria=new CriteriaMethodType([
            {
                typeof:'number',
                values:[1,undefined,null]
            }
        ],{ typeof:'undefined'},{});
        let match={
            arguments:[
                new CriteriaPropertyType('number',[1,undefined,null])
            ],
            return:new CriteriaPropertyType('undefined'),
            options:Object.assign({},criteria.options),
            type:'method'
        };
        assert.deepEqual(Object.assign({},criteria),match,'аргумент  1  тип number, возвращает undefined');
    }
    {
        let criteria=new CriteriaMethodType({
            arguments:[
                {
                    typeof:'number',
                    values:[1,undefined,null]
                }
            ],
            return:{
                typeof:'undefined'
            }
        });
        let match={
            arguments:[
                new CriteriaPropertyType('number',[1,undefined,null])
            ],
            return:new CriteriaPropertyType('undefined'),
            options:Object.assign({},criteria.options),
            type:'method'
        };
        assert.deepEqual(Object.assign({},criteria),match,'аргумент  1  тип number, возвращает undefined');
    }
});
QUnit.test('Валидация',function(assert){
    assert.ok(
        (function(){
            let criteria=new CriteriaMethodType([
                {
                    typeof:'number'
                }
            ]);
            criteria.validateArguments([1]);
            return true;
        })(),
        'Ожидание аргумента типа number'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaMethodType([
                {
                    typeof:'number'
                }
            ]);
            criteria.validateArguments([]);
            return true
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Неверный тип аргумента, ожидание аргумента типа number'
    );
    assert.ok(
        (function(){
            let criteria=new CriteriaMethodType([
                {
                    typeof:'number'
                }
            ]);
            criteria.validateArguments([1]);
            return true;
        })(),
        'Ожидание возвращаемого значения типа number'
    );
    assert.throws(
        function(){
            let criteria=new CriteriaMethodType([
                {
                    typeof:'number'
                },
                {
                    typeof:'number'
                }
            ]);
            criteria.validateArguments([]);
        },
        function(e){
            return e instanceof InterfaceError && e.type==='ErrorType'
        },
        'Неверный тип возвращаемого значения, ожидание возвращаемого значения типа number'
    );
});
QUnit.test('Расширение критериев ',function(assert){
    let criteria= new CriteriaMethodType(
            [
                {typeof:'number',values:[]},
                {typeof:'string',values:[]}
            ],
            {
                typeof:'number',
                values:[],
            }
    );
    let criteria2= new CriteriaMethodType(
        [
            {typeof:'number',values:[1]},
            {typeof:'string',values:['1']},
            {typeof:'string',values:['1']}
        ],
        {
            typeof:'number',
            values:[1],
        }
    );
    criteria2.expand(criteria);
    let match={
        type:'method',
        options:criteria2.options,
        arguments:[
            new CriteriaPropertyType('number',[1],criteria2.options),
            new CriteriaPropertyType('string',['1'],criteria2.options),
            new CriteriaPropertyType('string',['1'],criteria2.options)
        ],
        return:new CriteriaPropertyType('number',[1],criteria2.options),
    };
    assert.deepEqual(Object.assign({},criteria2),match,'Обьеденение методов');
        {
            let criteria3= new CriteriaMethodType(
                [
                    //new CriteriaPropertyType('string',[],criteria.options)
                ],
                {
                    typeof:'number',
                    values:[1],
                }
            );
            assert.throws(
                function(){
                    criteria3.expand(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError && e.type==='ErrorType'
                },
                'Отсутствие аргументов'
            );
        }
        {
            let criteria3= new CriteriaMethodType(
                [
                    new CriteriaPropertyType('string',[],criteria2.options), // error
                    new CriteriaPropertyType('number',[],criteria2.options), // error
                    new CriteriaPropertyType('number',[],criteria2.options), // error
                ],
                {
                    typeof:'number',
                    values:[1],
                }
            );
            assert.throws(
                function(){
                    criteria3.expand(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError && e.type==='ErrorType'
                },
                'Неверныые типы аргументов'
            );
        }
        {
            let criteria3= new CriteriaMethodType(
                [
                    new CriteriaPropertyType('number',[],criteria2.options),
                    new CriteriaPropertyType('string',[],criteria2.options),
                    new CriteriaPropertyType('string',[],criteria2.options),
                ],
                {
                    typeof:'string',
                    values:[],
                }
            );
            assert.throws(
                function(){
                    criteria3.expand(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError && e.type==='ErrorType'
                },
                'Неверныый тип возвращаемого значения'
            );
        }

});
/*
QUnit.test('set {CriteriaMethodType}.arguments',function(assert){
/!*    assert.throws(
        function(){
            new CriteriaMethodType({});
        },
        function(error){
            return error instanceof InterfaceTypeError && error.type==='badArgumentMethod';
        },
        'checking arguments  bad type'
    );*!/
    assert.throws(
        function(){
            new CriteriaMethodType([{typeof:'object',values:['a']}]);
        },
        InterfaceError,
        'checking bad arguments'
    );
    class A{};
    class B{};
    let criteria=new CriteriaMethodType([
        {
            typeof:'object',
            values:[
                A
            ]
        },
        {
            typeof:'object',
            values:[
                B
            ]
        }
    ]);
    assert.ok((criteria.arguments[0] instanceof CriteriaPropertyType) ,'checking element class for arguments criteria');
    let match=[
        new CriteriaPropertyType('object',[
            A
        ]),
        new CriteriaPropertyType('object',[
            B
        ]),
    ];
    assert.deepEqual(criteria.arguments,match,'checking  arguments criteria ');
});
QUnit.test('set {CriteriaMethodType}.return',function(assert){
    assert.throws(
        function(){
            new CriteriaMethodType([],'qwr');
        },
        function(error){
            return error instanceof InterfaceTypeError && error.type==='badArgumentMethod';
        },
        'checking return  bad type'
    );
    assert.throws(
        function(){
            new CriteriaMethodType([],{typeof:'object',values:['a']});
        },
        InterfaceError,
        'checking bad return criteria'
    );
    class A{};
    let criteria=new CriteriaMethodType([],
        {
            typeof:'object',
            values:[
                A
            ]
        }
    );
    assert.ok((criteria.return instanceof CriteriaPropertyType) ,'checking element class for return criteria');
    let match=
        new CriteriaPropertyType('object',[
            A
        ]);
    assert.deepEqual(criteria.return,match,'checking  return criteria ');
});
*/
