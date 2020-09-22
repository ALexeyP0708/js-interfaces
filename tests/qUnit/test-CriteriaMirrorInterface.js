import {CriteriaMirrorInterface,InterfaceError, InterfaceManager} from '../../src/export.js';

QUnit.module( 'Class CriteriaMirrorInterface');
QUnit.test('test methods CriteriaMirrorInterface',function(assert){
    
    {
        class MirrorTest extends CriteriaMirrorInterface {

        };
        MirrorTest.prototype.hello={
            types:'number'
        };
        MirrorTest.prototype.bay={
            types:'number'
        };
        MirrorTest.isInterface=true;
        InterfaceManager.extendInterfaces(MirrorTest);
        assert.throws(function(){
            MirrorTest.validate({
                hello:'friend',
            });
        },function(e){
            if(e instanceof InterfaceError && e.type==='Validate_BadMirrorProperties' ){
                return true;
            }
            return false;
        },'CriteriaMirrorInterface.validate method');
    }
    
    {
        class MirrorTest extends CriteriaMirrorInterface {
        };
        MirrorTest.prototype.specific={
            types:CriteriaMirrorInterface.createInterface('Mirror',{
                name:{types:'number'}
            })
        };
        assert.throws(function(){
            MirrorTest.validate({
                specific:{name:'friend'}
            });
        },function(e){
            if(e instanceof InterfaceError && e.type==='Validate_BadMirrorProperties' ){
                return true;
            }
            return false;
        },'CriteriaMirrorInterface.validate method 2');
    }
    
    {
        let MirrorTest=CriteriaMirrorInterface.createInterface('MirrorTest',{
            method(){
                return {
                    arguments:[
                        {
                            types:CriteriaMirrorInterface.createInterface('Mirror',{
                                name:{types:'number'}
                            })
                        }
                    ],
                    return:{
                        types:CriteriaMirrorInterface.createInterface('Mirror',{
                            name:{types:'number'}
                        })
                    }    
                }
            }
        });
        
        class Test extends MirrorTest{
            method(arg){
                return {name:'hello'};
            }
        };
        InterfaceManager.extendInterfaces(Test);
        let mirror=new Test();
        assert.throws(function(){
            mirror.method({name:1});
        },function(e){
            if(e instanceof InterfaceError && e.type==='ValidateType' ){
                return true;
            }
            return false;
        },'CriteriaMirrorInterface.validate method 3');
    }
//
    {
       class Mirror extends CriteriaMirrorInterface{
           
       }
        CriteriaMirrorInterface.createInterface(Mirror,{
            method(){
                return {
                    arguments:[
                        {
                            types:['number']
                        }
                    ]
                };
            }
        },{
            method2(){
                return {
                    arguments:[
                        {
                            types:['number']
                        }
                    ]
                };
            }
        });
       class InterfaceTest{
           static test(){
                return {
                    arguments:[
                        {
                            types:[Mirror]
                        }
                    ]
                };
            }   
       };
        InterfaceTest.isInterface=true;
        class Factory{
            static test(Class){
                console.log([Class]);
                Class.method2('hello');
            }
        };  
        InterfaceManager.extendInterfaces(Factory,InterfaceTest);
        class Hello{
            method(arg){}
        };
        class SubHello extends Hello {
            //static method2(arg){}
        }
        assert.throws(
            function(){
                Factory.test(SubHello);
            },
            function(e){
                if(e instanceof InterfaceError && e.type==='ValidateArguments'){
                    return true;
                }
                return false;
            },'check mirror class  properties'
            
        );
       
       
    }
    
    

});