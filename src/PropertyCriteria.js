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
  #types = ['mixed']
  includes = []
  excludes = []
  /**
     *
     * @param {object} criteria  Object with criteria. In this parameters is passed the criteria for the property/argument/return function.
     * @param {string[]} [entryPoints] Indicate where the method call came from
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

  init (criteria, entryPoints) {
    this.#initTypes(criteria.types, entryPoints)
    const errors = []
    try {
      this.initIncludes(criteria.includes, [])
    } catch (e) {
      if (e instanceof InterfaceError) {
        errors.push(e)
      } else {
        throw e
      }
    };
    try {
      this.initExcludes(criteria.excludes, [])
    } catch (e) {
      if (e instanceof InterfaceError) {
        errors.push(e)
      } else {
        throw e
      }
    };
    if (errors.length > 0) {
      new InterfaceError('Init_BadIncludesOrExcludes', { entryPoints, errors }).throw(true)
    }
    // this.freeze();
  }

  /**
     * Define the data type of the property.
     * @param {Array} types
     * if string, then null|undefined|object|boolean|number|string|symbol|function|mixed
     * If a function is written in the shorthand type `() => {}`, it is considered the interface of the function and will call it.
     * @param {string[]} [entryPoints] Indicate where the method call came from

     */
  #initTypes (types = ['mixed'], entryPoints = []) {
    entryPoints = Object.assign([], entryPoints)
    types=new CTypes(types);
    this.types = types
  }

  /**
     * Define what values the property should include.
     * Rules:
     * -Must match the of current criteria types
     * @param {Array} values
     * @param {string[]} [entryPoints] Indicate where the method call came from
     */
  initIncludes (values = [], entryPoints = []) {
    entryPoints = Object.assign([], entryPoints)
    values = Object.assign([], values)
    const errors = []
    for (const k in values) {
      const value = values[k]
      try {
        this.validateType(value, [`includes[${k}]`])
      } catch (e) {
        if (e instanceof InterfaceError) {
          errors.push(e)
        } else {
          throw e
        }
      }
    }
    if (errors.length > 0) {
      new InterfaceError('InitIncludes', { entryPoints, errors }).throw(true)
    }
    this.includes = values
  }

  /**
     * Define what values the property should exclude.
     * Rules:
     * -Must match the of current criteria types
     * @param {Array} values
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     */
  initExcludes (values = [], entryPoints = []) {
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
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @returns {{types:(boolean|*),includes:(boolean|*),excludes:(boolean|*)}}
     * If there are no exceptions will return the result of matches
     * @throws {InterfaceError}
     */
  validate (value, entryPoints = []) {
    entryPoints = Object.assign([], entryPoints)
    const result = {
      types: undefined,
      includes: undefined,
      excludes: undefined
    }
    result.types = this.validateType(value, entryPoints)
    const errors = []
    try {
      result.includes = this.validateInIncludes(value, [])
    } catch (e) {
      if (e instanceof InterfaceError) {
        errors.push(e)
      } else {
        // sc.allowToSpeak();
        throw e
      }
    }
    try {
      result.excludes = this.validateInExcludes(value, [])
    } catch (e) {
      if (e instanceof InterfaceError) {
        errors.push(e)
      } else {
        // sc.allowToSpeak();
        throw e
      }
    }
    // sc.allowToSpeak();
    if (errors.length > 0) {
      new InterfaceError('Validate', { entryPoints, errors }).throw(true)
    }
    return result
  }

  /**
     * Validation of incoming parameters by data type according to current the criteria (object)
     * Rules:
     * - The type of the passed value must match the criteria of the current object.
     * - If a class or object is passed, then they must inherit Class or Interface or object  specified
     * in the types of the current criteria
     * - If the criteria set an interface inheriting the MirrorInterface interface,
     * then any object or class passed must meet the criteria set by this interface
     * @param value
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @returns {boolean|*} Returns a match or false. If there are no exceptions and false, then the set is empty.
     * @throws {InterfaceError}
     */
  validateType (value, entryPoints = []) {
    entryPoints = Object.assign([], entryPoints)
    if (this.types.includes('mixed')) {
      return 'mixed'
    }
    let tv = typeof value
    const types_string = []
    if (value === null) {
      tv = 'null'
    }
    const errors = []
    let check = false
    let result = false
    for (const type of this.types) {
      let tt = typeof type
      if (type === null) { tt = 'null' }
      if (tt === 'string') {
        types_string.push(type)
      } else if (tt === 'object') {
        if (type instanceof CriteriaMethodType) {
          types_string.push('function')
        } else if (type instanceof PropertyCriteria) {
          types_string.push(`[${type.types.toString()}]`)
        } else {
          types_string.push(`[object ${Object.getPrototypeOf(type).constructor.name}]`)
        }
      } else {
        types_string.push(`[function ${type.name}]`)
      }
      if (['object', 'function'].includes(tt) && ['object', 'function'].includes(tv)) {
        if (tt === 'object' && type instanceof CriteriaType) {
          try {
            result = type.validate(value, entryPoints)
            result = result.types
            check = true
            break
          } catch (e) {
            if (!(e instanceof InterfaceError)) {
              throw e
            }
            errors.push(e)
          }
        } /* else// refactoring -there is already a check for the CriteriaType
                if(tv==='function' && tt==='object' && this.instanceOf(type, MirrorInterface)){
                    try {
                        result=type.validate(value,entryPoints);
                        check=true;
                        break;
                    } catch (e) {
                        if(! (e instanceof InterfaceError) || e.type!=='Validate_BadMirrorProperties'){
                            //sc.allowToSpeak();
                            throw e;
                        }
                        errors.push(e);
                    }
                }  */
        else if (value === type || this.instanceOf(value, type)) {
          result = type
          check = true
          break
        }
      } else
      if (
        tt === 'string' && (type === 'mixed' || tv === type)
      ) {
        result = type
        check = true
        break
      }
    }
    // sc.allowToSpeak();
    if (!check) {
      if (tv === 'object') {
        tv = `[object ${Object.getPrototypeOf(value).constructor.name}]`
      } else if (tv === 'function') {
        tv = `[function ${value.name}]`
      }
      new InterfaceError('ValidateType', { entryPoints, expectedTypes: `[${types_string.join(',')}]`, definedType: tv, errors }).throw(true)
    }
    return result
  }

  /**
     * Checks if a value is in an array or belongs to a Class or an object in the passed array of values
     * @param value
     * @param {Array} equalValues
     * @returns {boolean|*} Returns a match or false.
     */
  isIncludeInValues (value, equalValues = []) {
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
     * Validation incoming parameters for compliance with the values ​​set in the "includes" criteria
     * @param value
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @returns {boolean|*} Returns a match or false. If there are no exceptions and false, then the set is empty.
     * @throws {InterfaceError}
     */
  validateInIncludes (value, entryPoints = []) {
    const equalValues = this.includes
    let result = false
    if (equalValues.length > 0) {
      result = this.isIncludeInValues(value, equalValues)
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
     * Validation incoming parameters for compliance with the values ​​set in the "excludes" criteria
     * @param value
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @returns {boolean|*} Returns a match or false. If there are no exceptions and false, then the set is empty.
     * @throws {InterfaceError}
     */
  validateInExcludes (value, entryPoints = []) {
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
