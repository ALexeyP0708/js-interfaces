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
    
    

});