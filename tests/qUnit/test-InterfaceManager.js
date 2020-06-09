import {InterfaceError,InterfaceManager,CriteriaPropertyType,CriteriaMethodType,CriteriaReactType} from './../../export.js';


QUnit.module( 'Class InterfaceManager');
QUnit.test('Methods test InterfaceManager class',function(assert){
    let throwTest=(func,...args)=>{
        try {
            func(...args);
            return false;
        } catch (e) {
            if(e instanceof InterfaceError){
                return true;
            }
            throw e;
        }
    };
    // getInterfaceData
    {
        class A{};
        let result=InterfaceManager.getInterfaceData(A);
        assert.equal(result,undefined,'getInterfaceData => undefined');
    }

    // initInterfaceData
    {
        class A{};
        let match={
            protoProps:{},
            staticProps:{},
            end_points:[],
            isBuilt:false,
            builtProps:{
                protoProps:[],
                staticProps:[]
            }
        };
        InterfaceManager.initInterfaceData(A);
        assert.deepEqual(InterfaceManager.getInterfaceData(A),match,'initInterfaceData');
    }

    // setInterfaceData
    {
        class A{};
        let match={
            test:{}
        };
        InterfaceManager.setInterfaceData(A,{test:{}});
        assert.deepEqual(InterfaceManager.getInterfaceData(A),match,'setInterfaceData');
    }

    // hasInterfaceData
    {
        class A{};
        assert.equal( InterfaceManager.hasInterfaceData(A),false,'hasInterfaceData=>false');
        InterfaceManager.initInterfaceData(A);
        assert.equal( InterfaceManager.hasInterfaceData(A),true,'hasInterfaceData=>true');
    }

    // getDescriptors
    {
        class A{
            static staticMethod(){};
            static get staticReact(){
                return 1;
            };
            static set staticReact(v){

            };
            method(){};
            get react(){
                return 1;
            };
            set react(v){

            };
        };
        let interfaces=InterfaceManager.initInterfaceData(A);
        let staticMatch=Object.assign({
            staticMethod:Object.assign({
                constructor:A,
                isBuilt:false,
            },Object.getOwnPropertyDescriptor(A,'staticMethod')),
            staticReact:Object.assign({
                constructor:A,
                isBuilt:false,
            },Object.getOwnPropertyDescriptor(A,'staticReact')),
        });
        assert.deepEqual(InterfaceManager.getDescriptors(A),staticMatch,'getDescriptors static properties');
        interfaces.builtProps.staticProps=['staticReact'];
        staticMatch.staticReact.isBuilt=true;
        assert.deepEqual(InterfaceManager.getDescriptors(A),staticMatch,'getDescriptors static properties -test isBuilt');
        let match=Object.assign({
            method:Object.assign({
                constructor:A,
                isBuilt:false,
            },Object.getOwnPropertyDescriptor(A.prototype,'method')),
            react:Object.assign({
                constructor:A,
                isBuilt:false,
            },Object.getOwnPropertyDescriptor(A.prototype,'react')),
        });
        assert.deepEqual(InterfaceManager.getDescriptors(A.prototype),match,'getDescriptors proto properties');
        interfaces.builtProps.protoProps=['react'];
        match.react.isBuilt=true;
        assert.deepEqual(InterfaceManager.getDescriptors(A.prototype),match,'getDescriptors static properties -test isBuilt');
    }

    // getProtoDescriptors
    {
        class A{
            method_A(){}
            static static_method_A(){}
        }
        class B extends A{
            method_B(){}
            static static_method_B(){}
        }
        class C extends B{
            method_C(){}
            static static_method_C(){}
        }
        let static_match={
            static_method_A:Object.assign({
                constructor:A,
                isBuilt:false,
            },Object.getOwnPropertyDescriptor(A,'static_method_A')),
            static_method_B:Object.assign({
                constructor:B,
                isBuilt:false,
            },Object.getOwnPropertyDescriptor(B,'static_method_B')),
            static_method_C:Object.assign({
                constructor:C,
                isBuilt:false,
            },Object.getOwnPropertyDescriptor(C,'static_method_C')),
        };
        let interfaces_A=InterfaceManager.initInterfaceData(A);
        assert.deepEqual(InterfaceManager.getProtoDescriptors(C),static_match,'getProtoDescriptors static properties');
        interfaces_A.builtProps.staticProps=['static_method_A'];
        static_match.static_method_A.isBuilt=true;
        assert.deepEqual(InterfaceManager.getProtoDescriptors(C),static_match,'getProtoDescriptors static properties  -test isBuilt');
    }

    // generateDescriptorsRules
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            get react (){
                return {
                    typeof:'mixed'
                };
            }
            set react(v){
                v.typeof='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    typeof:'mixed'
                };
            }
            static set static_react(v){
                v.typeof='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            typeof:'mixed'
        };
        InterfaceTest.static_prop={
            typeof:'mixed'
        };
        InterfaceTest.isInterface=true;
        let staticDescs=InterfaceManager.getDescriptors(InterfaceTest);
        let protoDescs=InterfaceManager.getDescriptors(InterfaceTest.prototype);
        let rules={
            staticProps:InterfaceManager.generateDescriptorsRules(staticDescs),
            protoProps:InterfaceManager.generateDescriptorsRules(protoDescs)
        };
        let match={
            staticProps:{
                static_method:[
                    {
                        class:InterfaceTest,
                        criteria:new CriteriaMethodType([{typeof:'mixed'}],{typeof:'mixed'},rules.staticProps.static_method[0].criteria.options)
                    }

                ],
                static_react:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaReactType({typeof: 'mixed'}, {typeof: 'mixed'}, rules.staticProps.static_react[0].criteria.options)
                    }
                ],
                static_prop:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaPropertyType('mixed', [], rules.staticProps.static_prop[0].criteria.options)
                    }
                ]
            },
            protoProps:{
                method:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaMethodType([{typeof: 'mixed'}], {typeof: 'mixed'}, rules.protoProps.method[0].criteria.options)
                    }
                ],
                react:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaReactType({typeof: 'mixed'}, {typeof: 'mixed'}, rules.protoProps.react[0].criteria.options)
                    }
                ],
                prop:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaPropertyType('mixed', [], rules.protoProps.prop[0].criteria.options)
                    }
                ]
            }
        };
       QUnit.dump.maxDepth=7;
        assert.deepEqual(rules,match,'generateDescriptorsRules');
    }

    // generateRules
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            get react (){
                return {
                    typeof:'mixed'
                };
            }
            set react(v){
                v.typeof='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    typeof:'mixed'
                };
            }
            static set static_react(v){
                v.typeof='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            typeof:'mixed'
        };
        InterfaceTest.static_prop={
            typeof:'mixed'
        };
        InterfaceTest.isInterface=true;
        let staticDescs=InterfaceManager.getDescriptors(InterfaceTest);
        let protoDescs=InterfaceManager.getDescriptors(InterfaceTest.prototype);
        let rules=InterfaceManager.generateRules(InterfaceTest);
        let match={
            staticProps:{
                static_method:[
                    {
                        class:InterfaceTest,
                        criteria:new CriteriaMethodType([{typeof:'mixed'}],{typeof:'mixed'},rules.staticProps.static_method[0].criteria.options)
                    }

                ],
                static_react:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaReactType({typeof: 'mixed'}, {typeof: 'mixed'}, rules.staticProps.static_react[0].criteria.options)
                    }
                ],
                static_prop:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaPropertyType('mixed', [], rules.staticProps.static_prop[0].criteria.options)
                    }
                ]
            },
            protoProps:{
                method:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaMethodType([{typeof: 'mixed'}], {typeof: 'mixed'}, rules.protoProps.method[0].criteria.options)
                    }
                ],
                react:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaReactType({typeof: 'mixed'}, {typeof: 'mixed'}, rules.protoProps.react[0].criteria.options)
                    }
                ],
                prop:[
                    {
                        class: InterfaceTest,
                        criteria: new CriteriaPropertyType('mixed', [], rules.protoProps.prop[0].criteria.options)
                    }
                ]
            }
        };
        QUnit.dump.maxDepth=7;
        assert.deepEqual(rules,match,'generateRules');
    }

    // expandAndSetRule
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[1,2,3]
                        }
                    ],
                     return:{
                        typeof:'mixed',
                         values:[1,2,3]
                     }
                };
            }
            method2(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[1,2,3]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[1,2,3]
                    }
                };
            }
            static static_method2(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[1,2,3]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[1,2,3]
                    }
                };
            }
        }
        TestInterface.isInterface=true;
        class TestInterface2 {
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
            method3(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
            static static_method3(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
        }
        TestInterface2.isInterface=true;
        let rules=InterfaceManager.generateRules(TestInterface);
        let rules2=InterfaceManager.generateRules(TestInterface2);
        for(let prop of Object.getOwnPropertyNames(rules2.protoProps)){
            InterfaceManager.expandAndSetRule(rules.protoProps,prop,rules2.protoProps[prop][0]);
        }
        for(let prop of Object.getOwnPropertyNames(rules2.staticProps)){
            InterfaceManager.expandAndSetRule(rules.staticProps,prop,rules2.staticProps[prop][0]);
        }
        let match={
                protoProps:{
                    method:[
                        {
                            class:TestInterface2,
                            criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5,1,2]}],{typeof:'mixed',values:[3,4,5,1,2]},rules.protoProps.method[0].criteria.options)
                        }
                    ],
                    method2:[
                        {
                            class:TestInterface,
                            criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5]}],{typeof:'mixed',values:[3,4,5]},rules.protoProps.method2[0].criteria.options)
                        }
                    ],
                    method3:[
                        {
                            class:TestInterface2,
                            criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5]}],{typeof:'mixed',values:[3,4,5]},rules.protoProps.method3[0].criteria.options)
                        }
                    ],
                },
                staticProps:{
                    static_method:[
                        {
                            class:TestInterface2,
                            criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5,1,2]}],{typeof:'mixed',values:[3,4,5,1,2]},rules.staticProps.static_method[0].criteria.options)
                        }
                    ],
                    static_method2:[
                        {
                            class:TestInterface,
                            criteria:new CriteriaMethodType([{typeof:'mixed',values:[1,2,3]}],{typeof:'mixed',values:[1,2,3]},rules.staticProps.static_method2[0].criteria.options)
                        }
                    ],
                    static_method3:[
                        {
                            class:TestInterface2,
                            criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5]}],{typeof:'mixed',values:[3,4,5]},rules.staticProps.static_method3[0].criteria.options)
                        }
                    ],
                }
        };
        QUnit.dump.maxDepth=8;
        assert.deepEqual(rules,match,'expandAndSetRule');
    }

    // addRules
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[1,2,3]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[1,2,3]
                    }
                };
            }
            method2(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[1,2,3]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[1,2,3]
                    }
                };
            }
            static static_method2(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[1,2,3]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[1,2,3]
                    }
                };
            }
        }
        TestInterface.isInterface=true;
        class TestInterface2 {
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
            method3(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
            static static_method3(){
                return {
                    arguments:[
                        {
                            typeof:'mixed',
                            values:[3,4,5]
                        }
                    ],
                    return:{
                        typeof:'mixed',
                        values:[3,4,5]
                    }
                };
            }
        }
        TestInterface2.isInterface=true;
        let rules=InterfaceManager.generateRules(TestInterface);
        let rules2=InterfaceManager.generateRules(TestInterface2);
        InterfaceManager.addRules(TestInterface2,rules);
        InterfaceManager.addRules(TestInterface2,rules2);
        rules=InterfaceManager.getInterfaceData(TestInterface2);
        let match={
            builtProps: {
                protoProps: [],
                staticProps: []
            },
            protoProps:{
                method:[
                    {
                        class:TestInterface2,
                        criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5,1,2]}],{typeof:'mixed',values:[3,4,5,1,2]},rules.protoProps.method[0].criteria.options)
                    }
                ],
                method2:[
                    {
                        class:TestInterface,
                        criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5]}],{typeof:'mixed',values:[3,4,5]},rules.protoProps.method2[0].criteria.options)
                    }
                ],
                method3:[
                    {
                        class:TestInterface2,
                        criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5]}],{typeof:'mixed',values:[3,4,5]},rules.protoProps.method3[0].criteria.options)
                    }
                ],
            },
            staticProps:{
                static_method:[
                    {
                        class:TestInterface2,
                        criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5,1,2]}],{typeof:'mixed',values:[3,4,5,1,2]},rules.staticProps.static_method[0].criteria.options)
                    }
                ],
                static_method2:[
                    {
                        class:TestInterface,
                        criteria:new CriteriaMethodType([{typeof:'mixed',values:[1,2,3]}],{typeof:'mixed',values:[1,2,3]},rules.staticProps.static_method2[0].criteria.options)
                    }
                ],
                static_method3:[
                    {
                        class:TestInterface2,
                        criteria:new CriteriaMethodType([{typeof:'mixed',values:[3,4,5]}],{typeof:'mixed',values:[3,4,5]},rules.staticProps.static_method3[0].criteria.options)
                    }
                ],
            },
            end_points: [],
            isBuilt:false,
        };
        QUnit.dump.maxDepth=8;
        assert.deepEqual(rules,match,'addRules');
    }

    // clearClass
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            get react (){
                return {
                    typeof:'mixed'
                };
            }
            set react(v){
                v.typeof='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    typeof:'mixed'
                };
            }
            static set static_react(v){
                v.typeof='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            typeof:'mixed'
        };
        InterfaceTest.static_prop={
            typeof:'mixed'
        };
        InterfaceTest.isInterface=true;
        InterfaceManager.initInterfaceData(InterfaceTest);
        InterfaceManager.clearClass(InterfaceTest);
        let match={
            protoProps:['constructor'].sort(),
            staticProps:["length", "prototype", "name", "isInterface", "interfaces"].sort()
        };
        let equal={
            protoProps:Object.getOwnPropertyNames(InterfaceTest.prototype).sort(),
            staticProps:Object.getOwnPropertyNames(InterfaceTest).sort()
        };
        assert.propEqual(equal,match,'clearProto');
    }

    // initRules
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            get react (){
                return {
                    typeof:'mixed'
                };
            }
            set react(v){
                v.typeof='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    typeof:'mixed'
                };
            }
            static set static_react(v){
                v.typeof='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            typeof:'mixed'
        };
        InterfaceTest.static_prop={
            typeof:'mixed'
        };
        class Test{
            method(){}
            static static_method(){}
        }
        InterfaceTest.isInterface=true;
        let rules=InterfaceManager.initRules(InterfaceTest);
        let matchInterfaces={
            interfaces:{
                builtProps:{
                    protoProps:[],
                    staticProps:[]
                },
                protoProps:{
                        method:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaMethodType([{typeof:'mixed'}],{typeof:'mixed'},rules.protoProps.method[0].criteria.options)
                        }
                    ],
                    react:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaReactType({typeof:'mixed'},{typeof:'mixed'},rules.protoProps.react[0].criteria.options)
                        }
                    ],
                    prop:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaPropertyType('mixed',[],rules.protoProps.prop[0].criteria.options)
                        }
                    ]
                },
                staticProps:{
                    static_method:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaMethodType([{typeof:'mixed'}],{typeof:'mixed'},rules.staticProps.static_method[0].criteria.options)
                        }
                    ],
                    static_react:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaReactType({typeof:'mixed'},{typeof:'mixed'},rules.staticProps.static_react[0].criteria.options)
                        }
                    ],
                    static_prop:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaPropertyType('mixed',[],rules.staticProps.static_prop[0].criteria.options)
                        }
                    ]
                },
                end_points:[],
                isBuilt:false,

            },
            isInterface: true,
            //length:0,
           // name:"InterfaceTest",
            prototype:{}
        };
        let equal={};
        for(let prop of Object.getOwnPropertyNames(InterfaceTest)){
            if (['length','name','prototype'].includes(prop)){continue}
            equal[prop]=InterfaceTest[prop];
        }
        equal.prototype={};
        for(let prop of Object.getOwnPropertyNames(InterfaceTest.prototype)){
            if (prop==='constructor'){continue}
            equal.prototype[prop]=InterfaceTest.prototype[prop];
        }
        QUnit.dump.maxDepth=8;
        assert.deepEqual(equal,matchInterfaces,'initRules for interface');
        let matchClass={
            interfaces:{
                builtProps:{
                    protoProps:[],
                    staticProps:[]
                },
                protoProps:{
                    method:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaMethodType([{typeof:'mixed'}],{typeof:'mixed'},rules.protoProps.method[0].criteria.options)
                        }
                    ],
                    react:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaReactType({typeof:'mixed'},{typeof:'mixed'},rules.protoProps.react[0].criteria.options)
                        }
                    ],
                    prop:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaPropertyType('mixed',[],rules.protoProps.prop[0].criteria.options)
                        }
                    ]
                },
                staticProps:{
                    static_method:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaMethodType([{typeof:'mixed'}],{typeof:'mixed'},rules.staticProps.static_method[0].criteria.options)
                        }
                    ],
                    static_react:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaReactType({typeof:'mixed'},{typeof:'mixed'},rules.staticProps.static_react[0].criteria.options)
                        }
                    ],
                    static_prop:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaPropertyType('mixed',[],rules.staticProps.static_prop[0].criteria.options)
                        }
                    ]
                },
                end_points: [],
                isBuilt:false,
            },
            static_method:Test.static_method,
            prototype:{
                method:Test.prototype.method
            },

        };
        InterfaceManager.initRules(Test,rules);
        equal={};
        for(let prop of Object.getOwnPropertyNames(Test)){
            if (['length','name','prototype'].includes(prop)){continue}
            equal[prop]=Test[prop];
        }
        equal.prototype={};
        for(let prop of Object.getOwnPropertyNames(Test.prototype)){
            if (prop==='constructor'){continue}
            equal.prototype[prop]=Test.prototype[prop];
        }
        QUnit.dump.maxDepth=8;
        assert.deepEqual(equal,matchClass,'initRules for class');
    }

    // validateDescriptors
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            /*get react (){
                return {
                    typeof:'mixed'
                };
            }*/
            set react(v){
                v.typeof='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    typeof:'mixed'
                };
            }
            static set static_react(v){
                v.typeof='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            typeof:'number'
        };
        InterfaceTest.static_prop={
            typeof:'number'
        };
        InterfaceTest.isInterface=true;
        let rules=InterfaceManager.initRules(InterfaceTest);
        {
            class Test{

            }
            InterfaceManager.initRules(Test,rules);
            let staticDescs=InterfaceManager.getDescriptors(Test);
            let protoDescs=InterfaceManager.getDescriptors(Test.prototype);
            let result={
                staticProps:InterfaceManager.validateDescriptors(staticDescs,rules.staticProps,['static','Test']),
                protoProps:InterfaceManager.validateDescriptors(protoDescs,rules.protoProps,['Test'])
            };
            let match={
                staticProps:[
                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.static_method'],message:'The property must be declared'}),
                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.static_react'],message:'The property must be declared'}),
                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.static_prop'],message:'The property must be declared'})
                ],
                protoProps:[

                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.method'],message:'The property must be declared'}),
                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.react'],message:'The property must be declared'}),
                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.prop'],message:'The property must be declared'})

                ]
            };
            assert.deepEqual(result,match,'validateDescriptors - The property must be declared (Warn:reproduces the match by error message.)');
        }
        {
            class Test{
                set method(a){
                    return 1;
                }
                get react (){
                    return 1;
                }
                static static_method(a=1){
                    return 1;
                }
                static static_react (){
                    return 1;
                }
            }
            Test.prototype.prop='1';
            Test.static_prop='1';
            InterfaceManager.initRules(Test,rules);
            let staticDescs=InterfaceManager.getDescriptors(Test);
            let protoDescs=InterfaceManager.getDescriptors(Test.prototype);
            let result={
                staticProps:InterfaceManager.validateDescriptors(staticDescs,rules.staticProps,['static','Test']),
                protoProps:InterfaceManager.validateDescriptors(protoDescs,rules.protoProps,['Test'])
            };
            let match={
                staticProps:[
                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.static_react'],message:'The property  must be the getter/setter.'}),
                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.static_prop'],message:'Expected type of "number"  but defined by "string".'})
                ],
                protoProps:[
                    new InterfaceError('ErrorType',{entryPoints:['Test','InterfaceTest','.method'],message:'The property must be Function.'}),
                    new InterfaceError('ErrorType',{entryPoints:['Test','InterfaceTest','.react','get'],message:'The property not must be the getter.'}),
                    new InterfaceError('ErrorType',{entryPoints:['Test','InterfaceTest','.react','set'],message:'The property must be the setter.'}),
                    new InterfaceError('ErrorType',{entryPoints:['Test','InterfaceTest','.prop'],message:'Expected type of "number"  but defined by "string".'})

                ]
            };
           assert.deepEqual(result,match,'validateDescriptors - test other throws error (Warn:reproduces the match by error message.)');
        }
    }

    // validatePropsClass
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            /*get react (){
                return {
                    typeof:'mixed'
                };
            }*/
            set react(v){
                v.typeof='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'mixed'
                        }
                    ],
                    return:{
                        typeof:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    typeof:'mixed'
                };
            }
            static set static_react(v){
                v.typeof='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            typeof:'number'
        };
        InterfaceTest.static_prop={
            typeof:'number'
        };
        InterfaceTest.isInterface=true;
        let rules=InterfaceManager.initRules(InterfaceTest);
        class Test{
            set method(a){
                return 1;
            }
            get react (){
                return 1;
            }
            static static_method(a=1){
                return 1;
            }
            static static_react (){
                return 1;
            }
        }
        Test.prototype.prop='1';
        Test.static_prop='1';
        InterfaceManager.initRules(Test,rules);
        let errorsStack=[];
        try {
            InterfaceManager.validatePropsClass(Test,rules,errorsStack);
            assert.ok(false,'validatePropsClass');
        } catch (e) {
            if(e instanceof InterfaceError ){
            let match=[
                    new InterfaceError('ErrorType',{entryPoints:['Test','InterfaceTest','.method'],message:'The property must be Function.'}),
                    new InterfaceError('ErrorType',{entryPoints:['Test','InterfaceTest','.react','get'],message:'The property not must be the getter.'}),
                    new InterfaceError('ErrorType',{entryPoints:['Test','InterfaceTest','.react','set'],message:'The property must be the setter.'}),
                    new InterfaceError('ErrorType',{entryPoints:['Test','InterfaceTest','.prop'],message:'Expected type of "number"  but defined by "string".'}),
                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.static_react'],message:'The property  must be the getter/setter.'}),
                    new InterfaceError('ErrorType',{entryPoints:['static','Test','InterfaceTest','.static_prop'],message:'Expected type of "number"  but defined by "string".'})
                ];
            assert.deepEqual(errorsStack,match,'validatePropsClass - test other throws error (Warn:reproduces the match by error message.)');
            } else {
                throw e;
            }
        }
    }

    // buildPropsDescriptors
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            typeof:'number'
                        }
                    ],
                    return:{
                        typeof:'number'
                    }
                };
            }
            get react (){
                return {
                    typeof:'number'
                };
            }
            set react(v){
                v.typeof='number';
            }
            /*static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'number'
                        }
                    ],
                    return:{
                        typeof:'number'
                    }
                };
            }
            static get static_react (){
                return {
                    typeof:'number'
                };
            }
            static set static_react(v){
                v.typeof='number';
            }*/
        }
        class Test{
            method(){
                //throw
                return '1';
            }
            method2(){

            }
            get react (){
                //throw
                return '1';
            }
            set react(v){

            }
        }
        InterfaceTest.isInterface=true;
        let rules=InterfaceManager.initRules(InterfaceTest);
        InterfaceManager.initRules(Test,rules);
        let descs1=InterfaceManager.getDescriptors(Test.prototype);
        let descs2=InterfaceManager.getDescriptors(Test.prototype);
       InterfaceManager.buildPropsDescriptors(descs1,rules.protoProps);
       InterfaceManager.buildPropsDescriptors(descs1,rules.protoProps); // rebuild
        let match=
            descs1.method.isBuilt===true
            && descs1.method.value!==descs2.method.value
            && descs1.method.value(Symbol.for('get_own_descriptor'))===descs2.method.value
            && throwTest(descs1.method.value,'1')
            && throwTest(descs1.method.value,1)

            && descs1.method2.isBuilt===false
            && descs1.method2.value===descs2.method2.value

            && descs1.react.isBuilt===true
            && descs1.react.get!==descs2.react.get
            && descs1.react.get(Symbol.for('get_own_descriptor'))===descs2.react.get
            && throwTest(descs1.react.get)
            && descs1.react.set!==descs2.react.set
            && descs1.react.set(Symbol.for('get_own_descriptor'))===descs2.react.set
            && throwTest(descs1.react.set,'1')
        ;
        assert.ok(match,'buildPropsDescriptors');
    }

    // buildPropsClass
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            typeof:'number'
                        }
                    ],
                    return:{
                        typeof:'number'
                    }
                };
            }
            get react (){
                return {
                    typeof:'number'
                };
            }
            set react(v){
                v.typeof='number';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'number'
                        }
                    ],
                    return:{
                        typeof:'number'
                    }
                };
            }
        }
        class Test{
            method(){
                //throw
                return '1';
            }
            method2(){

            }
            static static_method(a){
                return '1';
            }
        }
        InterfaceTest.isInterface=true;
        let rules=InterfaceManager.initRules(InterfaceTest);
        InterfaceManager.initRules(Test,rules);
        let descs2 =InterfaceManager.getDescriptors(Test.prototype);
        let sDescs2 =InterfaceManager.getDescriptors(Test);
        InterfaceManager.buildPropsClass(Test,rules);
        InterfaceManager.buildPropsClass(Test,rules);//rebuild
        let descs1 =InterfaceManager.getDescriptors(Test.prototype);
        let sDescs1 =InterfaceManager.getDescriptors(Test);

        let match=
            descs1.method.isBuilt===true
            && descs2.method.isBuilt===false
            && descs1.method.value!==descs2.method.value
            && descs1.method.value(Symbol.for('get_own_descriptor'))===descs2.method.value
            && throwTest(descs1.method.value,'1')
            && throwTest(descs1.method.value,1)
            && sDescs1.static_method.isBuilt===true
            && sDescs2.static_method.isBuilt===false
            && sDescs1.static_method.value!==sDescs2.static_method.value
            && sDescs1.static_method.value(Symbol.for('get_own_descriptor'))===sDescs2.static_method.value
            && throwTest(sDescs1.static_method.value,'1')
            && throwTest(sDescs1.static_method.value,1)
        ;
        assert.ok(match,'buildPropsClass')
    }

    // buildInterface
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface.isInterface=true;

        class Test extends TestInterface {
            method(a){
                return '1';
            }
            static static_method(a){
                return '1';
            }
        }
        class TestInterface2 extends Test {
            method2(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
            static static_method2(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface2.isInterface=true;
        class Test2 extends TestInterface2 {
            method2(a){
                return '1';
            }
            static static_method2(a){
                return '1';
            }
        }
        InterfaceManager.buildInterface(Test2);

        let match=
            Test2.interfaces.builtProps.protoProps.includes('method2')
            && Test2.interfaces.builtProps.staticProps.includes('static_method2')
            && Test2.interfaces.protoProps.method[0].class === TestInterface
            && Test2.interfaces.protoProps.method2[0].class === TestInterface2
            && Test2.interfaces.staticProps.static_method[0].class === TestInterface
            && Test2.interfaces.staticProps.static_method2[0].class === TestInterface2
            && throwTest(Test2.prototype.method,'1')
            && throwTest(Test2.prototype.method,1)
            && throwTest(Test2.prototype.method2,'1')
            && throwTest(Test2.prototype.method2,1)
            && Test2.prototype.method === Test.prototype.method
            && ! Test2.prototype.hasOwnProperty('method')
            && throwTest(Test2.static_method,'1')
            && throwTest(Test2.static_method,1)
            && throwTest(Test2.static_method2,'1')
            && throwTest(Test2.static_method2,1)
            && ! Test2.hasOwnProperty('static_method')
            && Test2.static_method === Test.static_method

            && Test.interfaces.builtProps.protoProps.includes('method')
            && !Test.interfaces.builtProps.protoProps.includes('method2')
            && Test.interfaces.builtProps.staticProps.includes('static_method')
            && !Test.interfaces.builtProps.staticProps.includes('static_method2')
            && Test.interfaces.protoProps.method[0].class === TestInterface
            && !('method2' in Test.interfaces.protoProps)
            && Test.interfaces.staticProps.static_method[0].class === TestInterface
            && !('static_method2' in Test.interfaces.staticProps)
            && throwTest(Test.prototype.method,'1')
            && throwTest(Test.prototype.method,1)
            && throwTest(Test.static_method,'1')
            && throwTest(Test.static_method,1)
            && ! Test.prototype.hasOwnProperty('method2')
            && ! Test.hasOwnProperty('static_method2')

        ;
        assert.ok(match,'buildInterface');
    }

    // extendsInterfaces
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface.isInterface=true;

        class Test extends TestInterface{
            method(a){
                return '1';
            }
        }
        class TestInterface2 extends Test{
            method2(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface2.isInterface=true;

        class TestInterface3 {
            method3(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface3.isInterface=true;

        class TestInterface4 extends TestInterface3 {
            method4(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface4.isInterface=true;
        class TestInterface5  {
            method5(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface5.isInterface=true;
        class Test2 extends TestInterface2{
            method2(a){
                return '1';
            }
        }
        class Test3 extends Test2{
            method3(a){
                return '1';
            }
        }
        InterfaceManager.extendsInterfaces(Test3);

        class Test4 extends Test3{
            method4(a){
                return '1';
            }
            method5(a){
                return '1';
            }
        }
        InterfaceManager.extendsInterfaces(Test4,TestInterface4,TestInterface5);
        let match=
                Test.interfaces.builtProps.protoProps.includes('method')
             && Test2.interfaces.builtProps.protoProps.includes('method2')
             && !Test3.interfaces.builtProps.protoProps.includes('method3')
             && !Test4.interfaces.builtProps.protoProps.includes('method3')
             && Test4.interfaces.builtProps.protoProps.includes('method4')
             && Test4.interfaces.builtProps.protoProps.includes('method5')
             && Test4.interfaces.protoProps.method[0].class === TestInterface
             && Test4.interfaces.protoProps.method2[0].class === TestInterface2
             && Test4.interfaces.protoProps.method3[0].class === TestInterface3
             && Test4.interfaces.protoProps.method4[0].class === TestInterface4
             && Test4.interfaces.protoProps.method5[0].class === TestInterface5
             && ('method'in Test4.prototype)
             && ('method2'in Test4.prototype)
             && ('method3'in Test4.prototype)
             && ('method4'in Test4.prototype)
             && ('method5'in Test4.prototype)
             && throwTest(Test4.prototype.method,1)
             && throwTest(Test4.prototype.method2,1)
             && !throwTest(Test4.prototype.method3,1) //  check for availability will take place, but checks during execution will not be performed
             && throwTest(Test4.prototype.method4,1)
             && throwTest(Test4.prototype.method5,1)
        assert.ok(match,'extendsInterfaces');
    }

    // implementsInterfaces
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface.isInterface=true;



        class TestInterface2 {
            method2(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface2.isInterface=true;


        class TestInterface3  {
            method3(){
                return {
                    arguments:[
                        {
                            typeof:'number',

                        }
                    ],
                    return:{
                        typeof:'number',
                        values:[1]
                    }
                };
            }
        }
        TestInterface3.isInterface=true;
        class Test2 extends TestInterface2{
            method(a){
                return '1';
            }
            method2(a){
                return '1';
            }
        }
        InterfaceManager.extendsInterfaces(Test2);

        class Test3 extends Test2{

        }
        assert.throws(function(){
            InterfaceManager.implementsInterfaces(Test3,TestInterface3);
        },function(e){
            return e instanceof InterfaceError && e.message.trim() === "[Test3][TestInterface3][.method3] The property must be declared."
        },'implementsInterfaces');
    }

    // extractOwnDescriptors
    {}
    // extendsInterfaces + extendClassFromOwnPrototypes
    {
        class TestInterface{
            method(){
                return {
                    arguments:[
                        {
                            typeof:'number'
                        }
                    ],
                    return:{
                        typeof:'number'
                    }
                }
            }
            method2(){
                return {
                    arguments:[
                        {
                            typeof:'number'
                        }
                    ],
                    return:{
                        typeof:'number'
                    }
                }
            }
            static method(){
                return {
                    arguments:[
                        {
                            typeof:'number'
                        }
                    ],
                    return:{
                        typeof:'number'
                    }
                }
            }
            static method2(){
                return {
                    arguments:[
                        {
                            typeof:'number'
                        }
                    ],
                    return:{
                        typeof:'number'
                    }
                }
            }
        }
        TestInterface.isInterface=true;
        class Test{
            method(){
                return 1
            }
            method2(){
                return 1
            }
            static method(){
                return 1
            }
            static method2(){
                return 1
            }
        }
        class Test2 extends Test{
            method2(){
                return 2;
            }
            static method2(){
                return 2;
            }
        }
        InterfaceManager.extendsInterfaces(Test2,true,TestInterface);
        let match=
               Test2.method(0)=== 1
            && Test2.method2(0)=== 2
            && Test2.prototype.method(0) === 1
            && Test2.prototype.method2(0) === 2
            && throwTest(Test2.method,'0')
            && throwTest(Test2.method2,'0')
            && throwTest(Test2.prototype.method,'0')
            && throwTest(Test2.prototype.method2,'0');
        assert.ok(match,'extendsInterfaces + extendClassFromOwnPrototypes');
    }

    //addGlobalEndPoints / setEndPoint / getEndPoints / getAllEndPoints
    {
        let end_points = Object.assign([],InterfaceManager.end_points);
        class TestInterface{
            method(){
                return {
                    arguments:[{
                        typeof:'number'
                    }],
                    return:{ typeof:'number'}
                };
            };
        };
        TestInterface.isInterface=true;


        class Test extends TestInterface {
            method2(){return 1};
            method(){return 1};
        };
        InterfaceManager.extendsInterfaces(Test);
        class TestInterface2 extends Test{
            method2(){
                return {
                    arguments:[{
                        typeof:'number'
                    }],
                    return:{ typeof:'number'}
                };
            };
        };
        TestInterface2.isInterface=true;
        InterfaceManager.setEndPoint(TestInterface2,Test);

        class Test2 extends TestInterface2 {

        };
        class Other{}
        InterfaceManager.setEndPoint(Test2,Other);
        InterfaceManager.addGlobalEndPoints([Audio]);
        assert.deepEqual(InterfaceManager.getAllEndPoints(),end_points.concat([Audio]),'addGlobalEndPoints/getAllEndPoints(undefined)');
        assert.deepEqual(InterfaceManager.getAllEndPoints(Test2),end_points.concat([Audio,Other]),'setEndPoint(Class)/getAllEndPoints(Class)');
       assert.throws(
            function(){
                InterfaceManager.implementsInterfaces(Test2,true);
            },
            function(e){
                return  e instanceof InterfaceError && e.message.trim()==="[Test2][TestInterface2][.method2] The property must be declared.";
            },
            'Test end points for class (validate)'
        );
        assert.ok(!Test2.prototype.hasOwnProperty('method')&&!Test2.prototype.hasOwnProperty('method2'),'end points: check if methods are extended ');
}
});

QUnit.test('Проверка сборки интерфейса',function(assert){
    class TestInterface {
        method(){
            return {
                arguments:[
                    {
                        typeof:'string'
                    }
                ],
                return:{
                    typeof:'string'
                }
            };
        }
        method2(){
            return {
                arguments:[
                    {
                        typeof:'string'
                    }
                ],
                return:{
                    typeof:'string'
                }
            };
        }
        static methodTestStatic(){
            return {
                arguments:[
                    {typeof:'string',values:['ok','error']},
                    {typeof:'number',values:[0,1]}
                ],
                return :{
                    typeof:'mixed'
                }
            };
        };
        static methodTestStatic2(){
            return new CriteriaMethodType(
                [
                    {typeof:'string',values:['ok','error']},
                    {typeof:'number',values:[0,1]}
                ],
                {
                    typeof:'mixed'
                }
            );
        };

    }
    TestInterface.isInterface=true;
    class TestInterface2 extends TestInterface {
        method2(){
            return {
                arguments:[
                    {
                        typeof:'string'
                    }
                ],
                return:{
                    typeof:'string'
                }
            };
        }
        method3(){
            return {
                arguments:[
                    {
                        typeof:'string'
                    }
                ],
                return:{
                    typeof:'string'
                }
            };
        }
        static methodTestStatic2(){
            return new CriteriaMethodType(
                [
                    {typeof:'string',values:['ok','error']},
                    {typeof:'number',values:[0,1]}
                ],
                {
                    typeof:'mixed'
                }
            );
        };
        static methodTestStatic3(){
            return new CriteriaMethodType(
                [
                    {typeof:'string',values:['ok','error']},
                    {typeof:'number',values:[0,1]}
                ],
                {
                    typeof:'number'
                }
            );
        };
    }
    TestInterface2.isInterface=true;
    class Test1 extends TestInterface2 {
        method(a='string'){
            return a;
        }
        method2(a='string'){
            return a;
        }
        static methodTestStatic(a='string'){
            return 0;
        };
    }
    class Test2 extends Test1 {
        method3(a='string'){
            return a;
        }
        static methodTestStatic2(a='string'){
            return 1;
        }
    }
    class TestInterface3 extends Test2 {
        method4(){
        }
    }
    class Test3 extends TestInterface3 {
        method4(){
        }
        static methodTestStatic3(a='string'){
            return 1;
        }
    }
    TestInterface3.isInterface=true;
    let test=new Test3();
    InterfaceManager.implementsInterfaces(test);
    //console.log([Test3,TestInterface3,Test2,Test1,TestInterface2,TestInterface]);
    let match=
        {
            "proto": {
                "Test1": [
                    "constructor",
                    "method",
                    "method2"
                ],
                "Test2": [
                    "constructor",
                    "method3"
                ],
                "Test3": [
                    "constructor",
                    "method4"
                ],
                "TestInterface": [
                    "constructor"
                ],
                "TestInterface2": [
                    "constructor"
                ],
                "TestInterface3": [
                    "constructor"
                ]
            },
            "static": {
                "Test1": [
                    "length",
                    "prototype",
                    "methodTestStatic",
                    "name",
                    "interfaces"
                ].sort(),
                "Test2": [
                    "length",
                    "prototype",
                    "methodTestStatic2",
                    "name",
                    "interfaces"
                ].sort(),
                "Test3": [
                    "length",
                    "prototype",
                    "methodTestStatic3",
                    "name",
                    "interfaces"
                ].sort(),
                "TestInterface": [
                    "length",
                    "prototype",
                    "name",
                    "isInterface",
                    "interfaces"
                ].sort(),
                "TestInterface2": [
                    "length",
                    "prototype",
                    "name",
                    "isInterface",
                    "interfaces"
                ].sort(),
                "TestInterface3": [
                    "length",
                    "prototype",
                    "name",
                    "isInterface",
                    "interfaces"
                ].sort()
            }
        };
    let result={
        proto:{},
        static:{}
    };
    let proto=Object.getPrototypeOf(test);
    do{
        let proto_keys=Object.getOwnPropertyNames(proto);
        result.proto[proto.constructor.name]=proto_keys.sort();
        proto=Object.getPrototypeOf(proto);
    } while(proto.constructor!==Object);
    proto=Object.getPrototypeOf(test).constructor;
    do{
        let proto_keys=Object.getOwnPropertyNames(proto);
        result.static[proto.name]=proto_keys.sort();
        proto=Object.getPrototypeOf(proto);
    } while(! proto.hasOwnProperty('constructor'));
    assert.deepEqual(result,match,'checking properties object in a prototypes');
    assert.ok((()=>{
        let proto=Object.getPrototypeOf(test);
        let check=true;
        do{
            let proto_keys=Object.getOwnPropertyNames(proto.constructor);
            if(!proto_keys.includes('interfaces')){
                check=false;
                break;
            }
            proto=Object.getPrototypeOf(proto);
        } while(proto.constructor!==Object);
        return check;
    })(),'checking if the class has an "interfaces" property');
});
/*

QUnit.test('Сборка Примеры',function(assert){
    // Обьявление интерфейса
    // Интерфейс, это класс который помечен как интерфейс.
    // В интерфейсе Методы/свойства/реактивные свойства являются н
    class TestInterface {
        // обьявление метода
        // - если метод указан в интерфейсе, то будет обязательным для класса
        method(){
            // возвращаем критерии для метода
            return {
                // Критерии для аргументов. массив - каждый элемент массива, это критерии для соответствующего аргумента метода
                arguments:[
                    {
                        typeof:'mixed', // определяет тип передаваемых данных
                        values:[] // определяет значения которые необходимо передавать
                    }
                ],
                //критерий для  возвращаемого значения методом
                return:{

                }
            };
        }
        // возвращаем критерии для статического метода
        static static_method(){
            return ; // или return {}; -  эквивалентно {arguments:[], return:{typeof:mixed}}
        }
    }
});*/
