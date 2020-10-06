import {
    InterfaceData, 
    InterfaceError,
    SilentConsole,
    CriteriaType,
    CriteriaPropertyType,
    CriteriaMethodType,
    CriteriaReactType,
    Descriptors,
    InterfaceTools,
    InterfaceRules,
    InterfaceValidator,
    InterfaceBuilder,
    InterfaceApi,
    MirrorInterface
} from '../../src/export.js';
import {console as cnsl} from "../../src/buffer.js";



QUnit.module( 'Class InterfaceData');

QUnit.test('Methods test InterfaceData class',function(assert){

    // get
    {
        class A{};
        let result=InterfaceData.get(A);
        assert.equal(result,undefined,'get => undefined');
    }

    // init
    {
        class A{};
        let match={
            protoProps:{},
            staticProps:{},
            end_points:[],
            isBuilt:false,
            interfaces:[],
            ownRules:[],
            owner:A
        };
        InterfaceData.init(A);
        assert.propEqual(InterfaceData.get(A),match,'init');
    }

    // set
    {
        class A{};
        class B{};
        let match={
            interfaces:[1,1,2],
            protoProps:{
                method:['0']
            },
            staticProps:{
                method:['0']
            },
            end_points:[1,3],
            ownRules:[3],
            isBuilt:false,
            owner:A
        };
        InterfaceData.set(A,{
                interfaces:[1,1,2],
                protoProps:{
                    method:['0']
                },
            staticProps:{
                    method:['0']
            },
            end_points:[1,1,3],
            ownRules:[3]
        });
        assert.propEqual(InterfaceData.get(A),match,'set');
    }

    // has
    {
        class A{};
        assert.equal( InterfaceData.has(A),false,'hasInterfaceData=>false');
        InterfaceData.init(A);
        assert.equal( InterfaceData.has(A),true,'hasInterfaceData=>true');
    }
    //addGlobalEndPoints / setEndPoints / getEndPoints / getAllEndPoints
    {
        let AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
        let check=true;
        let match=[
            Object,
            Array,
            Function,
            AsyncFunction,
            MirrorInterface,
            CriteriaType,
            CriteriaPropertyType,
            CriteriaMethodType,
            CriteriaReactType,
            Descriptors,
            InterfaceApi,
            InterfaceBuilder,
            InterfaceData,
            InterfaceError,
            InterfaceRules,
            InterfaceTools,
            InterfaceValidator,
            SilentConsole,
        ];
        let message;
        try {
            match.forEach(value=>{
                if(!InterfaceData.end_points.includes(value)){
                    throw new Error(`no default end point - "${value.name}" `);
                }
            });
            
        } catch (e) {
            check=false;
            message=e.message;
        }
        assert.ok(check,message??'test default end points');
    }
    {
        let end_points = Object.assign([],InterfaceData.end_points);
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
        InterfaceBuilder.extend(Test);
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
        InterfaceData.setEndPoints(TestInterface2,Test);

        class Test2 extends TestInterface2 {

        }
        class Other{
            
        }
        let Audio=()=>{};
        InterfaceData.setEndPoints(Test2,Other);
        InterfaceData.addGlobalEndPoints(Audio);
        assert.deepEqual(InterfaceData.getAllEndPoints(),end_points.concat([Audio]),'addGlobalEndPoints/getAllEndPoints(undefined)');
        assert.deepEqual(InterfaceData.getAllEndPoints(Test2),end_points.concat([Audio,Other]),'setEndPoints(Class)/getAllEndPoints(Class)');
        assert.throws(
            function(){
                InterfaceBuilder.implement(Test2,true);
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
        try{
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
            InterfaceBuilder.extend(Test2,TestInterface6);
            class CoreTest extends TestInterface2{
                method2(){}
                method3(){}
                method4(){}
                method6(){}
            }
            let rules=InterfaceBuilder.implement(CoreTest,TestInterface3,TestInterface4,Test2);
       
            let test = new CoreTest();
            let match=
                InterfaceData.instanceOfInterface(test,TestInterface)
                && InterfaceData.instanceOfInterface(test,TestInterface2)
                && InterfaceData.instanceOfInterface(test,TestInterface3)
                && InterfaceData.instanceOfInterface(test,TestInterface4)
                && InterfaceData.instanceOfInterface(test,TestInterface6)
                && !InterfaceData.instanceOfInterface(test,TestInterface5)
                && !InterfaceData.instanceOfInterface(test,Test2)
            ;
    
            assert.ok(match,'instanceOfInterface');
        } catch (e) {
            e.renderErrors();
        }

    }
});