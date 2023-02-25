import { InterfaceData } from './export.js'
import { COptions } from './COptions.js'

/**
 * @abstract
 * Abstract class. Generates baseline properties and methods  for criteria classes
 * @prop {{entryPoints:Array.<string>,owner:function}} options

 */
export class Criteria {
  /**
     * @var {COptions} #options
     */
  #options
  /**
     *
     * @param {{types: string[], excludes: *[], includes: *[]}} criteria
     * @param {object} criteria.options See COptions.export()
     *
     */
  constructor (criteria) {
    if (criteria === undefined) {
      console.warn(`Warn debug: ${Object.getPrototypeOf(this).constructor.name} class:`, `Pay attention to criteria === undefined option and look for the place where undefined is passed`)
      // temporarily so that there are no errors
      criteria = {}
    }
    this.#init(criteria)
  }

  /**
     *
     * @param {object} criteria
     * @param criteria
     */
  #init (criteria) {
    this.#initOptions(criteria.options)
    this.init(criteria)
  }

  /**
     *
     * @param {object} options
     */
  #initOptions (options = {}) {
    if (this.#options !== undefined) {
      throw new Error(`${Object.getPrototypeOf(this).constructor.name}: Private property #options already initialized.`)
    }
    this.#options = new COptions(options)
  }

  init (criteria = {}) {
    throw new Error('Method not implemented')
  }

  getOptions () {
    return this.#options
  }

  /**
     *
     * @param {COptions|object} options
     */
  /* mergeOptions(options){
        this.#options.merge(options);
    } */

  /**
     * Sets the owner of the criteria
     * @param {Function} owner
     */
  setOwner (owner) {
    this.#options.setOwner(owner)
  }

  /**
     * Get the owner of the criteria
     * @returns {undefined|Function}
     */
  getOwner () {
    return this.#options.getOwner()
  }

  freeze () {
    Object.freeze(this)
  }

  static generateObject (criteria, owner) {
    if (!(criteria instanceof this)) {
      criteria = this.formatToObject(criteria)
      criteria = new this(criteria, typeof owner === 'function' ? [`~${owner.name}~`] : [])
    }
    if (typeof owner === 'function') {
      criteria.setOwner(owner)
    }
    criteria.freeze()
    return criteria
  }

  /**
     * @abstract
     * @param data
     * @param criteria
     * @param entryPoints
     */
  build (data, criteria, entryPoints = []) {
    throw new Error('Method not implemented')
  }

  /**
     * @abstract
     */
  compare () {
    throw new Error('Method not implemented')
  }

  /**
     * Validation of incoming parameters according to the established current criteria (object)
     *
     * @abstract
     * @param value
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @returns {object} If there are no exceptions must return the result of matches
     * @throws {InterfaceError}
     */
  validate (value, entryPoints = []) {
    throw new Error('Method not implemented')
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
    throw new Error('Method not implemented')
  }
}
Criteria.isUseStrictSyntax = true
InterfaceData.addGlobalEndPoints(Criteria)
