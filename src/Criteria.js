import {CTypes, COptions, InterfaceError} from './export.js'
import {ICriteria} from './ICriteria.js'
/**
 * @abstract
 * Abstract class. Generates baseline properties and methods  for criteria classes
 * @prop {{entryPoints:Array.<string>,owner:function}} options
 */
export class Criteria extends ICriteria {
 
  #options

  /**
   * @vars {CTypes} #types
   */
  #types
  
  /**
     * @param  criteria
     * @param {{[owner]:Function}} [criteria.options]  See [COptions]{@link COptions#constructor}
     * @param {CTypes|Array} [criteria.types]  See [CTypes]{@link CTypes#constructor}
    */
  constructor (criteria) {
    super()
    let type=typeof criteria
    if(typeof criteria !== 'object'){
      throw new Error(`Argument "criteria" of type ${type}. Argument must be of type object.`)
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
    const errors=[];
    try{
      this.#initTypes(criteria.types)
    }catch (e){
      if(!(e instanceof InterfaceError)){
        throw e
      }
      errors.push(e)
    }
    try{
      this.init(criteria)  
    }catch (e){
      if(!(e instanceof InterfaceError)){
        throw e
      }
      errors.push(e)
    }
    if(errors.length>0){
      //throw new InterfaceError().setType('Init').setErrors(errors)
      throw InterfaceError.combineErrors('Init',errors)
    }
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
   * 
   * @return {COptions}
   */
  getOptions () {
    return this.#options
  }

  /**
   * 
   * @return {{owner}}
   */
  exportOptions(){
    return this.#options.export()
  }
  /**
   *
   * @returns {CTypes}
   */
  getTypes(){
    return this.#types
  }

  /**
   * 
   * @return {object}
   */
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
   * @returns {Criteria}
   */
  static generateObject (criteria) {
    if (!(criteria instanceof ICriteria)) {
      criteria = this.formatToObject(criteria)
      criteria = new this(criteria)
    }
    return criteria
  }
  init (criteria = {}) {
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.init method not implemented.`)
  }
  
  build (data, criteria, entryPoints = []) {
    return data
  }

  /**
   * Validation of incoming parameters according to the established current criteria (object)
   * @param {*} value
   * @return {boolean}
   */
  validate (value) {
    return this.getTypes().validate(value)
  }

  /**
   * Compare criteria with current criteria.
   * Compare types criteria with current types criteria.
   * Used when assigning new interfaces
   * Used when an interface member is about to replace a member of the same name in another interface.
   * @param {Criteria} criteria
   * @param {string} [method='strict'] strict|restrict|expand
   * @return {boolean}
   */
  compare (criteria,method='strict') {
    const SelfClass=Object.getPrototypeOf(this).constructor
    const CriteriaClass=Object.getPrototypeOf(criteria).constructor
    if (CriteriaClass!==SelfClass && !Object.prototype.isPrototypeOf.call(CriteriaClass,SelfClass)) {
      return false
    }
    return this.getTypes().compare(criteria.getTypes(),method)
  }
  
   /**
   *
    * @deprecated
   * @param {Criteria} criteria
   * @param {boolean} [isTrow=true]
   */
  compareStrictly (criteria,isTrow=true){
     //experiment
    let thisTypes=this.exportTypes()
    let comparedTypes=criteria.exportTypes()
    let check=false;
    if(thisTypes.length===comparedTypes.length){
      for (const thisType of thisTypes){
        check=false
        let thisTypeType = typeof thisType
        if (thisTypeType === 'string') {
          let key=comparedTypes.indexOf(thisType)
          check=key>-1
          if(check){comparedTypes.splice(key,1)}
        } else {
          if(Object.getPrototypeOf(thisType)===Array.prototype && Array.isArray(thisType)){
            // container
            const ThisTypeContainerClass=Object.getPrototypeOf(this).constructor
            const thisTypeContainer=new ThisTypeContainerClass({types:thisType})
            for(let key=0; key<comparedTypes.length; key++){
              const comparedType=comparedTypes[key]
              if(Object.getPrototypeOf(comparedType)===Array.prototype && Array.isArray(comparedType)){
                const ComparedTypeContainerClass=Object.getPrototypeOf(criteria).constructor
                const comparedTypeContainer=new ComparedTypeContainerClass({types:comparedType})
                check=thisTypeContainer.compareStrictly(comparedTypeContainer,false)
              }
              if(check){ comparedTypes.splice(key,1); break}
            }
          } else if(thisType instanceof ICriteria) {
            // compare criteria
            let SelfClass=Object.getPrototypeOf(thisType).constructor
            for(let key=0; key<comparedTypes.length; key++){
              const comparedType=comparedTypes[key]
              if(comparedType instanceof SelfClass){
                check=thisType.compareStrictly(comparedType,false)
                if(check){ comparedTypes.splice(key,1); break}
              }
            }
          } else if(thisTypeType==='function'){
            for(let key=0; key<comparedTypes.length; key++){
              const comparedType=comparedTypes[key]
              if(typeof comparedType==='function'){
                // instanceof
                check=thisType===comparedType//CTypes.instanceOf(thisType, comparedType)
                if(check){ comparedTypes.splice(key,1); break}
              }
            }
          } else if(thisTypeType==='object'){
            for(let key=0; key<comparedTypes.length; key++){
              const comparedType=comparedTypes[key]
              if(typeof comparedType==='object'){
                // instanceof
                check=thisType===comparedType//CTypes.instanceOf(thisType, comparedType)
                if(check){comparedTypes.splice(key,1); break}
              }
            }
          } 
        }
        if(!check){
          break
        }
      }
      if(comparedTypes.length>0){
        check=false
      }
    }
    if(isTrow && !check){
      throw new InterfaceError().setType('BadCriteria_compareStrictly')
    }
    return check
  }
  
  /**
   *
   * @param {Criteria} criteria
   * @return {this}
   */
  merge(criteria){
    this.getTypes().merge(criteria.getTypes())
    return this
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
  static _t_member(member_name, ...args) {
    let member=eval(`this.${member_name}`)
    if(typeof member === 'function'){
      if(/^(?:function[\s]*\(|\(?[\w,]*\)?\s*=>)/i.test(member.toString())){
        return member;
      }
      return member.call(this,...args);
    } else {
      return member;
    }
  }
  _t_member(member_name, ...args) {
    let member=eval(`this.${member_name}`)
    if(typeof member === 'function'){
      if(/^(?:function[\s]*\(|\(?[\w,]*\)?\s*=>)/i.test(member.toString())){
        return member;
      }
      return member.call(this,...args);
    } else {
      return member;
    }
  }
}
Criteria.isUseStrictSyntax = true
