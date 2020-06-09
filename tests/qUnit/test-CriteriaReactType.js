import {CriteriaReactType,InterfaceTypeError,InterfaceError,CriteriaMethodType,CriteriaPropertyType} from "../../export.js";
QUnit.module( 'Class CriteriaReactType');
QUnit.test('Передача параметров в конструктор ',function(assert){

    {
        let criteria=new CriteriaReactType({
            typeof:'number'
        });
        let match={
            get:new CriteriaMethodType([],{
              typeof:'number'
            }),
            type:'react',
            options:Object.assign({},criteria.options)
        };
        assert.deepEqual(Object.assign({},criteria),match,'get - тип number');
    }

    {
        let criteria=new CriteriaReactType(undefined,{
            typeof:'number'
        });
        let match={
            set:new CriteriaMethodType([{
                typeof:'number'
            }]),
            type:'react',
            options:Object.assign({},criteria.options)
        };
        assert.deepEqual(Object.assign({},criteria),match,'set - тип number');

    }

    {
        let criteria=new CriteriaReactType({
            get:{
                typeof:'number'
            },
            set:{
                typeof:'number'
            }
        });
        let match={
            set:new CriteriaMethodType([{
                typeof:'number'
            }]),
            get:new CriteriaMethodType([],{
                typeof:'number'
            }),
            type:'react',
            options:Object.assign({},criteria.options)
        };
        assert.deepEqual(Object.assign({},criteria),match,'get и set - типа number, альтернативная передача параметров');
    }
});
QUnit.test('Валидация',function(assert){
    // проверить валидацию get
    let criteria=new CriteriaReactType({
        get:{
            typeof:'number',
            values:[undefined]
        },
        set:{
            typeof:'number'
        }
    });
    assert.ok((function(){
        criteria.validateGet(4);
        criteria.validateGet(undefined);
        criteria.validateSet(5);
        return true;
    })(),'Успешная  валидация get и set');
    assert.throws(function(assert){
        criteria.validateGet('123');
        criteria.validateSet('123');
    },function(e){
        return e instanceof InterfaceError && e.type==='ErrorType'
    },'get и set тест на ошибки');
});
QUnit.test('Расширение критериев ',function(assert){
    let criteria=new CriteriaReactType({typeof:'number',values:[1]});
    let criteria2=new CriteriaReactType({typeof:'number',values:[2]},{typeof:'number',values:[2]});
    let match={
        type:'react',
        options:criteria2.options,
        get:new CriteriaMethodType([],{typeof:'number',values:[2,1]},criteria2.options),
        set:new CriteriaMethodType([{typeof:'number',values:[2]}],{},criteria2.options),
    };
    criteria2.expand(criteria);
    assert.deepEqual(Object.assign({},criteria2),match,'Расширение критериев');
    let criteria3=new CriteriaReactType({typeof:'string'},{typeof:'string'});
    assert.throws(function(){
        criteria3.expand(criteria2);
    },function(e){
        return e instanceof InterfaceError && e.type==='ErrorType'
    },'неверные типы');
});
/*
QUnit.test('Конструктор CriteriaReactType, установка параметров ',function(assert){
    assert.ok((()=>{
            let criteria=new CriteriaReactType({});
            return 'get' in criteria && !('set' in criteria);
        })()
        ,'Только get');
    assert.ok((()=>{
            let criteria=new CriteriaReactType({get:{}});
            return 'get' in criteria && !('set' in criteria);
        })()
        ,'Только get - альтернатива');
    assert.ok((()=>{
            let criteria=new CriteriaReactType(null,{});
            return 'set' in criteria && !('get' in criteria);
        })()
        ,'Только set');
    assert.ok((()=>{
            let criteria=new CriteriaReactType({set:{}});
            return 'set' in criteria && !('get' in criteria);
        })()
        ,'Только set - альтернатива');
    assert.ok((()=>{
            let criteria=new CriteriaReactType({get:{},set:{}});
            return 'set' in criteria && 'get' in criteria;
        })()
        ,'get и set - альтернатива');
    assert.throws(
        function(){
            new CriteriaReactType('qwer');
        },
        function(error){
            return error instanceof InterfaceTypeError && error.type==='badArgumentMethod';
        },
        'Ошибка не верный get параметр'
    );
    assert.throws(
        function(){
            new CriteriaReactType(undefined,'qwer');
        },
        function(error){
            return error instanceof InterfaceTypeError && error.type==='badArgumentMethod';
        },
        'Ошибка не верный set параметр'
    );
});*/
