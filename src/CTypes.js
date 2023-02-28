import {InterfaceError} from "./InterfaceError.js";
import {ICriteria} from "./ICriteria.js";
import {InterfaceData} from "./InterfaceData.js";

/**
 * Defines interface types
 */
export class CTypes{
  /**
   * 
   * @param {Array} types
   */
  #types_list=[
    'null', 'undefined', 'object', 'boolean', 'number', 'string', 'symbol', 'function', 'mixed'
  ]
  
  #types

  /**
   * 
   * @param {Array.<Function|object|string|null|undefined>} types
   */
  constructor(types){
    if (!Array.isArray(types)) {
      throw new Error('"types" argument  must be an array')
    }
    this.#initTypes(types)
  }
  
  #isCorrectType(type){
    const tt = typeof type
    return ['function', 'object'].includes(tt) || tt === 'string' && this.#types_list.includes(type)
  }
  #initTypes(types){
    types=Object.assign([],types)
    this.#validateTypes(types)
    this.#types=types;
  }
  #validateTypes (types) {
    const errors = []
    const buf=[]
    for (let k = 0; k < types.length; k++) {
      /*if (types[k] === null) {
        types[k] = 'null'
      } else*/
      if (types[k] === undefined) {
        types[k] = 'undefined'
      }
      const entryPoints = [`types[${k}]`]
      if(types.includes('mixed') && types.length>1){
        errors.push (new InterfaceError('The mixed type must not be specified with other types').setType('BadType_mixed').setEntryPoints(entryPoints))
      }
      if (!this.#isCorrectType(types[k])) {
        const error = new InterfaceError()
          .setType('BadType_Incorrect')
          .setEntryPoints(entryPoints)
          .setVars({
            dataType: types[k].toString()
          })
        errors.push(error)
      }
      if(buf.includes(types[k])){
        const error = new InterfaceError()
          .setType('BadType_Duplicate')
          .setEntryPoints(entryPoints)
          .setVars({
            dataType: types[k].toString()
          })
        errors.push(error)
        continue
      }
      buf.push(types[k])
    }
    if (errors.length > 0) {
       throw new InterfaceError().setType('BadTypes').setErrors(errors)
    }
  }
  export(){
    return Object.assign([],this.#types)
  }

  /**
   * @param type
   * @param data
   * @returns {boolean}
   */
  static isValidateData (data,type){
    if(type==='mixed'){
      return true
    }
    let data_type
    let check_type=false
    if(data===null){
      data_type='null'
    } else {
      data_type= typeof data
    }
    let type_type= typeof type
    if(type_type==='string'){
      check_type=type===data_type
    } else if(['function','object'].includes(type_type)){
      check_type=this.instanceOf(data,type)
    }
    return check_type
  }

  /**
   * 
   * @param {*} target
   * @param {boolean} [isThrow=true]
   * @returns {*|false}
   * @throws {InterfaceError}
   */
  validateData(target,isThrow=true){
    if(this.#types.includes('mixed')){
      return 'mixed'
    }
    const SelfClass=Object.getPrototypeOf(this).constructor
    let target_type=typeof target
    let check_type=false
    for(const type of this.#types){
      if(type instanceof ICriteria && type.validate(target,false) || SelfClass.isValidateData(target,type)){
        check_type=true
        target_type=type
      } 
      if(check_type){
        break
      }
    }
    if(!check_type){
      if(isThrow){
        let definedType=target_type
        if (target_type === 'object') {
          let TargetClass = Object.getPrototypeOf(target).constructor
          if (TargetClass !== undefined) {
            definedType = `[object ${Object.getPrototypeOf(target).constructor.name}]`
          }
        }
        throw new InterfaceError().setType('ValidateData').setVars({
          expectedTypes:this.toString(),
          definedType,
        })  
      }
      target_type=false
    }
    return target_type   
  }
  #types_string
  #typesString(){
    if(this.#types_string){
      return this.#types_string
    }
    let typesString=[];
    for (const type of this.#types){
      const typeType=typeof type
      let type_str=type
      switch (typeType){
        case 'object':
          if(type instanceof ICriteria){
            type_str=type.toString()
          } else {
            let proto=Object.getPrototypeOf(type)
            if(typeof proto.constructor==='function'){
              type_str=`[object ${proto.constructor.name}]`
            } else {
              type_str=type.toString()
            }
          }
        break  
        case 'function':
          type_str=`[function ${type.name??'anonymous'}]`
        break
      }
      typesString.push(type_str)
    }
    this.#types_string=typesString.join(',')
    return this.#types_string
  }
  toString(){
    return this.#typesString()
  }
  static instanceOf(value,target){
    const typeValue = typeof value
    if(!['object','function'].includes(typeof target)){
      throw new Error('"Target" argument  must be "function" or "object" type')
    }
    if(target === null){
      if(typeValue==='object'){
        return value===target || !Object.prototype.isPrototypeOf.call(Object.prototype,value) || InterfaceData.instanceOfInterface(value, EqualClass)
      }
      return false
    } else
    if (['function','object'].includes(typeValue)) {
      return value===target || Object.prototype.isPrototypeOf.call(target,value)
    } else {
      return Object.getPrototypeOf(value) === target
    }
  }
}