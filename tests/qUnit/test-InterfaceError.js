import {InterfaceError} from '../../src/export.js';
InterfaceError.types.test='message test';
QUnit.module( 'Class InterfaceError');

QUnit.test('Test Constructor',function(assert){
    assert.throws(function(){
        throw new InterfaceError('NO_TYPE');
    },function(e){
        return e.type === 'NO_TYPE' && e.message === "NO_TYPE:  - ";
    },'test default type Error');

    assert.throws(function(){
        throw new InterfaceError('NO_TYPE',{entryPoints:['points1','points2']});
    },function(e){
        return e.type === 'NO_TYPE' && e.message === "NO_TYPE: [points1][points2] - ";
    },'test vars.entryPoints');


    assert.throws(function(){
        throw new InterfaceError('NO_TYPE',{errors:['errorString','errorString']});
    },function(e){
        return e.type === 'NO_TYPE' && e.message === "NO_TYPE:  - \n   errorString\n   errorString";
    },'test vars.errors');

    assert.throws(function(){
        throw new InterfaceError('NO_TYPE',{errors:[new InterfaceError('NO_TYPE2',{message:'error message'}),new InterfaceError('NO_TYPE2',{message:'error message'})]});
    },function(e){
        return e.type === 'NO_TYPE' && e.message === "NO_TYPE:  - \n" +
            "   NO_TYPE2:  - error message\n" +
            "   NO_TYPE2:  - error message";
    },'test vars.errors 2');
    assert.throws(function(){
        throw new InterfaceError('ErrorType',{message:'error type'});
    },function(e){
        return e.type === 'ErrorType' && e.message === "ErrorType:  - error type";
    },'test ErrorType type');
});