import {MirrorInterface, InterfaceBuilder, InterfaceError} from '../../src/export.js';

QUnit.module( 'Class MirrorInterface');
QUnit.test('test methods MirrorInterface',function(assert){
    
    {
        class MirrorTest extends MirrorInterface {

        };
        MirrorTest.prototype.hello={
            types:'number'
        };
        MirrorTest.prototype.bay={
            types:'number'
        };
        MirrorTest.isInterface=true;
        InterfaceBuilder.extendInterfaces(MirrorTest);
        assert.throws(function(){
            MirrorTest.validate({
                hello:'friend',
            });
        },function(e){
            if(e instanceof InterfaceError && e.type==='Validate_BadMirrorProperties' ){
                return true;
            }
            return false;
        },'MirrorInterface.validate method');
    }
    
    {
        class MirrorTest extends MirrorInterface {
        };
        MirrorTest.prototype.specific={
            types:MirrorInterface.createInterface('Mirror',{
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
        },'MirrorInterface.validate method 2');
    }
    
    {
        let MirrorTest=MirrorInterface.createInterface('MirrorTest',{
            method(){
                return {
                    arguments:[
                        {
                            types:MirrorInterface.createInterface('Mirror',{
                                name:{types:'number'}
                            })
                        }
                    ],
                    return:{
                        types:MirrorInterface.createInterface('Mirror',{
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
        InterfaceBuilder.extendInterfaces(Test);
        let mirror=new Test();
        assert.throws(function(){
            mirror.method({name:1});
        },function(e){
            if(e instanceof InterfaceError && e.type==='ValidateType' ){
                return true;
            }
            return false;
        },'MirrorInterface.validate method 3');
    }
//
    {
       class Mirror extends MirrorInterface{
           
       }
        MirrorInterface.createInterface(Mirror,{
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
                Class.method2('hello');
            }
        };
        InterfaceBuilder.extendInterfaces(Factory,InterfaceTest);
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