import {CTypes} from "./CTypes.js";
import {ICriteria} from "./ICriteria.js";
export class CIncludes {
  
  #includes
  #excludes

  /**
   * 
   * @param {Array} includes
   * @param {Array} excludes
   * @param {CTypes} types
   */
  constructor (includes,excludes,types){
    if (!Array.isArray(includes)) {
      throw new Error('"includes" argument  must be an array')
    }
    if (!Array.isArray(excludes)) {
      throw new Error('"excludes" argument  must be an array')
    }
    if(!(types instanceof CTypes)){
      throw new Error('Argument types must be CTypes object')
    }
    this.#init(includes,excludes,types)
  }
  
  #init(includes,excludes,types){
    this.#types=types
    includes=Object.assign([],includes)
    excludes=Object.assign([],excludes)
    this.#includes=includes
    this.#excludes=excludes
  }

  /**
   * 
   * @param value
   * @param {Array} arrayValues
   * @return {boolean}
   */
  static #isInclude (value,arrayValues) {
    let check = false
    let result = false
    for (const element of arrayValues) {
      const typeElement = typeof element
      if(typeElement === 'function' && typeElement.constructor===undefined){
        check=element(value)
      } else if(typeof value==='object' && value!==null && typeElement === 'object' && element!==null){
          // compare object
        check=true
        for (const prop of Object.keys(element)){
          if(Object.prototype.hasOwnProperty.call(value,prop) && Object.prototype.propertyIsEnumerable.call(value,prop)){
            if(element[prop] instanceof ICriteria){
              check=element[prop].validate(value,false)
            } else if (element[prop]!==undefined){
              check=value[prop]===element[prop]
            }
          } else {
            check=false
          }
          if(!check){
            break
          }
        }
      } else {
        check=value === element
      }
      if(check){break}
    }
    return check
  }
  
  #validate(data){

  }
}