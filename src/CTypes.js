import {InterfaceError} from "./InterfaceError.js";
import {InterfaceData} from "./InterfaceData.js";
import {ICriteria} from "./ICriteria.js";
import {IType} from "./IType.js";
import {AndContainerType} from "./AndContainerType.js";

/**
 * Defines interface types
 */
export class CTypes{
  /**
   * 
   * @param {Array} types
   */
  static #types_list=[
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
  
  static #isCorrectType(type){
    const tt = typeof type
/*    if(tt==='object' && type!==null && Object.getPrototypeOf(type)===Array.prototype && Array.isArray(type)){
      return this.#validateTypes (type,false)
    }*/
    return ['function', 'object'].includes(tt) 
      || tt === 'string' && this.#types_list.includes(type) 
      //|| tt==='object' && Array.isArray(type) &&  Object.getPrototypeOf(type)===Array.prototype && Array.isArray(type)
  }
  #initTypes(types){
    types=Object.assign([],types)
    CTypes.validateTypes(types)
    this.#types=types;
  }
  static validateTypes (types,isThrow=true) {
    const errors = []
    const buf=[]
    for (let k = 0; k < types.length; k++) {
      if (types[k] === undefined) {
        types[k] = 'undefined'
      }
      if(types.length===0){
        types.push('mixed')
        return;
      }
      const entryPoints = [`types[${k}]`]
      if(types.includes('mixed') && types.length>1){
        errors.push (new InterfaceError('The mixed type must not be specified with other types').setType('BadType_mixed').setEntryPoints(entryPoints))
      }
      if(typeof types[k] ==='object' && types[k]!==null && Object.getPrototypeOf(types[k])===Array.prototype && Array.isArray(types[k])){
        types[k] = new AndContainerType(types[k])
      } else
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
      if(isThrow){
        throw new InterfaceError().setType('BadTypes').setErrors(errors) 
      } 
      return false       
    }
    return true
  }

  /**
   * 
   * @return {any[]}
   */
  export(){
    return Object.assign([],this.#types)
  }

  /**
   * @param data
   * @return {boolean}   //{boolean|string|object|function|IType}
   */
  validate(data){
    const SelfClass=Object.getPrototypeOf(this).constructor
    let check=false
    //let typeData;
    for(const type of this.#types) {
      check = SelfClass.isValidateData(data, type)
      if (check) {
      //  typeData=type;
        break;
      }
    }
    return check
  }

  /**
   * 
   * @param {CTypes} types
   * @return {CTypes}
   */
  merge(types){
    //experiment
    const comparedTypes=types.export()
    let diff_stack=[]
    let currentTypes=this.#types//this.export()
    for(const type of comparedTypes){
      const typeType=typeof type
      if(['string','function'].includes(typeType)){
        if(!currentTypes.includes(type)){
          diff_stack.push(type)
        }
      } else if(typeType === 'object'){
        if(Object.getPrototypeOf(type)===Array.prototype && Array.isArray(type)){
          const SelfClass=Object.getPrototypeOf(this).constructor
          const comparedContainer=new SelfClass(type)
          let check=false
          for(const currentType of currentTypes){
            if(Object.getPrototypeOf(currentType)===Array.prototype && Array.isArray(currentType)) {
              const currentContainer=new SelfClass(currentType)
              check=currentContainer.compare(comparedContainer,'strict')
              if(check){
                break
              }
            }
          }
          if(!check){
            diff_stack.push(type)
          }
        } if(type instanceof IType) {
          //  сравнить строго два критерия
          //  Если совпадают, то не включать в список
          let check=false
          for(const currentType of currentTypes){
            if(currentType instanceof IType){
              check = currentType.compare(type,'strict')
              if(check){
                break
              }
            }
          }
          if(!check){
            diff_stack.push(type)
          }
        } else {
          if(!currentTypes.includes(type)){
            diff_stack.push(type)
          }
        }
      }
    }
    if(diff_stack.length>0){
      currentTypes.push(...diff_stack)
    }
    return this
  }

  /**
   * 
   * @param {CTypes} types
   * @param {string} [method='strict'] strict|restrict|expand
   * @return {boolean}
   */
  compare(types,method='strict'){
    return CTypes.compareTypes(this.export(),types.export(),method)
  }

  /**
   * 
   * @param {(string|object|function|IType)[]} currentTypes
   * @param {(string|object|function|IType)[]} comparedTypes
   * @param {string}[method='strict'] strict|restrict|expand
   * @return {boolean}
   */
  static compareTypes(currentTypes,comparedTypes,method='strict'){
    let check=false;
    currentTypes=Object.assign([],currentTypes)
    comparedTypes=Object.assign([],comparedTypes)
    for(const currentType of currentTypes){
      if(comparedTypes.length<=0 && ['strict','expand'].includes(method)){
        check=false
        break
      }
      check=false
      let currentTypeType = typeof currentType
      if (currentTypeType === 'string') {
        let key=comparedTypes.indexOf(currentType)
        check=key>-1
        if(check){comparedTypes.splice(key,1)}
      } else if(currentTypeType==='object'){
        if(currentType instanceof IType){
          const CurrentTypeClass=Object.getPrototypeOf(currentType).constructor
          for(let key=0; key<comparedTypes.length; key++){
            const comparedType=comparedTypes[key]
            const ComparedTypeClass=Object.getPrototypeOf(comparedType).constructor
            if(CurrentTypeClass===ComparedTypeClass){//comparedType instanceof CurrentTypeClass
              check=currentType.compare(comparedType,method)
              if(check){ comparedTypes.splice(key,1); break}
            }
          }
        } else {
          let key=comparedTypes.indexOf(currentType)
          check=key>-1
          if(check){
            comparedTypes.splice(key,1)
          } else if(['restrict','expand'].includes(method)){
            for(let key=0; key<comparedTypes.length; key++){
              const comparedType=comparedTypes[key]
              if(typeof comparedType==='object' && !(comparedType instanceof IType)){
                switch(method){
                  case 'restrict': // for return results methods
                    check=CTypes.instanceOf(comparedType,currentType) // covariance
                    break
                  case 'expand': // for arguments  methods
                    check=CTypes.instanceOf(currentType,comparedType) // contravariance
                    break
                }
                if(check){ comparedTypes.splice(key,1); break}
              }
            }
          }

        }
      } else if(currentTypeType==='function') {
        let key = comparedTypes.indexOf(currentType)
        check = key > -1
        if (check) {
          comparedTypes.splice(key, 1)
        } else if (['restrict', 'expand'].includes(method)) {
          for (let key = 0; key < comparedTypes.length; key++) {
            const comparedType = comparedTypes[key]
            if (typeof comparedType === 'function') {
              switch (method) {
                case 'restrict': // for return results methods
                  check = CTypes.instanceOf(comparedType, currentType) // covariance
                  break
                case 'expand': // for arguments  methods
                  check = CTypes.instanceOf(currentType, comparedType) // contravariance
                  break
              }
              if (check) {
                comparedTypes.splice(key, 1);
                break
              }
            }
          }
        }
      }
      if(!check){break}
    }
    if(check && comparedTypes.length>0 && ['strict','restrict'].includes(method)){
      check=false
    }
    return check
  }
  /**
   * @param {*} data
   * @param {string|object|function|IType|Array} type
   * @returns {boolean}
   */
  static isValidateData (data,type){
    if(type==='mixed'){
      return true
    }
    let dataType,checkType=false
    if(data===null){
      dataType='null'
    } else {
      dataType= typeof data
    }
    let typeType= typeof type
    if(typeType==='string'){
      checkType=type===dataType
    } else if(typeType==='object' && type instanceof IType){
      checkType=type.validate(data)
    } else if (
      typeType==='function' && dataType==='function' 
      || typeType==='object' && ['object','string','number','boolean','symbol','null'].includes(dataType)){
      checkType=this.instanceOf(data,type)      
    } 
    return checkType
  }

  /**
   * 
   * @param {*[]} types
   * @return {string}
   */
  static typesString(types){
    let typesString=[];
    for (const type of types){
      const typeType=typeof type
      let type_str=type
      switch (typeType){
        case 'object':
          if(type===null){
            type_str=`[object null]`
          } else if(type instanceof IType){
            type_str=type.toString()
          } else if(Object.prototype.hasOwnProperty.call(type,'constructor')){
            type_str=`[object ${type.constructor.name}]`
          } else if(typeof type.constructor === 'function'){
            type_str=`[object [object ${type.constructor.name}]]`
          } else if('toString' in type){
            type_str=type.toString()
          } else {
            type_str=`[object [object null]]`
          }
          break  
        case 'function':
          type_str=`[function ${type.name??'anonymous'}]`
          break
      }
      typesString.push(type_str)
    }
    return typesString.join(',')
  }
  #types_string
  toString(){
    if(this.#types_string){
      return this.#types_string
    }
    const SelfClass=Object.getPrototypeOf(this).constructor
    this.#types_string = SelfClass.typesString(this.export())
    return this.#types_string
  }
  static instanceOf(value,target){
    const typeValue = typeof value
    if(!['object','function'].includes(typeof target)){
      throw new Error('"Target" argument  must be "function" or "object" type')
    }
    if(target === null){
      if(typeValue==='object'){
        return value===target || !Object.prototype.isPrototypeOf.call(Object.prototype,value)
      }
      return false
    } else
    if (['function','object'].includes(typeValue)) {
      return value===target || Object.prototype.isPrototypeOf.call(target,value) || InterfaceData.instanceOfInterface(value, target)
    } else {
      return Object.getPrototypeOf(value) === target
    }
  }
}