/**
 * @module @alexeyp0708/interface-manager
 */

import { CriteriaMethodType, PropertyCriteria, CriteriaType, InterfaceData, InterfaceError } from './export.js'

/**
 *  An instance of the CriteriaMethodType class stores the criteria for a reactive properties
 *  @prop {object} get  Criteria for a getter
 * ```js
 * {
 *     get: CriteriaMethodType {
 *          return:{
 *              types,
 *              includes,
 *              excludes,
 *              options
 *          }
 *          arguments:[]
 *    }
 * }
 *
 * ```
 * @prop {object} set Criteria for a setter
 * ```js
 * {
 *     set: CriteriaMethodType {
 *          arguments:[{
 *              types,
 *              includes,
 *              excludes,
 *              options
 *          }],
 *          return:{}
 *    }
 * }
 *
 * ```
 *  @inheritDoc
 *  @extends @.CriteriaType
 */
export class CriteriaReactType extends CriteriaType {
  /**
     * @param {object}  criteria  defines criteria for reactive properties
     * ```js
     * {
     *     get:{ //Template as PropertyCriteria. If get is missing it will not install.
     *         types,
     *         includes,
     *         excludes
     *     },
     *     set:{ //Template as PropertyCriteria. If set is missing it will not install.
     *         types,
     *         includes,
     *         excludes
     *     }
     *     options:{entryPoints:[],owner:''}
     * }
     * ```
     * or
     *```js
     * {
     *     get:{ //Template as CriteriaMethodType. If get is missing it will not install.
     *         arguments:[],
     *         return:{
     *             types,
     *             includes,
     *             excludes
     *         }
     *     },
     *     set:{ //Template as PropertyCriteria. If set is missing it will not install.
     *        arguments:[
     *            {
     *                types,
     *                includes,
     *                excludes
     *            }
     *        ],
     *        return:{}
     *     }
     *     options:{entryPoints:[],owner:''}
     * }
     * ```
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @throws {InterfaceError}
     */
  constructor (criteria = {}, entryPoints = []) {
    super(criteria)
    Object.defineProperties(this, {
      get: {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      },
      set: {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      }
    })
    if (criteria.get === null || criteria.get === undefined) {
      delete this.get
    } else {
      // criteria.get=PropertyCriteria.formatToObject(criteria.get);
      if (typeof criteria.get === 'object' && criteria.get !== null) {
        this.initGet(criteria.get, entryPoints)
      }
    }
    if (criteria.set === null || criteria.set === undefined) {
      delete this.set
    } else {
      // criteria.set=PropertyCriteria.formatToObject(criteria.set);
      if (typeof criteria.set === 'object' && criteria.set !== null) {
        this.initSet(criteria.set, entryPoints)
      }
    }
  }

  /*    /!**
     * @inheritDoc
     *!/
    initOptions(options={}){
        super.initOptions(options);
        if(this.get!==undefined){
            this.get.initOptions(options);
        }
        if(this.set!==undefined){
            this.set.initOptions(options);
        }
    } */

  /**
     * @inheritdoc
     */
  setOwner (owner) {
    super.setOwner(owner)
    if (this.get !== undefined) {
      this.get.setOwner(owner)
    }
    if (this.set !== undefined) {
      this.set.setOwner(owner)
    }
  }

  /**
     * @inheritdoc
     */
  freeze () {
    super.freeze()
    if (this.get !== undefined) {
      this.get.freeze()
    }
    if (this.set !== undefined) {
      this.set.freeze()
    }
  }

  /**
     * Initializes the getter
     * @param {object} criteria
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @throws {InterfaceError}
     */
  initGet (criteria = {}, entryPoints = []) {
    const tp = typeof criteria
    if (!['object'].includes(tp) || criteria == null) {
      new InterfaceError('initGet', { message: 'Object expected. Example:{types:["string","number"]} or {return:{types:["string","number"]}}' }).throw()
    }
    entryPoints = Object.assign([], entryPoints)
    if (criteria.hasOwnProperty('return')) {
      const options = criteria.options
      criteria = criteria.return
      if (criteria.options === undefined) {
        criteria.options = options
      }
    }
    criteria = Object.assign({}, criteria)
    const options = Object.assign({}, this.options, criteria.options)
    criteria = new CriteriaMethodType({ return: criteria, options }, entryPoints)
    this.get = criteria
  }

  /**
     * Initializes the setter
     * @param {object} criteria
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @throws {InterfaceError}
     */
  initSet (criteria = {}, entryPoints = []) {
    const tp = typeof criteria
    if (!['object'].includes(tp) || criteria == null) {
      new InterfaceError('initSet', { message: 'Object expected. Example:{types:["string","number"]} or {return:{types:["string","number"]}}' }).throw()
    }
    entryPoints = Object.assign([], entryPoints)
    if (criteria.hasOwnProperty('arguments')) {
      const options = criteria.options
      criteria = criteria.arguments[0]
      if (criteria.options === undefined) {
        criteria.options = options
      }
    }
    criteria = Object.assign({}, criteria)
    const options = Object.assign({}, this.options, criteria.options)
    criteria = new CriteriaMethodType({ arguments: [criteria], options }, entryPoints)
    this.set = criteria
  }

  build (data, criteria, entryPoints = []) {
    if (criteria instanceof CriteriaReactType) {
      if (
        data.get !== undefined &&
                criteria.get !== undefined
      ) {
        data.get = criteria.get.build(data.get, criteria.get, entryPoints)
      }
      if (
        data.set !== undefined &&
                criteria.set !== undefined
      ) {
        data.set = criteria.set.build(data.set, criteria.set, entryPoints)
      }
    }
    return data
  }

