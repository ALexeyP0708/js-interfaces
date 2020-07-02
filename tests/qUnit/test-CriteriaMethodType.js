import {CriteriaPropertyType,CriteriaMethodType,InterfaceError} from '../../src/export.js';

QUnit.module( 'Class CriteriaMethodType');
QUnit.test('test methods CriteriaMethodType',function(assert){
    let criteria = Object.create(CriteriaMethodType.prototype,{
        arguments:{
            enumerable:true,
            writable:true,
            value:[]
        },
        return:{
            enumerable:true,
            writable:true,
            value:{}
        },
        options:{
            enumerable:true,
            writable:true,
            value:{}
        }
    });
    criteria.initOptions({});
    // init Arguments
    {
        criteria.initArguments([
            {
                types:['number',undefined],
                includes:[1,2,3],
                excludes:[10,11,12]
            },
            {
                types:['string']
            }
        ]);
        assert.ok(true,'initArguments');
        assert.throws(function(){
            criteria.initArguments({});
        },function(e){
            return e instanceof InterfaceError;
        },'throw initArguments');

    }

    // initReturn

    {
        criteria.initReturn(
            {
                types:['number',undefined]
            });
        assert.ok(true,'initArguments');
    }

    // validateArguments
    {
        criteria.validateArguments([1,'a']);
        assert.ok(true,'validateArguments');
        assert.throws(function(){
            criteria.validateArguments([1]);
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateArguments');
        assert.throws(function(){
            criteria.validateArguments(['11',10]);
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateArguments 2');
    }

    // validateReturn
    {
        criteria.validateReturn(10);
        assert.ok(true,'validateReturn');
        assert.throws(function(){
            criteria.validateReturn(class Z{});
        },function(e){
            return e instanceof InterfaceError;
        },'throw validateReturn');

    }

    // compare
    {
        {
            let criteria2 = new CriteriaMethodType({
                arguments: [
                    {
                        types:['number'],
                        includes:[1],
                        excludes:[10,11,12]
                    },
                    {
                        types:['string']
                    }
                ],
                return:{
                    types:['undefined']
                }
            });
            criteria.compare(criteria2);
            assert.ok(true,'compare');
        }


        {
            let criteria2 = new CriteriaMethodType({
                arguments: [
                    {
                        types:['number'],
                    },
                    {
                        types:['string']
                    }
                ],
                return:{}
            });
            assert.throws(function(){
                criteria.compare(criteria2);
            },function(e){
                return e instanceof InterfaceError
            },'throw compare');
        }
    }

    // expand

    {
        class A{}
        let criteria2 = new CriteriaMethodType({
            arguments: [
                {
                    types:['number',A],
                    includes:[100],
                    excludes:[200]
                },
                {
                    types:['string']
                },
                {
                    types:['string']
                }
            ],
            return:{
                types:'undefined'
            }
        });
        criteria.expand(criteria2);
        let match={
            arguments:[
                new CriteriaPropertyType({
                    types:[
                        'number',
                        'undefined',
                        A
                    ],
                    includes:[1,2,3,100],
                    excludes:[10,11,12,200],
                    options:{
                        entryPoints:criteria.arguments[0].options.entryPoints,
                        owner:criteria.arguments[0].options.owner
                    }
                }),
                new CriteriaPropertyType({
                    types:[
                        'string'
                    ],
                    options:{
                        entryPoints:criteria.arguments[1].options.entryPoints,
                        owner:criteria.arguments[1].options.owner
                    }
                }),
                new CriteriaPropertyType({
                    types:[
                        'string'
                    ],
                    options:{
                        entryPoints:criteria.arguments[2].options.entryPoints,
                        owner:criteria.arguments[2].options.owner
                    }
                }),
            ],
            return :
                new CriteriaPropertyType({
                    types:['number',undefined],
                    options:{
                        entryPoints:criteria.return.options.entryPoints
                        ,owner:criteria.return.options.owner
                    }
                }),

        };
        let result={};
        for (let prop of Object.getOwnPropertyNames(criteria)){
            if(!['arguments','return'].includes(prop)){continue;}
            result[prop]=criteria[prop];

        }
        assert.deepEqual(result,match,'expand');
    }
    assert.ok(true);
});
