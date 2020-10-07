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


    // static formatStrictSyntaxToObject
    
    {
        let result;
        let tpl={
            arguments:[],
            return:{
                types:['mixed'],
                includes:[],
                excludes:[],
                options:{
                    entryPoints:[
                        'not_defined',
                        'return'
                    ]
                },
            },

            options:{ 
                entryPoints:[
                    'not_defined'
                ]
            }
        };
        result=CriteriaMethodType.formatStrictSyntaxToObject({});
        assert.propEqual(result,Object.assign({},tpl),'formatExtendedSyntaxToObject 1');
        
        result=CriteriaMethodType.formatStrictSyntaxToObject({arguments:['string']});
        assert.propEqual(result,Object.assign({},tpl,{
            arguments:[
                {
                    types:['string'],
                    includes:[],
                    excludes:[],
                    options:{
                        entryPoints:["not_defined", "arguments[0]"]
                    }
                }]
        }),'formatExtendedSyntaxToObject 2');
        
        result=CriteriaMethodType.formatStrictSyntaxToObject({return:'string'});
        assert.propEqual(result,Object.assign({},tpl,{
            return:{
                types:['string'],
                includes:[],
                excludes:[],
                options:{
                    entryPoints:[
                        'not_defined',
                        'return'
                    ]
                }
            }
        }),'formatExtendedSyntaxToObject 3');



        result=CriteriaMethodType.formatStrictSyntaxToObject({return:{return:'string'}});
        assert.propEqual(result,Object.assign({},tpl,{
            return:{
                arguments:[],
                return:{
                    types:['string'],
                    includes:[],
                    excludes:[],
                    options:{
                        entryPoints:[
                            'not_defined',
                            'return.call()',
                            'return'
                        ]
                    }
                },
                options:{
                    entryPoints:[
                        'not_defined',
                        'return.call()'
                    ]
                }
                
            }
        }),'formatExtendedSyntaxToObject 4');
    }
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
            console.log(criteria);
            let criteria2 = new CriteriaMethodType({
                arguments: [
                    {
                        types:["number", "undefined"],
                        includes:[1,2,3],
                        excludes:[10,11,12]
                    },
                    {
                        types:['string']
                    }
                ],
                return:{
                    types:["number", "undefined"]
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

    
});
