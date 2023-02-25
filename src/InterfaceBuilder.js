/**
 * @module @alexeyp0708/interface-manager
 */

import {
  CriteriaMethodType,
  Descriptors,
  InterfaceData,
  InterfaceError,
  InterfaceRules,
  InterfaceValidator
} from './export.js'

export const ownerSandbox = Symbol('ownerSandbox')

/**
 * Class of static methods.
 * For generating interfaces, managing classes, and assigning interfaces to them.
 * Collects methods of classes in the sandbox.
 */
export class InterfaceBuilder {
  /**
     * Checks if a class is an interface
     * @param {function} ProtoClass
     * @returns {boolean}
     */
  static isInterface (ProtoClass) {
    return ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface
  }

  /**
     * Runs a sandboxed method.
     * @param {function} func method to be executed
     * @param {function|object} self  the object in which the method is applied
     * @param {Array} args arguments for the method
     * @param {CriteriaMethodType} criteria criteria for validation of arguments and return value
     * @param {Array} entryPoints script execution entry point
     * @returns {*}
     */
  static runSandbox (func, self, args, criteria, entryPoints = []) {
    try {
      const rules = criteria.validateArguments(args, entryPoints)
      for (let key = 0; key < rules.length; key++) {
        if (typeof args[key] !== 'function') { continue }
        const rule = rules[key].types
        if (rule instanceof CriteriaMethodType && rule.isBuildSandbox !== false) {
          args[key] = this.generateSandbox(args[key], rule, entryPoints.concat(`arguments[${key + 1}].call()`))
        }
      }
    } catch (e) {
      if (e instanceof InterfaceError) {
        e.renderErrors()
      }
      throw e
    }
    let answer = func.call(self, ...args)
    try {
      const rule = criteria.validateReturn(answer, entryPoints).types
      if (typeof answer === 'function' && rule instanceof CriteriaMethodType && rule.isBuildSandbox !== false) {
        answer = this.generateSandbox(answer, rule, entryPoints.concat('return.call()'))
      }
    } catch (e) {
      if (e instanceof InterfaceError) {
        e.renderErrors()
      }
      throw e
    }
    return answer
  }

  /**
     * Sandboxes the called function/method
     * A sandbox is a function in which a method or reactive function will be executed with
     * a check of the transmitted and returned parameters.
     * @param func
     * @param {CriteriaMethodType} criteria
     * @param {string[]} entryPoints
     */
  static generateSandbox (func, criteria, entryPoints = []) {
    func = this.getOwnerOfSandbox(func)
    entryPoints = entryPoints.concat([])
    const name = func.name ?? ''
    const self = this
    const sandbox = {
      [name] (...args) {
        return self.runSandbox(func, this, args, criteria, entryPoints)
      }
    }[func.name]
    Object.defineProperty(sandbox, ownerSandbox, {
      configurable: true,
      writable: true,
      value: func
    })
    return sandbox
  }

  /**
     * returns the original function / method from the sandbox
     * @param {function} func sandbox
     * @returns {function} If it is a sandbox, then it gives the function to be performed in the sandbox.
     * otherwise it will return the passed function
     */
  static getOwnerOfSandbox (func) {
    if (this.isSandbox(func)) {
      func = func[ownerSandbox]
    }
    return func
  }

  /**
     * Checks if a function is sandboxed
     * @param {function} func
     * @returns {boolean}
     */
  static isSandbox (func) {
    return typeof func === 'function' && ownerSandbox in func && typeof func[ownerSandbox] === 'function'
  }

  /**
     * If the property descriptor has isBuilt = true (the property is assembled),
     * then it extracts the original descriptor from the assembly.
     * @param descriptors
     * @returns {object} return own descriptor
     */
  static extractOwnDescriptors (descriptors = {}) {
    for (const prop in descriptors) {
      const desc = descriptors[prop]
      if (desc.get !== undefined && typeof desc.get[ownerSandbox] === 'function') {
        desc.get = desc.get[ownerSandbox]
      }
      if (desc.set !== undefined && typeof desc.set[ownerSandbox] === 'function') {
        desc.set = desc.get[ownerSandbox]
      }
      if (desc.value !== undefined && typeof desc.value[ownerSandbox] === 'function') {
        desc.value = desc.value[ownerSandbox]
      }
    }
    return descriptors
  }

