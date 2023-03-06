import {assert,expect} from './export.js'
import {Criteria,InterfaceError} from "../../src/export.js"

describe('Class Criteria', () => {
  it('Criteria.constructor',()=>{
    expect(()=>{new Criteria()}).to.throw('Argument "criteria" of type undefined. Argument must be of type object.')
    //expect(()=>{new Criteria({})}).to.throw("\"options\" argument  must be an object")
    expect(()=>{new Criteria({options:{owner:'string'}})}).to.throw('Argument "owner" must be function type.')
    expect(()=>{new Criteria({options:{}})}).to.throw('Criteria.init method not implemented.')
  })
  class TestCriteria extends Criteria{
    init(criteria){
      
    }
    static formatToObject(data){
      return data
    }
  }
  class Test{} 
  it('Criteria.exportOptions',()=>{
    let options={owner:Test}
    let test = new TestCriteria({options})
    expect(test.exportOptions()).eql(options).not.equal(options)
  })

  it('Criteria.exportTypes',()=>{
    let types=[];
    expect(new TestCriteria({}).exportTypes()).eql(['mixed']).not.equal(types)
    expect(new TestCriteria({types}).exportTypes()).eql(['mixed']).not.equal(types)
    types=['string']
    expect(new TestCriteria({types}).exportTypes()).eql(['string']).not.equal(types)
  })

  it('Criteria.setOwner and getOwner',()=>{
    let types=[];
    let criteria= new TestCriteria({})
    expect(criteria.setOwner(Test).getOwner()).equal(Test)
    expect(criteria.exportOptions()).eql({owner:Test})
  })
  it('static Criteria.formatToObject',()=>{
    expect(()=>{Criteria.formatToObject({})}).to.throw('Criteria.formatToObject static method not implemented.')
  })
  it('static Criteria.generateObject',()=>{
    expect(()=>{Criteria.generateObject({types:['string','string']})}).to.throw('Criteria.formatToObject static method not implemented.')
    expect(()=>{TestCriteria.generateObject({types:['string','string']})})
      .to.throw(InterfaceError,'Init:  - \n  BadType_Duplicate: [types[1]] - duplicate type [string].')
    let criteria=new TestCriteria({})
    expect(TestCriteria.generateObject(criteria)).to.equal(criteria)
  })

  it('Criteria.compareStrictly',()=>{
    class TestCriteria extends Criteria{
      init (){}
    }
    class Test{}
    assert.ok(
      new TestCriteria({options:{},types:['string']})
        .compareStrictly(new TestCriteria({options:{},types:['string']}),false)
      ,'compare strictly  types string- equal types')
    assert.ok(
      !new TestCriteria({options:{},types:['string']})
        .compareStrictly(new TestCriteria({options:{},types:['number']}),false)
      ,'compare strictly  types string- different types')
    assert.ok(
      new TestCriteria({options:{},types:[Test.prototype]})
        .compareStrictly(new TestCriteria({options:{},types:[Test.prototype]}),false)
      ,'compare strictly  types with function- equal types')
    assert.ok(
      new TestCriteria({options:{},types:[Test]})
        .compareStrictly(new TestCriteria({options:{},types:[Test]}),false)
      ,'compare strictly container with  function- equal types')
    assert.ok(
      new TestCriteria({options:{},types:['string',['string',Test.prototype]]})
        .compareStrictly(new TestCriteria({options:{},types:['string',['string',Test.prototype]]}),false)
      ,'compare strictly container with object- equal types')
   
    assert.ok(
      new TestCriteria({options:{},types:[new TestCriteria({types:['string']})]})
        .compareStrictly(new TestCriteria({options:{},types:[new TestCriteria({types:['string']})]}),false)
      ,'compare strictly ICriteria object- equal criteria ')
    assert.ok(
      !new TestCriteria({options:{},types:[new TestCriteria({types:['string']})]})
        .compareStrictly(new TestCriteria({options:{},types:[new TestCriteria({types:['number']})]}),false)
    ,'compare strictly ICriteria object- different criteria ')
    
  })
})