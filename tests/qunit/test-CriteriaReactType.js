import {CriteriaReactType,InterfaceError,CriteriaMethodType} from "../../src/export.js";
QUnit.module( 'Class CriteriaReactType');
QUnit.test('test methods CriteriaReactType ',function(assert){
    let criteria=Object.create(CriteriaReactType.prototype,{
        get:{
            enumerable:true,
            configurable:true,
            writable:true,
            value:undefined
        },
        set:{
            enumerable:true,
            configurable:true,
            writable:true,
            value:undefined
        }
    });
    criteria.initOptions({});

    // initGet
    {
        criteria.initGet({
            types:['mixed']
        });
        let match={
            get:new CriteriaMethodType({return:{types:['mixed']}, options:criteria.getOptions()}),
            set:undefined,
            options:criteria.getOptions()
        };
        assert.deepEqual(Object.assign({},criteria),match,'initGet');
        match={
            get:new CriteriaMethodType({return:{types:['mixed']},options:criteria.getOptions()}),
            set:undefined,
            options:criteria.getOptions()
        };
        criteria.initGet();
        assert.deepEqual(Object.assign({},criteria),match,'initGet 2');
        match={
            get:new CriteriaMethodType({return:{types:['number']},options:criteria.getOptions()}),
            set:undefined,
            options:criteria.getOptions()
        };
        criteria.initGet({
            return:{
                types:['number']
            }
        });
        assert.deepEqual(Object.assign({},criteria),match,'initGet 3');

    }
    // initSet
    {
        criteria.initSet({
            types:['mixed']
        });
        let match={
            get:new CriteriaMethodType({return:{types:['number']},options:criteria.getOptions()}),
            set:new CriteriaMethodType({arguments:[{types:['mixed']}],options:criteria.getOptions()}),
            options:criteria.getOptions()
        };
        QUnit.dump.maxDepth=10;
        assert.propEqual(criteria,match,'initSet');

        match={
            get:new CriteriaMethodType({return:{types:['number']},options:criteria.getOptions()}),
            set:new CriteriaMethodType({arguments:[{types:['mixed']}],options:criteria.getOptions()}),
            options:criteria.getOptions()
        };
        criteria.initSet();
        QUnit.dump.maxDepth=10;
        assert.propEqual(criteria,match,'initSet 2');


        match={
            get:new CriteriaMethodType({return:{types:['number']},options:criteria.getOptions()}),
            set:new CriteriaMethodType({arguments:[{types:['number']}],options:criteria.getOptions()}),
            options:criteria.getOptions()
        };
        criteria.initSet({
            arguments:[{
                types:['number']
            }]
        });
        QUnit.dump.maxDepth=10;
        assert.propEqual(criteria,match,'initSet 3');

    }

    // validateGet
    {
        criteria.validateGet(10);
        assert.ok(true,'validateGet');
        assert.throws(function(){
            delete criteria.get;
            criteria.validateGet(10);
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateGet');
    }
    // validateSet
    {

        criteria.validateSet(10);
        assert.ok(true,'validateSet');
        assert.throws(function(){
            delete criteria.set;
            criteria.validateSet(10);
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateSet');
    }

    // compare
    {
        {
            let criteria=  new CriteriaReactType({
                get:{
                    types:['number']

                },
                set:{
                    types:['number']
                }
            });
            let criteria2= new CriteriaReactType({});
            assert.throws(function(){
                criteria.compare(criteria2);
            },function(e){
                return e instanceof InterfaceError;
            },'throw compare');
        }
        {
            let criteria=  new CriteriaReactType({
            });
            let criteria2= new CriteriaReactType({
                get:{
                    types:['number']

                },
                set:{
                    types:['number']
                }});
            assert.throws(function(){
                criteria.compare(criteria2);
            },function(e){
                return e instanceof InterfaceError;
            },'throw compare');
        }
    }
    assert.ok(true);
});