  /**
     * Assembling  descriptors for the properties (functions and getter / setter) of a class.
     * Puts native descriptors in the sandbox, for verification purposes at runtime.
     * @param {object} descriptors  See {@Descriptors.get}
     * @param {object} rules
     * @returns {object} new descriptors  See [method .Descriptors.get]
     */
  static buildDescriptors (descriptors, rules = {}, isStatic = false) {
    const prefix = isStatic ? '.' : '#'
    for (const prop of Object.getOwnPropertyNames(rules)) {
      if (prop in descriptors) {
        for (const rule of rules[prop]) {
          const entryPoints = [`${descriptors[prop].constructor.name}`, `~${rule.criteria.getOwner().name}~`, `${prefix}${prop}`]
          const criteria = rule.criteria
          let data
          let check = false
          if (descriptors[prop].hasOwnProperty('value')) {
            data = descriptors[prop].value
          } else {
            data = {}
            check = true
            if (descriptors[prop].hasOwnProperty('set')) {
              data.set = descriptors[prop].set
            }
            if (descriptors[prop].hasOwnProperty('get')) {
              data.get = descriptors[prop].get
            }
          }
          data = rule.criteria.build(data, criteria, entryPoints)
          if (check) {
            Object.assign(descriptors[prop], data)
          } else {
            descriptors[prop].value = data
          }
        }
      }
    }
    return descriptors
  }

  /**
     * Assembling object properties.
     * Methods and reactive properties will be executed in the sandbox (shell function).
     * @param {object|function} object An object whose properties will be collected in the sandbox.
     * @param { object } [rules]
     * @returns { Array } properties names
     */
  static buildObjects (object, rules = {}, isStatic = false) {
    let descs = Descriptors.get(object)
    const builtProps = []
    descs = this.buildDescriptors(descs, rules, isStatic)
    Object.defineProperties(object, descs)
    return builtProps
  }

  /**
     * Assembling class properties.
     * Methods and reactive properties will be executed in the sandbox (shell function).
     * @param {function} ProtoClass
     * @param { InterfaceData } [rules]
     */
  static buildClass (ProtoClass, rules = new InterfaceData()) {
    if (this.isInterface(ProtoClass)) {
      return
    }
    const builtProps = {
      protoProps: [],
      staticProps: []
    }
    builtProps.protoProps = this.buildObjects(ProtoClass.prototype, rules.protoProps)
    builtProps.staticProps = this.buildObjects(ProtoClass, rules.staticProps, true)
  }

  /**
     *  Collects interface rules for a class if the class is not yet assembled, and collects class properties
     * @param {function} ProtoClass
     * @param {boolean} forceBuild
     * @returns {InterfaceData}
     */
  static buildInterface (ProtoClass, forceBuild = false) {
    const self = this
    const end_points = InterfaceData.getAllEndPoints()
    const recurs = function (ProtoClass) {
      const proto = ProtoClass.prototype
      if (end_points.includes(ProtoClass)) {
        return undefined
      }
      end_points.splice(end_points.length, 0, ...InterfaceData.getEndPoints(ProtoClass))
      if (InterfaceData.has(ProtoClass) && InterfaceData.get(ProtoClass).isBuilt && !forceBuild) {
        return InterfaceData.get(ProtoClass)
      }
      let rules = recurs(Object.getPrototypeOf(proto).constructor)
      rules = InterfaceRules.init(ProtoClass, rules)
      self.buildClass(ProtoClass, rules)
      const interfaceData = InterfaceData.get(ProtoClass)
      interfaceData.isBuilt = true
      return interfaceData
    }
    return recurs(ProtoClass)
  }

