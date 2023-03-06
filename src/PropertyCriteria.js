import {
  InterfaceError,
  // MirrorInterface,
  // MirrorFuncInterface,
  Criteria,
  InterfaceData, 
  CriteriaMethodType,
  CTypes
} from './export.js'

/**
 *  An instance of the CriteriaMethodType class stores the criteria for a property and manages criteria.
 *  Describes class properties, class method arguments, class method return value, reactive properties.
 *  @prop {Array.<(string|object|function)>} types  the set of types to which the value must match
  *  ```js
 *  [
 *       'mixed' // Any type
 *       'number', // type number
 *       'string', // type string
 *       'boolean', // type bool
 *       'symbol', // type symbol
 *       'function', // type function
 *        null, // type null
 *        undefined, // type undefined
 *        {name:'hello'}, //  implements the given instance as a prototype (Object.create (object))
 *        class AnyClass{}, // inherited  the AnyClass class
 *        class Mirror extends MirrorInterface{}, //to check for compliance of any object/class with the Mirror interface
 *        new PropertyCriteria({}) // another set of criteria
 *        new CriteriaMethodType({}) //  criteria for the called function
 *  ]
 *  ```
 *
 *  @prop {Array} includes  sets a set of values ​​that the input parameters must match
 *  Example:
 *  ```js
 *  [
 *      1, //the value must match 1 (number type)
 *      '2', //the value must match '2' (string type)
 *      true, //the value must match true (bool type)
 *      Symbol.for('hello'), //the value must match  Symbol.for('hello') (symbol type)
 *      function(){}, // the value must match a specific function (function type)
 *      class A {}, // if the value being compared is an object or function, then it must belong to class A,
 *      {name:hello} // if the value being compared is an object,then it must implements  this object as a prototype (Object.create({name:hello})),
 *      null, // the value must match null
 *      undefined // the value must match undefined
 *  ]
 *  ```
 *  @prop {Array} excludes sets the set of values ​​that the input parameters must not match
 *  ```js
 *  [
 *      1, //the value not must match 1 (number type)
 *      '2', //the value not must match '2' (string type)
 *      true, //the value not must match true (bool type)
 *      Symbol.for('hello'), //the value not must match  Symbol.for('hello') (symbol type)
 *      function(){}, // the value not must match a specific function (function type)
 *      class A {}, // if the value being compared is an object or function, then it not must belong to class A
 *      {name:hello} // if the value being compared is an object,then it not must implements  this object as a prototype (Object.create({name:hello})),
 *      null, // the value not must match null
 *      undefined // the value not must match undefined
 *  ]
 *  ```
 *  @inheritDoc
 */
export class PropertyCriteria extends Criteria {
  init (criteria) {

  }
  

  build (data, criteria, entryPoints = []) {
    return data
  }

  /**
   * Validation of incoming parameters according to the established current criteria (object)
   * @param value
   * @param {boolean} [isThrow=true]
   * @return {boolean} 
   * @throws {InterfaceError}
   */
  validate (value, isThrow=true) {
    let result=false
    result=this.#validateByType(value,isThrow)
    if(!result){
      return false
    }
    return result
  }

  



  

  /**
     * Checks if a value implements a specified interface / class / object
     * @param value
     * @param EqualClass
     * @returns {boolean}
     */
  instanceOf (value, EqualClass) {
    const tv = typeof value
    const te = typeof EqualClass
    if (tv === 'object' && value !== null || tv === 'function') {
      return value === EqualClass ||
                te === 'function' && value instanceof EqualClass ||
                EqualClass.isPrototypeOf(value) ||
                this.instanceOfInterface(value, EqualClass)
    } else if (te === 'function' && ['boolean', 'number', 'string', 'symbol'].includes(tv)) {
      return Object.getPrototypeOf(value).constructor === EqualClass
    }
    return false
  }

  /**
     * Checks if a class / object implements an interface
     * @param {object|function} value
     * @param {function} EqualClass
     * @returns {boolean}
     */

  instanceOfInterface (value, EqualClass) {
    return InterfaceData.instanceOfInterface(value, EqualClass)
  }

