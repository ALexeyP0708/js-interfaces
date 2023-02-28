/**
 * @abstract
 */
export class ICriteria {
  /**
   * @abstract
   * @param data
   * @param criteria
   * @param entryPoints
   */
  build (data, criteria, entryPoints = []) {
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.build method not implemented.`)
  }
  /**
   * @abstract
   */
  compare () {
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.compare method not implemented.`)
  }

  /**
   * @abstract
   * The method should throw an exception InterfaceError if the validation fails.
   *  Validation of incoming parameters according to the established current criteria (object)
   * @param {*} value
   * @param {boolean} [isThrow=true] disables throwing an exception
   * @returns {*|false} If not false, then return the type to which the validation matches
   */
  validate (value, isThrow=true) {
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.validate method not implemented.`)
  }

  /**
   * @abstract
   * The method should throw an exception InterfaceError if the validation fails.
   * @param value
   * @param {boolean} [isThrow=true] disables throwing an exception
   * @returns {*|false} If not false, then return the type to which the validation matches
   */
  validateByType (value, isThrow=true) {
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.validate method not implemented.`)
  }

  /**
   * @abstract
   */
  setOwner(){
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.setOwner method not implemented.`)
  }

  /**
   * @abstract
   */
  getOwner(){
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.getOwner method not implemented.`)
  }


  /**
   * @abstract
   */
  toString(){
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.toString method not implemented.`)
  }
}