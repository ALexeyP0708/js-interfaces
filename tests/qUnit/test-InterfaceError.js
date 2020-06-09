import {InterfaceError} from './../../export.js';
InterfaceError.types.test='message test';
QUnit.module( 'Class InterfaceError');

QUnit.test('throw Interface Error for default type',function(assert){
    try{
        throw new InterfaceError();
    }catch(e){
        assert.equal(e.type,'default','{InterfaceError}.type');
        assert.equal(e.message,'no message','{InterfaceError}.message');
        assert.equal(e.name,'InterfaceError','{InterfaceError}.name');
        assert.ok(true,e.stack);
    };
});
QUnit.test('throw Interface Error',function(assert){
    try{
        throw new InterfaceError('test');
    }catch(e){
        assert.equal(e.type,'test','{InterfaceError}.type');
        assert.equal(e.message,'message test','{InterfaceError}.message');
        assert.equal(e.name,'InterfaceError','{InterfaceError}.name');
        assert.ok(true,e.stack);
    };
});
