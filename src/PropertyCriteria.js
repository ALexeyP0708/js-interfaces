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
  //#types = ['mixed']
  #includes = []
  #excludes = []
  /**
     *
     * @param {object} criteria  Object with criteria. In this parameters is passed the criteria for the property/argument/return function.
     * Example:
     *  ```js
     *  {
     *      types:[
     *          'mixed'
     *          'number',
     *          'string',
     *          ],
     *      includes:[],
     *      excludes:[],
     *      options:{entryPoints:'MyPoint'}
     *  }
     *  ```
     * @throws {InterfaceError}
     */

  init (criteria) {
    const errors = []
    try {
      this.#initIncludes(criteria.includes)
    } catch (e) {
      if (e instanceof InterfaceError) {
        errors.push(e)
      } else {
        throw e
      }
    }
    try {
      this.#initExcludes(criteria.excludes)
    } catch (e) {
      if (e instanceof InterfaceError) {
        errors.push(e)
      } else {
        throw e
      }
    }
    if (errors.length > 0) {
      throw  InterfaceError.combineErrors('Init_BadIncludesOrExcludes',errors)
    }
  }
  
  /**
     * Define what values the property should include.
     * Rules:
     * -Must match the of current criteria types
     * @param {Array} values
     */
  #initIncludes (values = []) {
    values = Object.assign([], values)
    const errors = []
    for (const k in values) {
      const value = values[k]
      try {
        this.validateType(value)
      } catch (e) {
        if (!(e instanceof InterfaceError)) {
          throw e
        }
        e.addBeforeEntryPoint(`includes[${k}]`)
        errors.push(e)
      }
    }
    if (errors.length > 0) {
      new InterfaceError().setType('InitIncludes').setErrors(errors)
    }
    this.#includes = values
  }

  /**
     * Define what values the property should exclude.
     * Rules:
     * -Must match the of current criteria types
     * @param {Array} values
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     */
  #initExcludes (values = [], entryPoints = []) {
    entryPoints = Object.assign([], entryPoints)
    values = Object.assign([], values)
    const errors = []
    for (const k in values) {
      const value = values[k]
      try {
        this.validateType(value, [`excludes[${k}]`])
      } catch (e) {
        if (e instanceof InterfaceError) {
          errors.push(e)
        } else {
          throw e
        }
      }
    }
    if (errors.length > 0) {
      new InterfaceError('InitExcludes', { errors, entryPoints }).throw(true)
    }
    this.excludes = values
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
    const errors = []
    try {
      result=this.#validateByIncludes(value,isThrow)
      if(!result){
        return false
      }
    } catch (e) {
      if (!(e instanceof InterfaceError)) {
        throw e
      }
      errors.push(e)
    }
    try {
      result=this.#validateByExcludes(value,isThrow)
      if(!result){
        return false
      }
    } catch (e) {
      if (!(e instanceof InterfaceError)) {
        throw e
      }
      errors.push(e)
    }
    if (isThrow && errors.length > 0) {
      new InterfaceError().setType('Validate').setErrors(errors)
    }
    return result
  }
  
  /**
     * data type validation
     * @param {*} value
     * @param {boolean} [isThrow=true]  
     * @returns {false|*} value
     * @throws {InterfaceError}
     */
  #validateByType (value,isThrow=true) {
    return this.getTypes().validateData(value,isThrow)
  }

  /**
     * Checks if a value is in an array or belongs to a Class or an object in the passed array of values
     * @param value
     * @param {Array} equalValues
     * @returns {boolean|*} Returns a match or false.
     */
  #isIncludeInValues (value, equalValues = []) {
    let check = false
    let result = false
    for (const equal of equalValues) {
      const te = typeof equal
      if (te === 'function' || te === 'object' && equal !== null) {
        if (this.instanceOf(value, equal)) {
          result = equal
          check = true
          break
        }
      } else if (value === equal) {
        result = equal
        check = true
        break
      }
    }
    return result
  }

  /**
     * Validation incoming parameters for compliance with the values set in the "includes" criteria
     * @param value
     * @param {boolean} [isThrow=true]
     * @returns {boolean} 
     * @throws {InterfaceError}
     */
  #validateByIncludes (value, isThrow=true) {
    const equalValues = this.#includes
    let result = false
    if (equalValues.length > 0) {
      result = this.#isIncludeInValues(value, equalValues)
      if (result === false) {
        // Does not match the values [${values}].
        switch (typeof value) {
          case 'function':
            value = `function ${value.name}`
            break
          case 'object':
            if (value !== null) {
              value = `object ${Object.getPrototypeOf(value).constructor.name}`
            } else {
              value = 'null'
            }
            break
        }
        new InterfaceError('ValidateInIncludes', { entryPoints, value }).throw()
      }
    }
    return result
  }

  /**
   * Validation incoming parameters for compliance with the values set in the "includes" criteria
   * @param value
   * @param {boolean} [isThrow=true]
   * @returns {boolean}
   * @throws {InterfaceError}
   */
  #validateByExcludes (value, isThrow=true) {
    const equalValues = this.excludes
    let result = false
    if (equalValues.length > 0) {
      result = this.isIncludeInValues(value, equalValues)
      if (result !== false) {
        // Does not match the values [${values}].
        switch (typeof value) {
          case 'function':
            value = `function ${value.name}`
            break
          case 'object':
            if (value !== null) {
              value = `object ${Object.getPrototypeOf(value).constructor.name}`
            } else {
              value = 'null'
            }
            break
        }
        new InterfaceError('ValidateInExcludes', { entryPoints, value }).throw()
      }
    }
    return result
  }

  /**
     * Compare criteria with current criteria.
     * Used when an interface member is about to replace a member of the same name in another interface.
     * @param {PropertyCriteria} criteria
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError}
     * @see [method .#compareTypes]
     * @see [method .#compareIncludes]
     * @see [method .#compareExcludes]
     */
  compare (criteria, entryPoints = []) {
    entryPoints = Object.assign([], entryPoints)
    if (Object.getPrototypeOf(this).constructor !== Object.getPrototypeOf(criteria).constructor) {
      new InterfaceError('BadCriteria', { className: Object.getPrototypeOf(this).constructor.name, entryPoints }).throw()
    }
    this.compareTypes(criteria, entryPoints)
    this.compareIncludes(criteria, entryPoints)
    this.compareExcludes(criteria, entryPoints)
  }

  /**
     * Compare types criteria with current types criteria.
     * Rules:
     * - strict correspondence of the number of types
     * - Types must match each other strictly (===)
     * - If there is a mixed type, then the compared must also be mixed or an empty array
     * - If the array of types is empty, then the compared one must be mixed or an empty array
     * - If the type specifies a subtype of the type CriteriaType, then the type will pass the same conformity check
     * @param {PropertyCriteria} criteria
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     * @throws {InterfaceError}
     */
  compareTypes (criteria, entryPoints = []) {
    if (
      (criteria.types.includes('mixed') || criteria.types.length <= 0) &&
            (this.types.includes('mixed') || this.types.length <= 0)
    ) {
      return
    }
    if (criteria.types.length !== this.types.length) {
      new InterfaceError('CompareTypes', { entryPoints }).throw()
    }
    const bufSelfCriteria = []
    for (const type of this.types) {
      if (type instanceof CriteriaType) {
        bufSelfCriteria.push(type)
      }
    }
    for (let k = 0; k < criteria.types.length; k++) {
      const type = criteria.types[k]
      if (type instanceof CriteriaType) {
        let check = false
        for (let bk = 0; bk < bufSelfCriteria.length; bk++) {
          const btype = bufSelfCriteria[bk]
          try {
            btype.compare(type, entryPoints)
            bufSelfCriteria.splice(bk, 1)
            check = true
            break
          } catch (e) {
            if (!(e instanceof InterfaceError)) {
              throw e
            }
          }
        }
        if (!check) {
          new InterfaceError('CompareTypes', { entryPoints }).throw()
        }
      } else if (!this.types.includes(type)) {
        new InterfaceError('CompareTypes', { entryPoints }).throw()
      }
    }
  }

  /**
     * Compare includes criteria with current includes criteria.
     * Rules:
     * - strict correspondence of the number of includes
     * - Types must match each other strictly (===)
     * - If the array of types is empty, then the compared one must be empty array
     * @param {PropertyCriteria} criteria
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     * @throws {InterfaceError}
     */
  compareIncludes (criteria, entryPoints = []) {
    if (
      criteria.includes.length <= 0 && this.includes.length <= 0

    ) {
      return
    }
    if (criteria.includes.length !== this.includes.length) {
      new InterfaceError('CompareIncludes', { entryPoints }).throw()
    }
    for (const k in criteria.includes) {
      const include = criteria.includes[k]
      if (!this.includes.includes(include)) {
        new InterfaceError('CompareIncludes', { entryPoints }).throw()
      }
    }
  }

  /**
     * Compare excludes criteria with current excludes criteria.
     * Rules:
     * - strict correspondence of the number of includes
     * - Types must match each other strictly (===)
     * - If the array of types is empty, then the compared one must be empty array
     * @param {PropertyCriteria} criteria
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     * @throws {InterfaceError}
     */
  compareExcludes (criteria, entryPoints = []) {
    if (
      criteria.excludes.length <= 0 && this.excludes.length <= 0
    ) {
      return
    }
    if (criteria.excludes.length !== this.excludes.length) {
      new InterfaceError('CompareExcludes', { entryPoints }).throw()
    }
    for (const k in criteria.excludes) {
      const exclude = criteria.excludes[k]
      if (!this.excludes.includes(exclude)) {
        new InterfaceError('CompareExcludes', { entryPoints }).throw()
      }
    }
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
