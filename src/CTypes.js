import {InterfaceError} from "./InterfaceError.js";

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
    this.#validate(types)
    this.#types=types;
  }
  getTypes(){
    return this.#types
  }
  #validate (types) {
    const errors = []
    const buf=[]
    for (let k = 0; k < types.length; k++) {
      if (types[k] === null) {
        types[k] = 'null'
      } else
      if (types[k] === undefined) {
        types[k] = 'undefined'
      }
      const entryPoints = [`types[${k}]`]
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
      let error=new InterfaceError().setType('BadTypes').setErrors(errors)
      throw error
    }
  }
}