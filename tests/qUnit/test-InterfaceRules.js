import {
    Descriptors,
    InterfaceData,
    InterfaceRules,
    CriteriaMethodType,
    CriteriaReactType,
    CriteriaPropertyType
    
} from '../../src/export.js';
QUnit.module( 'Class InterfaceRules');

QUnit.test('Methods test InterfaceRules class',function(assert){
    // generateForDescriptors
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
        let staticDescs=Descriptors.get(InterfaceTest);
        let protoDescs=Descriptors.get(InterfaceTest.prototype);
        let rules={
            staticProps:InterfaceRules.generateForDescriptors(staticDescs),
            protoProps:InterfaceRules.generateForDescriptors(protoDescs)
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
        let staticDescs=Descriptors.get(InterfaceTest);
        let protoDescs=Descriptors.get(InterfaceTest.prototype);
        let rules=InterfaceRules.generate(InterfaceTest);
        let match= new InterfaceData();
        Object.assign(match,{
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
        });
        QUnit.dump.maxDepth=7;
        assert.deepEqual(rules,match,'generate');
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
        let rules=InterfaceRules.generate(TestInterface);
        let rules2=InterfaceRules.generate(TestInterface2);
        InterfaceRules.add(TestInterface2,rules);
        InterfaceRules.add(TestInterface2,rules2);
        rules=Object.assign({},InterfaceData.get(TestInterface2));
        let match={
            interfaces:[
                TestInterface,
                TestInterface2

            ],
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
            ownRules:[],
            staticProps: {},
            end_points: [],
            isBuilt:false,
        };
        QUnit.dump.maxDepth=9;
        assert.deepEqual(rules,match,'addRules (compare)');

    }


    // clearInterface
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
        InterfaceData.init(InterfaceTest);
        InterfaceRules.clearInterface(InterfaceTest);
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

    // init
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
        let rules=InterfaceRules.init(InterfaceTest);
        let matchInterfaces={
            [Symbol.for('interfaceData')]:{
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
        assert.deepEqual(equal,matchInterfaces,'init - for interface');
        let matchClass={
            [Symbol.for('interfaceData')]:{
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
        InterfaceRules.init(Test,rules);
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
        assert.deepEqual(equal,matchClass,'init - for class');
    }
});