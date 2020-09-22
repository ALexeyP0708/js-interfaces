
import {InterfaceManager,CriteriaMethodType, CriteriaPropertyType} from "../../src/export.js";


QUnit.module( 'Test API');

QUnit.test('Test API',function(assert){
    console.log('sdfs');
    let criteria=new CriteriaPropertyType({
        types:'number'
    });
    let criteria2=new CriteriaMethodType({});
    criteria.compare(criteria2);
/*
    class InterfaceTest{
        method(){
            return {
                arguments:[
                    {
                        types:['number'],
                    }
                ]
            };
        }
        
        static method(){}
        get react(){}
        set react(v){}
    }
    InterfaceTest.isInterface=true;
    class InterfaceTest2{
        method(){
            return {
                arguments:[
                    {
                        types:['string'],
                    },
                    {
                        types:['number'],
                    }
                ],
                
            };
        }

        //static method(){}
        //get react(){}
        //set react(v){}
    }
    InterfaceTest2.isInterface=true;
    class Test{};
    InterfaceManager.extendInterfaces(Test,InterfaceTest,InterfaceTest2);
    //InterfaceManager.extendInterfaces(Test,InterfaceTest2);
    console.log([Test]);*/
    assert.ok(true);
});