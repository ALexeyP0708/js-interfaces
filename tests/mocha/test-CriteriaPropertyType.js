import * as chaiMod from '../../node_modules/chai/chai.js'
import {PropertyCriteria} from "../../src/PropertyCriteria.js";
//import Maker from '../../src/ClassMaker.js'
const isNode = typeof process !== 'undefined' && process?.versions?.node
let assert
let expect
if (isNode) {
    assert = chaiMod.default.assert
    expect = chaiMod.default.assert
} else {
    assert = globalThis.chai.assert
    expect = chaiMod.default.except
}

describe('Class PropertyCriteria', () => {
    const criteria=new PropertyCriteria({
        types:['mixed'],
        includes:[],
        excludes:[]
    });
    it('PropertyCriteria.initTypes', (done) => {
        class A{}
        class B extends A{}
        
        let types=['number',A,null,undefined];
        criteria.initTypes(types);
        assert.ok(criteria.types!==types);
        expect(criteria.types).to.have.members([
            'number',
            A,
            'null',
            'undefined'
        ]);
        assert.propEqual(criteria.types,match,'initTypes 3');

        
        assert.ok(true);
        done();
    })
})