  /**
     * Extends the class with interfaces.
     * First, it sets inherited earlier the interfaces for the class, then sets the specified interfaces.
     * @param {function} ProtoClass
     * @param {...function} [RestInterfaces]
     * If the  RestInterfaces[0] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)
     */
  static extendAfter (ProtoClass, ...RestInterfaces) {
    let rules = this.buildInterface(ProtoClass)
    let isExtend = false
    if (typeof RestInterfaces[0] === 'boolean') {
      isExtend = RestInterfaces[0]
      RestInterfaces.splice(0, 1)
    }
    try {
      if (RestInterfaces.length > 0) {
        for (const Interface of RestInterfaces) {
          if (!rules.interfaces.includes(Interface)) {
            const rulesInterface = this.buildInterface(Interface)
            rules = InterfaceRules.add(ProtoClass, rulesInterface)
          }
        }
        rules = InterfaceData.get(ProtoClass)
        if (isExtend) {
          const staticProps = Object.getOwnPropertyNames(rules.staticProps)
          const protoProps = Object.getOwnPropertyNames(rules.protoProps)
          this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps)
        }
        this.buildClass(ProtoClass, rules)
      } else if (isExtend) {
        const staticProps = Object.getOwnPropertyNames(rules.staticProps)
        const protoProps = Object.getOwnPropertyNames(rules.protoProps)
        this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps)
        this.buildClass(ProtoClass, rules)
      }
    } catch (e) {
      if (e instanceof InterfaceError) {
        e.renderErrors()
      }
      throw e
    }
    return rules
  }

  /**
     * Extends the class with interfaces.
     * First,  sets the specified interfaces for the class, then  it sets inherited earlier the interfaces .
     * @param {function} ProtoClass
     * @param {...function} RestInterfaces
     * If the  RestInterfaces[0] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)
     * @returns {InterfaceData}
     */
  static extendBefore (ProtoClass, ...RestInterfaces) {
    const firstRules = this.buildInterface(ProtoClass)
    let isExtend = false
    if (typeof RestInterfaces[0] === 'boolean') {
      isExtend = RestInterfaces[0]
      RestInterfaces.splice(0, 1)
    }
    let rules = firstRules
    try {
      if (RestInterfaces.length > 0) {
        rules = new InterfaceData()
        rules.owner = ProtoClass
        for (const Interface of RestInterfaces) {
          if (!rules.interfaces.includes(Interface)) {
            const rulesInterface = this.buildInterface(Interface)
            rules = InterfaceRules.add(rules, rulesInterface)
          }
        }
        rules = InterfaceRules.add(rules, firstRules)
        InterfaceData.set(ProtoClass, rules)
        rules = InterfaceData.get(ProtoClass)
      }
      if (isExtend) {
        const staticProps = Object.getOwnPropertyNames(rules.staticProps)
        const protoProps = Object.getOwnPropertyNames(rules.protoProps)
        this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps)
      }
      if (RestInterfaces.length > 0 || isExtend) {
        this.buildClass(ProtoClass, rules)
      }
    } catch (e) {
      if (e instanceof InterfaceError) {
        e.renderErrors()
      }
      throw e
    }
    return rules
  }

  /**
     * Extends the class with interfaces.
     * If the current class is an interface then apply extendBefore. For a regular class applies extendAfter
     * @param {function} ProtoClass
     * @param {...function} RestInterfaces
     * If the  RestInterfaces[0] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)
     * @returns {InterfaceData}
     */
  static extend (ProtoClass, ...RestInterfaces) {
    if (InterfaceBuilder.isInterface(ProtoClass)) {
      return this.extendBefore(ProtoClass, ...RestInterfaces)
    }
    return this.extendAfter(ProtoClass, ...RestInterfaces)
  }

  /**
     * Implements Interfaces in the class
     * @param {function}ProtoClass
     * @param {...function|boolean} [RestInterfaces]
     * If the  RestInterfaces[0] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)

     */
  static implement (ProtoClass, ...RestInterfaces) {
    if (typeof ProtoClass !== 'function' || ProtoClass.prototype === undefined) {
      // ProtoClass = Object.getPrototypeOf(ProtoClass).constructor;
      throw Error('Bab argument')
    }
    if (this.isInterface(ProtoClass)) {
      const message = 'Cannot create instance from interface'
      const entryPoints = [ProtoClass.name]
      new InterfaceError('ImplementInterfaceError', { message, entryPoints }).throw()
    }
    const rules = this.extend(ProtoClass, ...RestInterfaces)
    InterfaceValidator.validateClass(ProtoClass, rules)
    return InterfaceData.get(ProtoClass)
  }

  /**
     * Forms its own properties based on prototypes.
     * If the property is not explicitly specified, but it exists in the prototype, it creates its own property based on the prototype descriptor.
     * @param ProtoClass The class in which the properties will be created.
     * @param {Array|undefined} extendProtoProps. List of properties for prototype. If not specified, then all properties of the inherited classes will be created.
     * @param {Array|undefined} extendStaticProps . List of static properties. If not specified, then all properties of the inherited classes will be created.
     */
  static extendOwnPropertiesFromPrototypes (ProtoClass, extendProtoProps, extendStaticProps) {
    const protoProps = Object.getOwnPropertyNames(ProtoClass.prototype)
    const staticProps = Object.getOwnPropertyNames(ProtoClass)
    let protoDescs = Descriptors.getAll(ProtoClass.prototype)
    protoDescs = this.extractOwnDescriptors(protoDescs)
    let writeDescs = {}
    if (extendProtoProps === undefined) {
      extendProtoProps = protoProps
    }
    extendProtoProps.forEach((prop, k) => {
      if (protoDescs[prop] !== undefined && !protoProps.includes(prop)) {
        writeDescs[prop] = protoDescs[prop]
      }
    })
    writeDescs = this.extractOwnDescriptors(writeDescs)
    Object.defineProperties(ProtoClass.prototype, writeDescs)

    const staticDescs = Descriptors.getAll(ProtoClass)
    writeDescs = {}
    if (extendStaticProps === undefined) {
      extendStaticProps = staticProps
    }
    extendStaticProps.forEach((prop, k) => {
      if (staticDescs[prop] !== undefined && !staticProps.includes(prop)) {
        writeDescs[prop] = staticDescs[prop]
      }
    })
    writeDescs = this.extractOwnDescriptors(writeDescs)
    Object.defineProperties(ProtoClass, writeDescs)
  }
}
InterfaceData.addGlobalEndPoints(InterfaceBuilder)
