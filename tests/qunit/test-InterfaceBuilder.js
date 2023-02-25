import {
    InterfaceError,
    InterfaceData,
    Descriptors,
    InterfaceRules,
    InterfaceBuilder,
    CriteriaMethodType, 
} from '../../src/export.js';
import {ownerSandbox} from "../../src/InterfaceBuilder.js";

QUnit.module( 'Class InterfaceBuilder');
QUnit.test('Methods test InterfaceBuilder class',function(assert){
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
    // generateSandbox
    {
        let criteria= new CriteriaMethodType({
            arguments:[
                {types:['number']}
            ],
            return:{
                types:['number']
            }
        });
        let func=function(a,b){};
        let sandbox=InterfaceBuilder.generateSandbox(func,criteria);
        let results=[
            sandbox!==func,
            InterfaceBuilder.getOwnerOfSandbox(sandbox)===func,
            sandbox.name===func.name
        ];

        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'is owner sandbox');
        assert.throws(
            function(){
                sandbox('1');
            },
            function(e){
                return e instanceof InterfaceError;
            },
            'throws generateSandbox for arguments'
        );
        assert.throws(
            function(){
                sandbox(1);
            },
            function(e){
                return e instanceof InterfaceError;
            },
            'throws generateSandbox for return'
        );
    }
    // buildDescriptors
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
        let rules=InterfaceRules.init(InterfaceTest);
        let rules2=InterfaceRules.init(Test,rules);
        let descs1=Descriptors.get(Test.prototype);
        let descs2=Descriptors.get(Test.prototype);
        InterfaceBuilder.buildDescriptors(descs1,rules.protoProps);
        InterfaceBuilder.buildDescriptors(descs1,rules.protoProps); // rebuild
        let results=[
            descs1.method.value!==descs2.method.value,//0
            descs1.method.value[ownerSandbox]===descs2.method.value,
            throwTest(descs1.method.value,'1'),
            throwTest(descs1.method.value,1),
            descs1.method2.value===descs2.method2.value,
            descs1.react.get!==descs2.react.get,
            descs1.react.get[ownerSandbox]===descs2.react.get
            ,throwTest(descs1.react.get)
            ,descs1.react.set!==descs2.react.set
            ,descs1.react.set[ownerSandbox]===descs2.react.set
            ,throwTest(descs1.react.set,'1')
        ];
        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'buildDescriptors');
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
        let rules=InterfaceRules.init(InterfaceTest);
        InterfaceRules.init(Test,rules);
        let descs2 =Descriptors.get(Test.prototype);
        let sDescs2 =Descriptors.get(Test);
        InterfaceBuilder.buildClass(Test,rules);
        InterfaceBuilder.buildClass(Test,rules);//rebuild
        let descs1 =Descriptors.get(Test.prototype);
        let sDescs1 =Descriptors.get(Test);
        let results= [
            descs1.method.value!==descs2.method.value
            , descs1.method.value[ownerSandbox]===descs2.method.value
            , throwTest(descs1.method.value,'1')
            , throwTest(descs1.method.value,1)
            , sDescs1.static_method.value!==sDescs2.static_method.value
            , sDescs1.static_method.value[ownerSandbox]===sDescs2.static_method.value
            , throwTest(sDescs1.static_method.value,'1')
            , throwTest(sDescs1.static_method.value,1)
            ]
        ;
        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'buildPropsClass');
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
        InterfaceBuilder.buildInterface(Test2);
        let interfaceData2=InterfaceData.get(Test2);
        let interfaceData=InterfaceData.get(Test);
        let results=[
            InterfaceBuilder.isSandbox(Test2.prototype['method2']),
            InterfaceBuilder.isSandbox(Test2['static_method2']),
            interfaceData2.protoProps.method[0].criteria.getOwner() === TestInterface,
            interfaceData2.protoProps.method2[0].criteria.getOwner() === TestInterface2,
            interfaceData2.staticProps.static_method[0].criteria.getOwner() === TestInterface,
            interfaceData2.staticProps.static_method2[0].criteria.getOwner() === TestInterface2,
            throwTest(Test2.prototype.method,'1'),
            throwTest(Test2.prototype.method,1),
            throwTest(Test2.prototype.method2,'1'),
            throwTest(Test2.prototype.method2,1),
            Test2.prototype.method === Test.prototype.method,
            ! Test2.prototype.hasOwnProperty('method'),
            throwTest(Test2.static_method,'1'),
            throwTest(Test2.static_method,1),
            throwTest(Test2.static_method2,'1'),
            throwTest(Test2.static_method2,1),
            ! Test2.hasOwnProperty('static_method'),
            Test2.static_method === Test.static_method,

            InterfaceBuilder.isSandbox(Test.prototype['method']),
            !InterfaceBuilder.isSandbox(Test.prototype['method2']),
            InterfaceBuilder.isSandbox(Test['static_method']),
            !InterfaceBuilder.isSandbox(Test['static_method2']),
            interfaceData.protoProps.method[0].criteria.getOwner() === TestInterface,
            !('method2' in interfaceData.protoProps),
            interfaceData.staticProps.static_method[0].criteria.getOwner() === TestInterface,
            !('static_method2' in interfaceData.staticProps),
            throwTest(Test.prototype.method,'1'),
            throwTest(Test.prototype.method,1),
            throwTest(Test.static_method,'1'),
            throwTest(Test.static_method,1),
            ! Test.prototype.hasOwnProperty('method2'),
            ! Test.hasOwnProperty('static_method2')
        ];
        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'buildInterface');
    }
    // extend
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
        InterfaceBuilder.extend(Test3);
        class Test4 extends Test3{
            method4(a){
                return '1';
            }
            method5(a){
                return '1';
            }
        }
        InterfaceBuilder.extend(Test4,TestInterface4,TestInterface5);
        let results=[
            InterfaceBuilder.isSandbox(Test.prototype['method']),
            InterfaceBuilder.isSandbox(Test2.prototype['method2']),
            !InterfaceBuilder.isSandbox(Test3.prototype['method3']),
            !InterfaceBuilder.isSandbox(Test4.prototype['method3']),
            InterfaceBuilder.isSandbox(Test4.prototype['method4']),
            InterfaceBuilder.isSandbox(Test4.prototype['method5']),
            ('method5' in InterfaceData.get(Test4).protoProps),
            InterfaceData.get(Test4).protoProps.method[0].criteria.getOwner() === TestInterface,
            InterfaceData.get(Test4).protoProps.method2[0].criteria.getOwner() === TestInterface2,
            InterfaceData.get(Test4).protoProps.method3[0].criteria.getOwner() === TestInterface3,
            InterfaceData.get(Test4).protoProps.method4[0].criteria.getOwner() === TestInterface4,
            InterfaceData.get(Test4).protoProps.method5[0].criteria.getOwner() === TestInterface5,
            ('method'in Test4.prototype),
            ('method2'in Test4.prototype),
            ('method3'in Test4.prototype),
            ('method4'in Test4.prototype),
            ('method5'in Test4.prototype),
            throwTest(Test4.prototype.method,1),
            throwTest(Test4.prototype.method2,1),
            !throwTest(Test4.prototype.method3,1), //  check for availability will take place, but checks during execution will not be performed
            throwTest(Test4.prototype.method4,1),
            throwTest(Test4.prototype.method5,1)
            ];
        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'extend');
    }

    // implement
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
        InterfaceBuilder.extend(Test2);

        class Test3 extends Test2{

        }
        assert.throws(function(){
            InterfaceBuilder.implement(Test3,TestInterface3);
        },function(e){
            return e instanceof InterfaceError && e.type === "Validate_BadMembers"
        },'implement');
    }
    
    // extend + extendClassFromOwnPrototypes
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
        InterfaceBuilder.extend(Test2,true,TestInterface);
        let sDescs=Object.getOwnPropertyDescriptors(Test2);
        let descs=Object.getOwnPropertyDescriptors(Test2.prototype);
       let results=[
           sDescs.method!==undefined && sDescs.method.value!==undefined && InterfaceBuilder.isSandbox(sDescs.method.value),
           sDescs.method2!==undefined && sDescs.method2.value!==undefined && InterfaceBuilder.isSandbox(sDescs.method.value),
           descs.method!==undefined && descs.method.value!==undefined && InterfaceBuilder.isSandbox(descs.method.value),
           descs.method2!==undefined && descs.method2.value!==undefined && InterfaceBuilder.isSandbox(descs.method.value),
        ];
        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'extend + extendClassFromOwnPrototypes');
    }
});