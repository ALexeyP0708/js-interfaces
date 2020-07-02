//import {ExtError} from './../../ExtError.js';
QUnit.module( 'Class ExtError',{
    before:function (assert) {
    }
});


/*QUnit.test('Testing properties in object ExtError',function(assert){
    let error=new ExtError('typeTest',{types:{typeTest:'success'}});
    assert.equal(error.type,'typeTest','type');
    assert.equal(error.message,'success','message');
    assert.equal(error.name,'ExtError','name');
});*/


QUnit.test('Error type defined as default',function(assert){
    try{
        throw new ExtError();
    }catch(error){
        assert.equal(error.type,'default','{ExtError}.type');
        assert.equal(error.message,'','{ExtError}.message');
        assert.equal(error.name,'ExtError','{ExtError}.name');
        assert.ok(true,error.stack);
    }

});
QUnit.test('Error type defined',function(assert){
    try{
        throw new ExtError('typeTest',{types:{typeTest:'success'}});
    }catch(error){
        assert.equal(error.type,'typeTest','{ExtError}.type');
        assert.equal(error.message,'success','{ExtError}.message');
        assert.equal(error.name,'ExtError','{ExtError}.name');
        assert.ok(true,error.stack);
    }

});
QUnit.test('Error type not defined',function(assert){
    try{
        throw new ExtError('type not defined',{types:{typeTest:'success'}});;
    }catch(error){
        assert.equal(error.type,'type not defined','{ExtError}.type');
        assert.equal(error.name,'ExtError','{ExtError}.name');
        assert.ok(true,error.stack);
    }
});