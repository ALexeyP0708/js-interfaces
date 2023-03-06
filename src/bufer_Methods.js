import {InterfaceError} from "./InterfaceError.js";

class CriteriaProperty{
  #includes = []
  #excludes = []
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
}