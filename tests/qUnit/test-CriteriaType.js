import {CriteriaType,InterfaceError} from '../../src/export.js';
QUnit.module( 'Class TypeCriteria');

QUnit.test('Check type of criteria',function(assert){
    assert.equal((new CriteriaType()).type,'property','set property');
    assert.equal((new CriteriaType(null,'property')).type,'property','set property');
    assert.equal((new CriteriaType(null,'react')).type,'react','set react');
    assert.equal((new CriteriaType(null,'method')).type,'method','set method');
    try {
        new CriteriaType(null,'no type');
    } catch(e){
        if(e instanceof InterfaceError && e.type==='ErrorTypeCriteria'){
            assert.ok(true,'set other type. Error: '+e.stack);
        } else {
            throw e;
        }
    }
});
QUnit.test('Test static method TypeCriteria.setPropertyCriteria', function (assert){
    let self;
    // typeof is missing
    CriteriaType.setPropertyCriteria(self={},{});
    assert.equal(self.typeof,'mixed','this.typeof=mixed');
    // there is a typeof property
    for(let t of ['object','boolean','number','string','symbol','function','other_type']){
        CriteriaType.setPropertyCriteria(self={},{typeof:t});
        if(t==='other_type'){
            assert.equal(self.typeof,'mixed','this.typeof=mixed');
        } else {
            assert.equal(self.typeof,t,'this.typeof='+t);
        }
    }
    //checking values ​​of type
    let values={
        object:[class A{},class B{}],
        boolean:[true,false],
        number:[1],
        string:['Hello'],
        symbol:[Symbol('q'),Symbol('v')],
        function:[()=>{},function(){}],
        other_type:[{},[],true,1,'1',Symbol('q'),()=>{},class A{}]
    };
    for(let t of ['object','boolean','number','string','symbol','function','other_type']){
        CriteriaType.setPropertyCriteria(self={},{typeof:t,values:values[t]});
        if(t==='other_type'){
            assert.equal(self.typeof,'mixed','checking values ​​of type mixed');
        } else {
            assert.equal(self.typeof,t,'checking values ​​of type: '+t);
        }
    }
//checking values ​​for mismatching type
    values={
        object:[{},true,1,'Hello',Symbol('q')],
        boolean:[{},1,'Hello',Symbol('q'),()=>{}],
        number:[{},true,'Hello',Symbol('q'),()=>{}],
        string:[{},true,1,Symbol('q'),()=>{}],
        symbol:[{},true,1,'Hello',()=>{}],
        function:[{},true,1,'Hello',Symbol('q')],
    };

    for(let t of ['object','boolean','number','string','symbol','function']){
        for(let v of values[t]){
            assert.throws(
                ()=>{
                    CriteriaType.setPropertyCriteria(self={},{typeof:t,values:[v]});
                },
                function(e){
                    console.log(e.type);
                    return (e instanceof InterfaceError && ['ErrorTypeofValues','ErrorTypeofValuesToObject'].includes(e.type));
                },
                'checking values ​​for mismatching type: '+t
            );
        }
    }
});
