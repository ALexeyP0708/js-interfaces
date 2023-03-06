import {assert,expect} from './export.js'
import {CTypes,InterfaceError} from "../../src/export.js"
import {AndContainerType} from "../../src/AndContainerType.js"

describe('Class CTypes', () => {
  it('CTypes constructor',()=>{
    class FuncType {}
    let objType={}
    // correct types
    expect(()=>{new CTypes([ 'null', 'undefined', 'object', 'boolean', 'number', 'string', 'symbol', 'function'])}).to.not.throw()
    expect(()=>{new CTypes(['mixed'])}).to.not.throw()
    expect(()=>{new CTypes([null,FuncType,objType])}).to.not.throw()
    expect(()=>{new CTypes(['string',['number',FuncType,objType]])}).to.not.throw()
    // incorect types
    expect(()=>{new CTypes(['other'])}).to.throw(InterfaceError)
    expect(()=>{new CTypes([ 'object',  'mixed'])},'Additional types with type mixed').to.throw(InterfaceError)
    expect(()=>{new CTypes(['string',['other',FuncType,objType]])}).to.throw(InterfaceError)
    expect(()=>{new CTypes([1])}).to.throw(InterfaceError)
    expect(()=>{new CTypes(['string','string'])},'Check duplicate').to.throw(InterfaceError)
  })
  it('CTypes.export',()=>{
    class FuncType {}
    let objType={}
    let cTypes=new CTypes([undefined,'null','object', 'boolean', 'number', 'string', 'symbol', 'function',null,FuncType,objType])
    let actual=['undefined','null','object', 'boolean', 'number', 'string', 'symbol', 'function', null,FuncType,objType]
    expect(cTypes.export()).to.eql(actual).which.not.equal(actual)
  })
  it('static CTypes.instanceOf' ,()=>{
    class A{}
    class B extends A {}
    let objB=new B()
    let objNul=Object.create(null)
    let proto={};
    let obj=Object.create(proto)
    assert.ok(CTypes.instanceOf(A,A))
    assert.ok(CTypes.instanceOf(B,A))
    assert.ok(!CTypes.instanceOf(A,B))
    assert.ok(CTypes.instanceOf(A.prototype,A.prototype))
    assert.ok(CTypes.instanceOf(B.prototype,A.prototype))
    assert.ok(!CTypes.instanceOf(A.prototype,B.prototype))
    assert.ok(CTypes.instanceOf(objB,A.prototype))
    assert.ok(CTypes.instanceOf(objB,B.prototype))
    assert.ok(CTypes.instanceOf(null,null))
    assert.ok(CTypes.instanceOf(objNul,null))
    assert.ok(!CTypes.instanceOf(obj,null))
    assert.ok(CTypes.instanceOf(obj,proto))
    //assert.ok(false,'Перенести в подходящий класс')
  })

  it('static CTypes.isValidateData',()=>{
    CTypes.isValidateData()
    assert.ok(CTypes.isValidateData('hello','mixed'))
    assert.ok(CTypes.isValidateData('hello','string'))
    assert.ok(!CTypes.isValidateData(1,'string'))
    assert.ok(CTypes.isValidateData(null,'null'))
    assert.ok(CTypes.isValidateData('hello',new AndContainerType(['string'])))
    assert.ok(!CTypes.isValidateData('hello',new AndContainerType(['string','number'])))
    assert.ok(CTypes.isValidateData('hello',new AndContainerType(['string',String.prototype])))
    assert.ok(CTypes.isValidateData('hello',new AndContainerType(['string',String.prototype])))
    class A{}
    class B extends A{}
    assert.ok(CTypes.isValidateData(B,B))
    assert.ok(CTypes.isValidateData(B,A))
    assert.ok(!CTypes.isValidateData(A,B))
    assert.ok(CTypes.isValidateData(new B,B.prototype))
    assert.ok(CTypes.isValidateData(new B,A.prototype))
    assert.ok(!CTypes.isValidateData(new A,B.prototype))
    const objB= new B
    assert.ok(CTypes.isValidateData(objB,B.prototype))
    assert.ok(CTypes.isValidateData(objB,A.prototype))
    const objObj=Object.create(objB)
    const newobjB=new B
    assert.ok(!CTypes.isValidateData(objObj,newobjB))
    assert.ok(CTypes.isValidateData(objObj,B.prototype))
    assert.ok(CTypes.isValidateData(objObj,A.prototype))
    assert.ok(CTypes.isValidateData(null,null))
    const objNull=Object.create(null)
    assert.ok(CTypes.isValidateData(objNull,null))
    assert.ok(!CTypes.isValidateData(newobjB,null))
    assert.ok(CTypes.isValidateData('hello',String.prototype))
    assert.ok(!CTypes.isValidateData(1,String.prototype))
    assert.ok(CTypes.isValidateData(1,Number.prototype))
    class NumberTest extends Number{}
    assert.ok(CTypes.isValidateData(new NumberTest(1),Number.prototype))
  })
  it ('CTypes.validate')

  it ('static CTypes.compareTypes',()=>{})
  it ('CTypes.compare')
  
  it ('CTypes.merge')
  it ('static CTypes.typesString and CTypes.toString',()=>{
    class Test{}
    const types=new CTypes(['number','string',Test,Test.prototype,new Test(),{},['string',Test],null,Object.create(null)])
    const eq='number,string,[function Test],[object Test],[object [object Test]],[object [object Object]],[string,[function Test]],[object null],[object [object null]]'
    expect(CTypes.typesString(types.export())).to.equal(eq)
    expect(types.toString()).to.equal(eq)
  })

  
  
})