  /**
     * @inheritDoc
     * @value {get:(undefined|*),set(undefined|*)}
     */
  validate (value, entryPoints = []) {
    const errors = []
    if (!('get' in value) && !('set' in value)) {
      new InterfaceError('ValidateReactDeclared', {
        entryPoints: entryPoints.concat(['get/set']),
        react_type: 'getter/setter'
      }).throw()
    }
    if (this.get !== undefined && value.get === undefined) {
      errors.push(new InterfaceError('ValidateReactDeclared', {
        entryPoints: entryPoints.concat(['get']),
        react_type: 'getter'
      }))
    } else if (this.get === undefined && value.get !== undefined) {
      errors.push(new InterfaceError('ValidateReactDeclared', {
        entryPoints: entryPoints.concat(['get']),
        not: 'not',
        react_type: 'getter'
      }))
    }
    if (this.set !== undefined && value.set === undefined) {
      errors.push(new InterfaceError('ValidateReactDeclared', {
        entryPoints: entryPoints.concat(['set']),
        react_type: 'setter'
      }))
    } else if (this.set === undefined && value.set !== undefined) {
      errors.push(new InterfaceError('ValidateReactDeclared', {
        entryPoints: entryPoints.concat(['set']),
        not: 'not',
        react_type: 'setter'
      }))
    }
    if (errors.length > 0) {
      new InterfaceError('ValidateReact', { errors }).throw()
    }
  }

  /**
     * Seter validation according to criteria
     * If the setter is not set by the criteria, then an error will
     * @param val
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @returns {{types:(boolean|*),includes:(boolean|*),excludes:(boolean|*)}}
     * If there are no exceptions will return the result of matches
     * @throws {InterfaceError}
     */
  validateSet (val, entryPoints = []) {
    entryPoints = entryPoints.concat(['set'])
    if (!('set' in this)) {
      new InterfaceError('ValidateReactDeclared', { entryPoints, not: 'not', react_type: 'setter' }).throw()
    }
    return this.set.validateArguments([val], entryPoints)[0]
  }

  /**
     * Getter validation according to criteria
     * If the getter is not set by the criteria, then an error will
     * @param val
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @returns {{types:(boolean|*),includes:(boolean|*),excludes:(boolean|*)}}
     * If there are no exceptions will return the result of matches
     * @throws {InterfaceError} InterfaceError.type ===ValidateReactDeclared
     */
  validateGet (val, entryPoints = []) {
    entryPoints = entryPoints.concat(['get'])
    if (!('get' in this)) {
      new InterfaceError('ValidateReactDeclared', { entryPoints, not: 'not', react_type: 'getter' }).throw()
    }
    return this.get.validateReturn(val, entryPoints)
  }

  /**
     * Compare criteria with current criteria.
     * Used when an interface member is about to replace a member of the same name in another interface.
     * Rules:
     * - Getter/Setter must be present in the compared criteria, if the getter/setter is declared in the current criteria
     * - Getter/Setter not must be present in the compared criteria, if the getter/setter is not declared in the current criteria
     * @param {CriteriaReactType} criteria If the criteria do not match the CriteriaReactType type then a  error will be thrown
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @throws {InterfaceError}
     */
  compare (criteria, entryPoints = []) {
    entryPoints = Object.assign([], entryPoints)
    if (Object.getPrototypeOf(this).constructor !== Object.getPrototypeOf(criteria).constructor) {
      new InterfaceError('CompareReact', { entryPoints, message: 'Criteria not comparable' }).throw()
    }
    if (this.hasOwnProperty('get')) {
      if (!criteria.hasOwnProperty('get')) {
        new InterfaceError('CompareReact', { entryPoints, message: 'Getter not comparable' }).throw()
      } else {
        try {
          this.get.compare(criteria.get)
        } catch (e) {
          if (e instanceof InterfaceError) {
            new InterfaceError('CompareReact', { entryPoints, message: 'Getter not comparable' }).throw()
          }
          throw e
        }
      }
    } else if (criteria.hasOwnProperty('get')) {
      new InterfaceError('CompareReact', { entryPoints, message: 'Getter not comparable' }).throw()
    }
    if (this.hasOwnProperty('set')) {
      if (!criteria.hasOwnProperty('set')) {
        new InterfaceError('CompareReact', { entryPoints, message: 'Setter not comparable' }).throw()
      } else {
        try {
          this.set.compare(criteria.set)
        } catch (e) {
          if (e instanceof InterfaceError) {
            new InterfaceError('CompareReact', { entryPoints, message: 'Setter not comparable' }).throw()
          }
          throw e
        }
      }
    } else if (criteria.hasOwnProperty('set')) {
      new InterfaceError('CompareReact', { entryPoints, message: 'Setter not comparable' }).throw()
    }
  }

  static formatStrictSyntaxToObject (data) {
    if (data === null || data === undefined) {
      data = {}
    }
    if (typeof data !== 'object') {
      new InterfaceError('CriteriaReactFormat', { message: 'Object expected. Example:  {get:{},set{}}' }).throw()
    }
    const result = {}
    for (const prop of ['get', 'set']) {
      if (data.hasOwnProperty(prop) && data[prop] !== undefined) {
        if (!(data[prop] instanceof CriteriaType)) {
          if (data[prop].hasOwnProperty('arguments') || data[prop].hasOwnProperty('return')) {
            result[prop] = CriteriaMethodType.formatStrictSyntaxToObject(data[prop])
          } else {
            result[prop] = PropertyCriteria.formatStrictSyntaxToObject(data[prop])
          }
        }
      }
    }
    return result
  }

  /**
     * @inheritDoc
     *
     * */
  static formatToObject (data, entryPoints = []) {
    return this.formatStrictSyntaxToObject(data, entryPoints)
  }
}
InterfaceData.addGlobalEndPoints(CriteriaReactType)
