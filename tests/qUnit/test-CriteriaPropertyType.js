import {CriteriaMethodType, CriteriaPropertyType, InterfaceError} from '../../src/export.js';
Object.defineProperty(Object.prototype,'copy',{
    value:function(){
        let obj={};
        if(this instanceof Array){
            obj=[];
        }
        return Object.assign(obj,this);
    }
});

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
        //let types=['mixed','number',A,null,undefined];
        //criteria.initTypes(types);
        //assert.deepEqual(criteria.types,['mixed'],'initTypes');
        let types=['number',A,null,undefined];
        criteria.initTypes(types);
        let match=[
            'number',
            A,
            'null',
            'undefined'
        ];
        assert.ok(criteria.types!==types,'initTypes 2');
        assert.propEqual(criteria.types,match,'initTypes 3');

    }
    // initTypes type  criteria 
    { 
        let types=[
            new CriteriaPropertyType({types:['number']}),
            new CriteriaMethodType({arguments:[{types:['number']}]}),
            //()=>{return 'string';},// тип метод , который возвращает строку
            ()=>{return ()=>'string';}// тип метод , который возвращает строку
        ];
        let criteria=new CriteriaPropertyType();
        criteria.initTypes(types);
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
    // compareTypes
    {

        {
            let criteria= new CriteriaPropertyType({types:[]});
            let criteria2= new CriteriaPropertyType({types:[]});

            let check=false;
            try {

                criteria.compareTypes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareTypes');
        }
        {
            class A{}
            class B extends A{};
            let criteria= new CriteriaPropertyType({types:['mixed']});
            let criteria2= new CriteriaPropertyType({types:[]});

            let check=false;
            try {

                criteria.compareTypes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareTypes 2');
        }
        {
            let criteria= new CriteriaPropertyType({types:[]});
            let criteria2= new CriteriaPropertyType({types:['mixed']});

            let check=false;
            try {

                criteria.compareTypes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareTypes 3');
        }
        {
            let criteria= new CriteriaPropertyType({types:['mixed','number']});
            let criteria2= new CriteriaPropertyType({types:['mixed']});

            let check=false;
            try {

                criteria.compareTypes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareTypes 4');
        }
        {
            class A{}
            class B extends A{};
            let criteria= new CriteriaPropertyType({types:[
                    A,
                    'string',
                    'number'
                ]});
            let criteria2= new CriteriaPropertyType({types:[
                   
                    'number',
                    'string',
                    A,

                ]});

            let check=false;
            try {

                criteria.compareTypes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareTypes 5');
        }

        {
            class A{}
            class B extends A{};
            let criteria= new CriteriaPropertyType({types:[
                    A,
                    'string',
                    'number'
                ]});
            let criteria2= new CriteriaPropertyType({types:[

                    'number',
                    'string',
                    B,

                ]});

            assert.throws(
                function(){
                    criteria.compareTypes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareTypes - throw'
            );
        }
        {
            class A{}
            let criteria= new CriteriaPropertyType({types:[
                    A,
                    'string',
                    'number'
                ]});
            let criteria2= new CriteriaPropertyType({types:[
                    'number',
                    'string'

                ]});

            assert.throws(
                function(){
                    criteria.compareTypes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareTypes - throw 2'
            );
        }
        {
            class A{}
            let criteria= new CriteriaPropertyType({types:[
                    A,
                    'string',
                    'number'
                ]});
            let criteria2= new CriteriaPropertyType({types:[
                    'number',
                    'string',
                    A,
                    'function'

                ]});

            assert.throws(
                function(){
                    criteria.compareTypes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareTypes - throw 6'
            );
        }
        {
            class A{}
            let criteria= new CriteriaPropertyType({types:[
                    A,
                    'string',
                    'number',
                    new CriteriaPropertyType({
                        types:[
                            'number',
                            'string'
                        ]
                    })
                ]});
            let criteria2= new CriteriaPropertyType({types:[
                    'number',
                    'string',
                    A,
                    new CriteriaPropertyType({
                        types:[
                            'number',
                            'string',
                        ]
                    })

                ]});

            let check=false;
            try {

                criteria.compareTypes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareTypes 5');
        }
        {
            class A{}
            let criteria= new CriteriaPropertyType({types:[
                    A,
                    'string',
                    'number',
                    new CriteriaPropertyType({
                        types:[
                            'number',
                            'string'
                        ]
                    })
                ]});
            let criteria2= new CriteriaPropertyType({types:[
                    'number',
                    'string',
                    A,
                    new CriteriaPropertyType({
                        types:[
                            'number',
                            'string',
                            'function'
                        ]
                    })

                ]});
            assert.throws(
                function(){
                    criteria.compareTypes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareTypes - throw 7'
            );
        }
    }

    // compareIncludes
    {
        {
            let criteria= new CriteriaPropertyType({includes:[]});
            let criteria2= new CriteriaPropertyType({includes:[]});

            let check=false;
            try {

                criteria.compareIncludes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareIncludes');
        }
        
        {
            class A{}
            class B extends A{};
            let criteria= new CriteriaPropertyType({includes:[1,2,A]});
            let criteria2= new CriteriaPropertyType({includes:[A,2,1]});
            let check=false;
            try {

                criteria.compareIncludes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareIncludes 2');
        }
        

        {
            class A{}
            class B extends A{};
            let criteria= new CriteriaPropertyType({includes:[1,2,A]});
            let criteria2= new CriteriaPropertyType({includes:[1,2,B]});

            assert.throws(
                function(){
                    criteria.compareIncludes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareIncludes - throw'
            );
        }
        {
            class A{}
            let criteria= new CriteriaPropertyType({includes:[1,2,A]});
            let criteria2= new CriteriaPropertyType({includes:[1,2]});

            assert.throws(
                function(){
                    criteria.compareIncludes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareIncludes - throw2'
            );
        }
        {
            class A{}
            let criteria= new CriteriaPropertyType({includes:[1,2,A]});
            let criteria2= new CriteriaPropertyType({includes:[1,2,A,3]});

            assert.throws(
                function(){
                    criteria.compareIncludes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareIncludes - throw3'
            );
        }
    }
    
    // compareExcludes
    {
        {
            let criteria= new CriteriaPropertyType({excludes:[]});
            let criteria2= new CriteriaPropertyType({excludes:[]});

            let check=false;
            try {

                criteria.compareExcludes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareExcludes');
        }

        {
            class A{}
            class B extends A{};
            let criteria= new CriteriaPropertyType({excludes:[1,2,A]});
            let criteria2= new CriteriaPropertyType({excludes:[A,2,1]});
            let check=false;
            try {

                criteria.compareExcludes(criteria2);
                check=true;
            }catch(e){
                if(!(e instanceof InterfaceError)){
                    throw e;
                }
            }
            assert.ok(check,'compareExcludes 2');
        }


        {
            class A{}
            class B extends A{};
            let criteria= new CriteriaPropertyType({excludes:[1,2,A]});
            let criteria2= new CriteriaPropertyType({excludes:[1,2,B]});

            assert.throws(
                function(){
                    criteria.compareExcludes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareExcludes - throw'
            );
        }
        {
            class A{}
            let criteria= new CriteriaPropertyType({excludes:[1,2,A]});
            let criteria2= new CriteriaPropertyType({excludes:[1,2]});

            assert.throws(
                function(){
                    criteria.compareExcludes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareExcludes - throw2'
            );
        }
        {
            class A{}
            let criteria= new CriteriaPropertyType({excludes:[1,2,A]});
            let criteria2= new CriteriaPropertyType({excludes:[1,2,A,3]});

            assert.throws(
                function(){
                    criteria.compareExcludes(criteria2);
                },
                function(e){
                    return e instanceof InterfaceError;
                },
                'compareExcludes - throw3'
            );
        }
    }
    // compare
    {
        {
            let criteria2=new CriteriaPropertyType({
                types:[A,'number',null,undefined],
                includes:[null,10,undefined,A],
                excludes:[B,10]
            });
            
            criteria.compare(criteria2);
            assert.ok(true,'compare');
        }
    }

    
    //formatStrictSyntaxToObject
    
    {
        let result=CriteriaPropertyType.formatStrictSyntaxToObject({});
        let tpl={types:['mixed'],includes:[],excludes:[]};
        assert.propEqual(result,Object.assign({},tpl),'formatStrictSyntaxToObject 1');

        result=CriteriaPropertyType.formatStrictSyntaxToObject({types:['mixed','string']});
        assert.propEqual(result,Object.assign({},tpl,{types:['mixed']}),'formatStrictSyntaxToObject 2');
        
        result=CriteriaPropertyType.formatStrictSyntaxToObject({types:'string',includes:'1',excludes:'1'});
        assert.propEqual(result,Object.assign({},tpl,{types:['string'],includes:['1'],excludes:['1']}),'formatStrictSyntaxToObject 3');
    }
/*    // formatExtendedSyntaxToObject
    {
        let result=CriteriaPropertyType.formatToObject('string|number');
        let tpl={types:['mixed'],includes:[],excludes:[],options:{entryPoints:['not defined']}};
        assert.propEqual(result,Object.assign({},tpl,{types:['string','number']}),'formatExtendedSyntaxToObject 1');

        result=CriteriaPropertyType.formatToObject(['string','number']);
        assert.propEqual(result,Object.assign({},tpl,{types:['string','number']}),'formatExtendedSyntaxToObject 2');
        
        result=CriteriaPropertyType.formatToObject({types:['string','number']});
        assert.propEqual(result,Object.assign({},tpl,{types:['string','number']}),'formatExtendedSyntaxToObject 3');

        result=CriteriaPropertyType.formatToObject({types:[]});
        assert.propEqual(result,Object.assign({},tpl,{types:['mixed']}),'formatExtendedSyntaxToObject 4');
        
        result=CriteriaPropertyType.formatToObject({types:'string|number|mixed'});
        assert.propEqual(result,Object.assign({},tpl,{types:['mixed']}),'formatExtendedSyntaxToObject 5');
        
        class A{};
        result=CriteriaPropertyType.formatToObject(A);
        assert.propEqual(result,Object.assign({},tpl,{types:[A]}),'formatExtendedSyntaxToObject 6');

        result=CriteriaPropertyType.formatToObject({types:A,includes:1,excludes:1});
        assert.propEqual(result,Object.assign({},tpl,{types:[A],includes:[1],excludes:[1]}),'formatExtendedSyntaxToObject 7');

        result=CriteriaPropertyType.formatToObject(()=>{});
        assert.propEqual(result,Object.assign({},tpl,{types:[]}),'formatExtendedSyntaxToObject 8');
        
        
        console.log(result);
    }*/
});