  /**
     *
     * @param data
     * @param entryPoints
     * @returns {*}
     *
     * @example
     *
     * //from
     * data='string|number';
     * //or
     * data=['string','number'];
     * //to
     * data={types:['string','number']};
     *
     * //from
     * data=class A{};
     * to
     * data={types:[A]};
     *
     * //from
     * data={types:[]}
     * //or
     * data={types:['mixed','string']}
     * //to
     * data={types:['mixed']}
     *
     * //from
     * data=()=>{};
     * //to
     * data={
     *     types:[
     *         (()=>{})()
     *     ]
     * };
     *
     * //from
     * data={types:[()=>{}]}
     * //to
     * data={types:[(()=>{})()]}
     *
     * //from
     * data={includes:'1'}
     * // to
     * data={includes:['1']}
     *
     * //from
     * data={excludes:'1'}
     * // to
     * data={excludes:['1']}
     */
  static formatExtendedSyntaxToObject (data, entryPoints = ['not defined']) {
    const tp = typeof data
    let result
    if (tp === 'function' || tp === 'string' || Array.isArray(data)) {
      result = { types: data }
    } else if (tp !== 'object' || data === null) {
      new InterfaceError('BadFormatCriteria', { entryPoints }).throw(true)
    } else {
      result = Object.assign({}, data)
    }
    // types
    if (!Array.isArray(result.types) && result.types !== undefined) {
      if (typeof result.types === 'string') {
        result.types = result.types.split('|')
      } else {
        result.types = [result.types]
      }
    }
    if (result.types !== undefined && Array.isArray(result.types)) {
      for (let key = 0; key < result.types.length; key++) {
        let type = result.types[key]
        const tt = typeof type
        if (tt === 'function' && type.prototype === undefined) {
          type = type()
          type = CriteriaMethodType.formatExtendedSyntaxToObject(type, entryPoints)
          result.types[key] = type
        }
      }
    }
    return result
  }

  /**
     * Formats the declared criteria in order for further work.
     * Formats strong syntax.
     * @param {undefined|null|object} data
     * @returns {{types:Array,includes:Array,excludes:Array}}
     * @example
     *
     * //from
     * data={};
     * // or
     * data={types:['mixed','string']};
     * //to
     * data={types:['mixed'],includes:[],excludes:[]};
     *
     * // from
     * data={types:'string',includes:'1',excludes:'1'};
     * // to
     * data={types:['string'],includes:['1'],excludes:['1']};
     *
     */
  static formatStrictSyntaxToObject (data) {
    if (data === null || data === undefined) {
      data = {}
    }
    if (typeof data !== 'object') {
      new InterfaceError('CriteriaPropertyFormat', { message: 'Object expected. Example:{types:["number"],includes:[1,2,3,4],excludes:[3]}' }).throw()
    }
    const result = Object.assign({}, data)
    if (result.types === undefined) {
      result.types = ['mixed']
    } else if (!Array.isArray(result.types)) {
      result.types = [result.types]
    }
    if (result.types.includes('mixed') || result.types.length <= 0) {
      result.types = ['mixed']
    }
    /* for(let key=0; key<result.types.length; key++){
            if(typeof result.types[key]==='object' && result.types[key]!==null ){
                if('arguments' in result.types[key] || 'return' in result.types[key]){
                    result.types[key]=CriteriaMethodType.formatStrictSyntaxToObject(result.types[key]);
                }
            }
        } */
    if (result.includes === undefined) {
      result.includes = []
    } else if (!Array.isArray(result.includes)) {
      result.includes = [result.includes]
    }

    if (result.excludes === undefined) {
      result.excludes = []
    } else if (!Array.isArray(result.excludes)) {
      result.excludes = [result.excludes]
    }
    return result
  }

  /**
     * @inheritDoc
     *
     * */
  static formatToObject (data) {
    if (!this.isUseStrictSyntax) {
      data = this.formatExtendedSyntaxToObject(data)
    }
    return this.formatStrictSyntaxToObject(data)
  }
}
InterfaceData.addGlobalEndPoints(PropertyCriteria)
