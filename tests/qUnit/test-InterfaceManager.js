import {InterfaceError,InterfaceManager,CriteriaPropertyType,CriteriaMethodType,CriteriaReactType,SilentConsole} from '../../src/export.js';

let log=console.log;
let interfaces=Symbol.for('interfacesData');
let consoleMessageTest=(silentConsole,match=[])=>{
    if(!(silentConsole instanceof SilentConsole)){ throw new Error('The instance must be owned SilentConsole class');}
    let check=true;
    if(match instanceof SilentConsole){
        match=match.plugs.stack;
    }
    let sets=silentConsole.plugs.stack;
    for(let key=0; key<match.length; key++){
        if(
            sets[key]===undefined ||
            match[key][0]!==undefined && sets[key][0]!==match[key][0] 
        ){
            check=false;
            break;
        }
        if(match[key][0]===undefined ){
            continue;
            
        }
        if(match[key][0]===sets[key][0]){
            if(match[key][1]===undefined){
                continue;
            }
            for(let x=0; x<match[key][1].length;x++){
                if(['object'].includes(typeof match[key][1][x]) && match[key][1][x]!==null ){
                    if(['object'].includes(typeof sets[key][1][x]) && match[key][1][x]!==null ){
                        // сравнивание обьектов не нужно
                        continue;
                    }
                    check=false;
                    break;
                }
                if(match[key][1][x]===sets[key][1][x]){
                    continue;
                } else {
                    check=false;
                    break;
                }
            }
        } else {
            check=false;
            break;
        }
    }
    return check;
};
QUnit.module( 'Class InterfaceManager');
/*QUnit.test('Test',function(assert){
    let scMath= new SilentConsole();
    scMath.denyToSpeak(true);
    console.group('Group');
    console.warn('Bad');
    console.groupEnd();
    scMath.allowToSpeak();
    console.log(scMath);
    let sc = new SilentConsole();
    console.log(sc);
    sc.denyToSpeak(true);
    console.group('Group');
    console.warn('Bad');
    console.groupEnd();
    assert.ok(consoleMessageTest(sc,scMath),'qwer');
    sc.allowToSpeak();
});*/
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
            interfaces:[],
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
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            get react (){
                return {
                    types:'mixed'
                };
            }
            set react(v){
                return {
                    types:'mixed'
                }
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'mixed'
                };
            }
            static set static_react(v){
                v.types='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            types:'mixed'
        };
        InterfaceTest.static_prop={
            types:'mixed'
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
                        //class:InterfaceTest,
                        criteria:new CriteriaMethodType({
                            arguments:[{types:'mixed'}],
                            return:{types:'mixed'},
                            options:rules.staticProps.static_method[0].criteria.options
                        })
                    }

                ],
                static_react:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaReactType({get:{types: 'mixed'},set: {types: 'mixed'}, options:rules.staticProps.static_react[0].criteria.options})
                    }
                ],
                static_prop:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaPropertyType({types:'mixed', options: rules.staticProps.static_prop[0].criteria.options})
                    }
                ]
            },
            protoProps:{
                method:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaMethodType({arguments:[{types: 'mixed'}],return: {types: 'mixed'}, options:rules.protoProps.method[0].criteria.options})
                    }
                ],
                react:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaReactType({get:{types: 'mixed'}, set:{types: 'mixed'}, options:rules.protoProps.react[0].criteria.options})
                    }
                ],
                prop:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaPropertyType({types:'mixed',options: rules.protoProps.prop[0].criteria.options})
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
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            get react (){
                return {
                    types:'mixed'
                };
            }
            set react(v){
                v.types='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'mixed'
                };
            }
            static set static_react(v){
                v.types='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            types:'mixed'
        };
        InterfaceTest.static_prop={
            types:'mixed'
        };
        InterfaceTest.isInterface=true;
        let staticDescs=InterfaceManager.getDescriptors(InterfaceTest);
        let protoDescs=InterfaceManager.getDescriptors(InterfaceTest.prototype);
        let rules=InterfaceManager.generateRules(InterfaceTest);
        let match={
            "interfaces": [
                InterfaceTest
            ],
            staticProps:{
                static_method:[
                    {
                        //class:InterfaceTest,
                        criteria:new CriteriaMethodType({arguments:[{types:'mixed'}],return:{types:'mixed'},options:rules.staticProps.static_method[0].criteria.options})
                    }

                ],
                static_react:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaReactType({get:{types: 'mixed'}, set:{types: 'mixed'}, options:rules.staticProps.static_react[0].criteria.options})
                    }
                ],
                static_prop:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaPropertyType({types:'mixed', options:rules.staticProps.static_prop[0].criteria.options})
                    }
                ]
            },
            protoProps:{
                method:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaMethodType({arguments:[{types: 'mixed'}], return:{types: 'mixed'}, options:rules.protoProps.method[0].criteria.options})
                    }
                ],
                react:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaReactType({get:{types: 'mixed'}, set:{types: 'mixed'}, options:rules.protoProps.react[0].criteria.options})
                    }
                ],
                prop:[
                    {
                        //class: InterfaceTest,
                        criteria: new CriteriaPropertyType({types:'mixed', options:rules.protoProps.prop[0].criteria.options})
                    }
                ]
            }
        };
        QUnit.dump.maxDepth=7;
        assert.deepEqual(rules,match,'generateRules');
    }
    // compareAndSetRule
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            types:'number',
                            includes:[1,2,3]
                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1,2,3]
                    }
                };
            }
            method2(){
                return {
                    arguments:[
                        {
                            types:'number',
                            includes:[3,4,5]
                        }
                    ],
                    return:{
                        types:'number',
                        includes:[3,4,5]
                    }
                };
            }
        }
        TestInterface.isInterface=true;
        let rules=InterfaceManager.generateRules(TestInterface);
        class TestInterface2 {
            method(){ // success
                return {
                    arguments:[
                        {
                            types:'number',
                            includes:[2,3]
                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1,2]
                    }
                };
            }
        }
        TestInterface2.isInterface=true;
        let rules2=InterfaceManager.generateRules(TestInterface2);
        for(let prop of Object.getOwnPropertyNames(rules2.protoProps)){
                InterfaceManager.compareAndSetRule(rules.protoProps,prop,rules2.protoProps[prop][0]);
        }
        let match={
            "interfaces":[
                TestInterface
            ],
            protoProps:{
                method:[
                    {
                        criteria:new CriteriaMethodType({arguments:[{types:'number',includes:[2,3]}],return:{types:'number',includes:[1,2]},options:rules.protoProps.method[0].criteria.options})
                    }
                ],
                method2:[
                    {
                        criteria:new CriteriaMethodType({arguments:[{types:'number',includes:[3,4,5]}],return:{types:'number',includes:[3,4,5]},options:rules.protoProps.method2[0].criteria.options})
                    }
                ]
            },
            staticProps:{}
        };
        QUnit.dump.maxDepth=8;
        assert.deepEqual(rules,match,'compareAndSetRule');
    }
    // expandAndSetRule
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[1,2,3]
                        }
                    ],
                     return:{
                        types:'mixed',
                         includes:[1,2,3]
                     }
                };
            }
            method2(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[3,4,5]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[3,4,5]
                    }
                };
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[1,2,3]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[1,2,3]
                    }
                };
            }
            static static_method2(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[1,2,3]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[1,2,3]
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
                            types:'mixed',
                            includes:[3,4,5]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[3,4,5]
                    }
                };
            }
            method3(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[3,4,5]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[3,4,5]
                    }
                };
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[3,4,5]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[3,4,5]
                    }
                };
            }
            static static_method3(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[3,4,5]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[3,4,5]
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
                "interfaces": [
                    TestInterface
                ],
                protoProps:{
                    method:[
                        {
                           // class:TestInterface2,
                            criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[1,2,3,4,5]}],return:{types:'mixed',includes:[1,2,3,4,5]},options:rules.protoProps.method[0].criteria.options})
                        }
                    ],
                    method2:[
                        {
                           // class:TestInterface,
                            criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[3,4,5]}],return:{types:'mixed',includes:[3,4,5]},options:rules.protoProps.method2[0].criteria.options})
                        }
                    ],
                    method3:[
                        {
                           // class:TestInterface2,
                            criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[3,4,5]}],return:{types:'mixed',includes:[3,4,5]},options:rules.protoProps.method3[0].criteria.options})
                        }
                    ],
                },
                staticProps:{
                    static_method:[
                        {
                           // class:TestInterface2,
                            criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[1,2,3,4,5]}],return:{types:'mixed',includes:[1,2,3,4,5]},options:rules.staticProps.static_method[0].criteria.options})
                        }
                    ],
                    static_method2:[
                        {
                           // class:TestInterface,
                            criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[1,2,3]}],return:{types:'mixed',includes:[1,2,3]},options:rules.staticProps.static_method2[0].criteria.options})
                        }
                    ],
                    static_method3:[
                        {
                           // class:TestInterface2,
                            criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[3,4,5]}],return:{types:'mixed',includes:[3,4,5]},options:rules.staticProps.static_method3[0].criteria.options})
                        }
                    ],
                }
        };
        QUnit.dump.maxDepth=8;
        assert.deepEqual(rules,match,'expandAndSetRule');
    }

    // addRules (compare)
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[1,2,3]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[1,2,3]
                    }
                };
            }
            method2(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[3,4,5]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[3,4,5]
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
                            types:'mixed',
                            includes:[1,2]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[1,2]
                    }
                };
            }
            method3(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[6,7]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[6,7]
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
            interfaces:[
                TestInterface,
                TestInterface2

            ],
            builtProps: {
                protoProps: [],
                staticProps: []
            },
            protoProps:{
                method:[
                    {
                        criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[1,2]}],return:{types:'mixed',includes:[1,2]},options:rules.protoProps.method[0].criteria.options})
                    }
                ],
                method2:[
                    {
                        criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[3,4,5]}],return:{types:'mixed',includes:[3,4,5]},options:rules.protoProps.method2[0].criteria.options})
                    }
                ],
                method3:[
                    {
                        criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[6,7]}],return:{types:'mixed',includes:[6,7]},options:rules.protoProps.method3[0].criteria.options})
                    }
                ],
            },
            staticProps: {},
            end_points: [],
            isBuilt:false,
        };
        QUnit.dump.maxDepth=8;
        assert.deepEqual(rules,match,'addRules (compare)');

    }

    // addRules (expand)
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[1,2,3]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[1,2,3]
                    }
                };
            }
            method2(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[3,4,5]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[3,4,5]
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
                            types:'mixed',
                            includes:[3,4,5]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[3,4,5]
                    }
                };
            }
            method3(){
                return {
                    arguments:[
                        {
                            types:'mixed',
                            includes:[6,7]
                        }
                    ],
                    return:{
                        types:'mixed',
                        includes:[6,7]
                    }
                };
            }

        }
        TestInterface2.isInterface=true;
        let rules=InterfaceManager.generateRules(TestInterface);
        let rules2=InterfaceManager.generateRules(TestInterface2);
        InterfaceManager.addRules(TestInterface2,rules,true);
        InterfaceManager.addRules(TestInterface2,rules2,true);
        rules=InterfaceManager.getInterfaceData(TestInterface2);
        let match={
            interfaces:[
                TestInterface,
                TestInterface2
            ],
            builtProps: {
                protoProps: [],
                staticProps: []
            },
            protoProps:{
                method:[
                    {
                        criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[1,2,3,4,5]}],return:{types:'mixed',includes:[1,2,3,4,5]},options:rules.protoProps.method[0].criteria.options})
                    }
                ],
                method2:[
                    {
                        criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[3,4,5]}],return:{types:'mixed',includes:[3,4,5]},options:rules.protoProps.method2[0].criteria.options})
                    }
                ],
                method3:[
                    {
                        criteria:new CriteriaMethodType({arguments:[{types:'mixed',includes:[6,7]}],return:{types:'mixed',includes:[6,7]},options:rules.protoProps.method3[0].criteria.options})
                    }
                ],
            },
            staticProps: {},
            end_points: [],
            isBuilt:false,
        };
        QUnit.dump.maxDepth=8;
        assert.deepEqual(rules,match,'addRules (expand)');

    }

    // clearClass
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            get react (){
                return {
                    types:'mixed'
                };
            }
            set react(v){
                v.types='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'mixed'
                };
            }
            static set static_react(v){
                v.types='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            types:'mixed'
        };
        InterfaceTest.static_prop={
            types:'mixed'
        };
        InterfaceTest.isInterface=true;
        InterfaceManager.initInterfaceData(InterfaceTest);
        InterfaceManager.clearClass(InterfaceTest);
        let match={
            protoProps:['constructor'].sort(),
            staticProps:["length", "prototype", "name", "isInterface"].sort()
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
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            get react (){
                return {
                    types:'mixed'
                };
            }
            set react(v){
                v.types='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'mixed'
                };
            }
            static set static_react(v){
                v.types='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            types:'mixed'
        };
        InterfaceTest.static_prop={
            types:'mixed'
        };
        class Test{
            method(){}
            static static_method(){}
        }
        InterfaceTest.isInterface=true;
        let rules=InterfaceManager.initRules(InterfaceTest);
        let matchInterfaces={
            [Symbol.for('interfacesData')]:{
                builtProps:{
                    protoProps:[],
                    staticProps:[]
                },
                protoProps:{
                        method:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaMethodType([{types:'mixed'}],{types:'mixed'},rules.protoProps.method[0].criteria.options)
                        }
                    ],
                    react:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaReactType({types:'mixed'},{types:'mixed'},rules.protoProps.react[0].criteria.options)
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
                            criteria:new CriteriaMethodType([{types:'mixed'}],{types:'mixed'},rules.staticProps.static_method[0].criteria.options)
                        }
                    ],
                    static_react:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaReactType({types:'mixed'},{types:'mixed'},rules.staticProps.static_react[0].criteria.options)
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
            [Symbol.for('interfacesData')]:{
                builtProps:{
                    protoProps:[],
                    staticProps:[]
                },
                protoProps:{
                    method:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaMethodType([{types:'mixed'}],{types:'mixed'},rules.protoProps.method[0].criteria.options)
                        }
                    ],
                    react:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaReactType({types:'mixed'},{types:'mixed'},rules.protoProps.react[0].criteria.options)
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
                            criteria:new CriteriaMethodType([{types:'mixed'}],{types:'mixed'},rules.staticProps.static_method[0].criteria.options)
                        }
                    ],
                    static_react:[
                        {
                            class:InterfaceTest,
                            criteria:new CriteriaReactType({types:'mixed'},{types:'mixed'},rules.staticProps.static_react[0].criteria.options)
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
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            /*get react (){
                return {
                    types:'mixed'
                };
            }*/
            set react(v){
                v.types='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'mixed'
                };
            }
            static set static_react(v){
                v.types='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            types:'number'
        };
        InterfaceTest.static_prop={
            types:'number'
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
                staticProps:InterfaceManager.validateDescriptors(staticDescs,rules.staticProps),
                protoProps:InterfaceManager.validateDescriptors(protoDescs,rules.protoProps)
            };
            let match={
                staticProps:[
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['InterfaceTest','.static_method']}),
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['InterfaceTest','.static_react']}),
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['InterfaceTest','.static_prop']})
                ],
                protoProps:[

                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['InterfaceTest','.method']}),
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['InterfaceTest','.react']}),
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['InterfaceTest','.prop']})

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
                staticProps:InterfaceManager.validateDescriptors(staticDescs,rules.staticProps),
                protoProps:InterfaceManager.validateDescriptors(protoDescs,rules.protoProps)
            };
            let match={
                staticProps:[
                    new InterfaceError('ValidateReactDeclared',{entryPoints:['InterfaceTest','.static_react']}),
                    new InterfaceError('ValidateType',{entryPoints:['InterfaceTest','.static_prop']})
                ],
                protoProps:[
                    new InterfaceError('ValidateMethodDeclared',{entryPoints:['InterfaceTest','.method']}),
                    new InterfaceError('ValidateReactDeclared',{entryPoints:['InterfaceTest','.react','get']}),
                    new InterfaceError('ValidateReactDeclared',{entryPoints:['InterfaceTest','.react','set']}),
                    new InterfaceError('ValidateType',{entryPoints:['InterfaceTest','.prop']})

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
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            /*get react (){
                return {
                    types:'mixed'
                };
            }*/
            set react(v){
                v.types='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'mixed'
                };
            }
            static set static_react(v){
                v.types='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            types:'number'
        };
        InterfaceTest.static_prop={
            types:'number'
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
        let errors=[];
        assert.throws(function(){
            InterfaceManager.validatePropsClass(Test,rules,errors);
        },function (e) {
            return e instanceof InterfaceError && e.type==='Validate_BadMembers'
        },'validatePropsClass');
    }

    // buildPropsDescriptors
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            types:'number'
                        }
                    ],
                    return:{
                        types:'number'
                    }
                };
            }
            get react (){
                return {
                    types:'number'
                };
            }
            set react(v){
                v.types='number';
            }
            /*static static_method(){
                return {
                    arguments:[
                        {
                            types:'number'
                        }
                    ],
                    return:{
                        types:'number'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'number'
                };
            }
            static set static_react(v){
                v.types='number';
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
                            types:'number'
                        }
                    ],
                    return:{
                        types:'number'
                    }
                };
            }
            get react (){
                return {
                    types:'number'
                };
            }
            set react(v){
                v.types='number';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'number'
                        }
                    ],
                    return:{
                        types:'number'
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
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
                    }
                };
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
                    }
                };
            }
            static static_method2(){
                return {
                    arguments:[
                        {
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
            Test2[interfaces].builtProps.protoProps.includes('method2')
            && Test2[interfaces].builtProps.staticProps.includes('static_method2')
            && Test2[interfaces].protoProps.method[0].criteria.getOwner() === TestInterface
            && Test2[interfaces].protoProps.method2[0].criteria.getOwner() === TestInterface2
            && Test2[interfaces].staticProps.static_method[0].criteria.getOwner() === TestInterface
            && Test2[interfaces].staticProps.static_method2[0].criteria.getOwner() === TestInterface2
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

            && Test[interfaces].builtProps.protoProps.includes('method')
            && !Test[interfaces].builtProps.protoProps.includes('method2')
            && Test[interfaces].builtProps.staticProps.includes('static_method')
            && !Test[interfaces].builtProps.staticProps.includes('static_method2')
            && Test[interfaces].protoProps.method[0].criteria.getOwner() === TestInterface
            && !('method2' in Test[interfaces].protoProps)
            && Test[interfaces].staticProps.static_method[0].criteria.getOwner() === TestInterface
            && !('static_method2' in Test[interfaces].staticProps)
            && throwTest(Test.prototype.method,'1')
            && throwTest(Test.prototype.method,1)
            && throwTest(Test.static_method,'1')
            && throwTest(Test.static_method,1)
            && ! Test.prototype.hasOwnProperty('method2')
            && ! Test.hasOwnProperty('static_method2')

        ;
        assert.ok(match,'buildInterface');
    }
    // extendInterfaces
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
        InterfaceManager.extendInterfaces(Test3);

        class Test4 extends Test3{
            method4(a){
                return '1';
            }
            method5(a){
                return '1';
            }
        }
        InterfaceManager.extendInterfaces(Test4,TestInterface4,TestInterface5);
        let match=
                Test[interfaces].builtProps.protoProps.includes('method')
             && Test2[interfaces].builtProps.protoProps.includes('method2')
             && !Test3[interfaces].builtProps.protoProps.includes('method3')
             && !Test4[interfaces].builtProps.protoProps.includes('method3')
             && Test4[interfaces].builtProps.protoProps.includes('method4')
             && Test4[interfaces].builtProps.protoProps.includes('method5')
             && Test4[interfaces].protoProps.method[0].criteria.getOwner() === TestInterface
             && Test4[interfaces].protoProps.method2[0].criteria.getOwner() === TestInterface2
             && Test4[interfaces].protoProps.method3[0].criteria.getOwner() === TestInterface3
             && Test4[interfaces].protoProps.method4[0].criteria.getOwner() === TestInterface4
             && Test4[interfaces].protoProps.method5[0].criteria.getOwner() === TestInterface5
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
        assert.ok(match,'extendInterfaces');
    }

    // expandInterfaces
    {

    }


    // implementInterfaces
    {
        class TestInterface {
            method(){
                return {
                    arguments:[
                        {
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
                            types:'number',

                        }
                    ],
                    return:{
                        types:'number',
                        includes:[1]
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
        InterfaceManager.extendInterfaces(Test2);

        class Test3 extends Test2{

        }
        assert.throws(function(){
            InterfaceManager.implementInterfaces(Test3,TestInterface3);
        },function(e){
            return e instanceof InterfaceError && e.type === "Validate_BadMembers"
        },'implementInterfaces');
    }

    // extractOwnDescriptors
    {

    }
    // extendInterfaces + extendClassFromOwnPrototypes
    {
        class TestInterface{
            method(){
                return {
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
            method2(){
                return {
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
            static method(){
                return {
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
            static method2(){
                return {
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
        let rules=InterfaceManager.extendInterfaces(Test2,false,true,TestInterface);
        let match=
               Test2.method(0)=== 1
            && Test2.method2(0)=== 2
            && Test2.prototype.method(0) === 1
            && Test2.prototype.method2(0) === 2
            && throwTest(Test2.method,'0')
            && throwTest(Test2.method2,'0')
            && throwTest(Test2.prototype.method,'0')
            && throwTest(Test2.prototype.method2,'0');
        assert.ok(match,'extendInterfaces + extendClassFromOwnPrototypes');
    }

    //addGlobalEndPoints / setEndPoints / getEndPoints / getAllEndPoints
    {
        let end_points = Object.assign([],InterfaceManager.end_points);
        class TestInterface{
            method(){
                return {
                    arguments:[{
                        types:'number'
                    }],
                    return:{ types:'number'}
                };
            };
        };
        TestInterface.isInterface=true;


        class Test extends TestInterface {
            method2(){return 1};
            method(){return 1};
        };
        InterfaceManager.extendInterfaces(Test);
        class TestInterface2 extends Test{
            method2(){
                return {
                    arguments:[{
                        types:'number'
                    }],
                    return:{ types:'number'}
                };
            };
        };
        TestInterface2.isInterface=true;
        InterfaceManager.setEndPoints(TestInterface2,[Test]);

        class Test2 extends TestInterface2 {

        };
        class Other{}
        let Audio=()=>{};
        InterfaceManager.setEndPoints(Test2,[Other]);
        InterfaceManager.addGlobalEndPoints([Audio]);
        assert.deepEqual(InterfaceManager.getAllEndPoints(),end_points.concat([Audio]),'addGlobalEndPoints/getAllEndPoints(undefined)');
        assert.deepEqual(InterfaceManager.getAllEndPoints(Test2),end_points.concat([Audio,Other]),'setEndPoints(Class)/getAllEndPoints(Class)');
        assert.throws(
                function(){
                    InterfaceManager.implementInterfaces(Test2,true);
                },
                function(e){
                    return  e instanceof InterfaceError && e.type==="Validate_BadMembers";
                },
                'Test end points for class (validate)'
        );
        assert.ok(!Test2.prototype.hasOwnProperty('method')&&!Test2.prototype.hasOwnProperty('method2'),'end points: check if methods are extended ');
    }
    // instanceOfInterface
    {
        class TestInterface {
            method(){}
        }
        TestInterface.isInterface=true;
        class Test extends TestInterface {
            method(){}
        }
        class TestInterface2 extends Test{
            method2(){}
        }
        TestInterface2.isInterface=true;

        class TestInterface3 extends Test {
            method3(){}
        }
        TestInterface3.isInterface=true;

        class TestInterface4 {
            method4(){}
        }
        TestInterface4.isInterface=true;

        class TestInterface5 {
            method5(){}
        }
        TestInterface5.isInterface=true;

        class TestInterface6{
            method6(){}
        }
        TestInterface6.isInterface=true;

        class Test2{

        };
        InterfaceManager.extendInterfaces(Test2,TestInterface6);
        class CoreTest extends TestInterface2{
            method2(){}
            method3(){}
            method4(){}
            method6(){}
        }
        let rules=InterfaceManager.implementInterfaces(CoreTest,TestInterface3,TestInterface4,Test2);
        let test = new CoreTest();
        let match=
            InterfaceManager.instanceOfInterface(test,TestInterface)
            && InterfaceManager.instanceOfInterface(test,TestInterface2)
            && InterfaceManager.instanceOfInterface(test,TestInterface3)
            && InterfaceManager.instanceOfInterface(test,TestInterface4)
            && InterfaceManager.instanceOfInterface(test,TestInterface6)
            && !InterfaceManager.instanceOfInterface(test,TestInterface5)
            && !InterfaceManager.instanceOfInterface(test,Test2)
        ;
        assert.ok(match,'instanceOfInterface');
    }
    // test
    {
        class TestInterface {
            method(){}
        }
    }
});

