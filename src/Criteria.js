import {CTypes, COptions, InterfaceError} from './export.js'
import {ICriteria} from './ICriteria.js'
/**
 * @abstract
 * Abstract class. Generates baseline properties and methods  for criteria classes
 * @prop {{entryPoints:Array.<string>,owner:function}} options
 */
export class Criteria extends ICriteria {
 
  #options
  
  #types
  
  /**
     * @param  criteria
     * @param {{[owner]:Function}} criteria.options  See [COptions]{@link COptions#constructor}
     * @param {CTypes|Array} [criteria.types]  See [CTypes]{@link CTypes#constructor}
    */
  constructor (criteria) {
    super()
    let type=typeof criteria
    if(typeof criteria !== 'object'){
      throw new Error(`Argument "criteria" of type ${type}. Argument must be of type object.`)
    }
    /*if (criteria === undefined) {
    
      console.warn(`Warn debug: ${Object.getPrototypeOf(this).constructor.name} class:`, `Pay attention to criteria === undefined option and look for the place where undefined is passed`)
      // temporarily so that there are no errors
      criteria = {}
    }*/
    this.#init(criteria)
  }

  /**
     *
     * @param {object} criteria
     * @param criteria
     */
  #init (criteria) {
    this.#initOptions(criteria.options)
    this.#initTypes(criteria.types)
    this.init(criteria)
  }
  
  #initOptions (options) {
    if(options instanceof COptions){
      this.#options = options
    } else {
      // temporarily
      if(options===undefined){
        options={}
      }
      this.#options = new COptions(options)
    }
  }
  
  #initTypes(types){
    if(types instanceof CTypes){
      this.#types=types
    } else {
      if(types===undefined || types.length<=0){
        types=['mixed']
      }
      this.#types= new CTypes(types)
    }
  }

  /**
   * @deprecated
   */
  getOptions () {
    this.exportOptions()
  }
  
  exportOptions(){
    return this.#options.export()
  }
  
  exportTypes () {
    return this.#types.export()
  }
  
  /**
     * Sets the owner of the criteria
     * @param {Function} owner
     * @returns {Criteria}
     */
  setOwner (owner) {
    this.#options.setOwner(owner)
    return this
  }

  /**
     * Get the owner of the criteria
     * @returns {undefined|Function}
     */
  getOwner () {
    return this.#options.getOwner()
  }
  
  /**
   * Generates a new Criteria object
   * @param {*} criteria
   * @param {Function} [owner]
   * @returns {Criteria}
   */
  static generateObject (criteria, owner) {
    if (!(criteria instanceof this)) {
      criteria = this.formatToObject(criteria)
      try {
        criteria = new this(criteria)  
      } catch (e) {
        if(e instanceof InterfaceError && typeof owner === 'function'){
          e.addBeforeEntryPoint(`~${owner.name}~`) 
        }
        throw e
      }
    }
    if (typeof owner === 'function') {
      criteria.setOwner(owner)
    }
    return criteria
  }
  init (criteria = {}) {
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.init method not implemented.`)
  }
  
  /**
     * Formats the declared criteria in order for further work.
     * The constructor of the class that implements the CriteriaType class takes an object as an argument,
     * which is a template for creating the current object.
     * This method just generates a strict template-object from a template-object that does not have a strict match.
     *
     * @abstract
     * @param {undefined|null|object} data
     * @return {object}  The returned data depends on which class the method is applied in.
     */
  static formatToObject (data) {
    throw new Error(`${this.name}.formatToObject static method not implemented.`)
  }
}
Criteria.isUseStrictSyntax = true
