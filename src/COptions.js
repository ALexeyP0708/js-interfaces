export class COptions {
  #owner
  #entryPoints

  /**
     *
     * @param {[owner]:Function} options
     * @param {Function} options.owner
     */
  constructor (options) {
    if (typeof options !=='object') {
      throw new Error('"options" argument  must be an object')
    }
    if (options.owner !== undefined) {
      this.setOwner(options.owner)
    }
  }

  /**
     *
     * @returns {undefined|Function}
     */
  getOwner () {
    return this.#owner
  }

  /**
     *
     * @param {Function} owner
     */
  setOwner (owner) {
    if (typeof owner !== 'function') {
      throw new Error('Argument "owner" must be function type.')
    }
    this.#owner = owner
  }

  /**
     *
     * @param {self|object} options
     */
/*  merge (options) {
    const SelfClass = Object.getPrototypeOf(this).constructor
    if (options instanceof SelfClass) {
      options = options.export()
    } else {
      SelfClass.validate(options)
    }
    for (const prop of Object.getOwnPropertyNames(options)) {
      const method = 'set' + prop[0].toUpperCase() + prop.slice(1)
      if (method in this) {
        this[method](prop)
      } else {
        throw Error(`"${prop}" property cannot be set.`)
      }
    }
  }*/

  /**
     *
     * @returns {{owner:<Function>}}
     */
  export () {
    return {
      owner: this.#owner
    }
  }
}
