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
   * Validation of incoming parameters according to the established current criteria (object)
   *
   * @abstract
   * @param value
   * @param {string[]} [entryPoints] Indicate where the method call came from
   * @returns {object} If there are no exceptions must return the result of matches
   * @throws {InterfaceError}
   */
  validate (value, entryPoints = []) {
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
}