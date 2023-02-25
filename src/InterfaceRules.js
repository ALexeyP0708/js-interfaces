/**
 * @module @alexeyp0708/interface-manager
 */

import {
  interfaceData,
  InterfaceData,
  CriteriaType,
  CriteriaReactType,
  CriteriaMethodType,
  PropertyCriteria,
  Descriptors,
  InterfaceBuilder, InterfaceError
} from './export.js'

/**
 * class of static methods.
 * collects rules in classes marked as interfaces, and clears interfaces from set members
 */
export class InterfaceRules {
  static generateForDescriptors (descriptors, isStatic = false) {
    const rules = {}
    const prefix = isStatic ? '.' : '#'
    for (const prop of Object.getOwnPropertyNames(descriptors)) {
      const desc = descriptors[prop]
      const entryPoints = [`~${descriptors[prop].constructor.name}~`, `${prefix}${prop}`]
      if ('get' in desc || 'set' in desc) {
        let getCriteria
        if (desc.get !== undefined) {
          getCriteria = desc.get()
        }
        let setCriteria
        if (desc.set !== undefined) {
          const rtrn = {}
          setCriteria = desc.set(rtrn)
          setCriteria = setCriteria ?? rtrn
        }
        let criteria = {
          get: getCriteria,
          set: setCriteria
        }
        criteria = CriteriaReactType.generateObject(criteria, descriptors[prop].constructor, entryPoints)
        rules[prop] = [{ criteria }]
      } else if (typeof desc.value === 'function' && desc.value.prototype === undefined) {
        let criteria = desc.value()
        criteria = CriteriaMethodType.generateObject(criteria, descriptors[prop].constructor, entryPoints)
        rules[prop] = [{ criteria }]
      } else {
        let criteria = desc.value
        criteria = PropertyCriteria.generateObject(criteria, descriptors[prop].constructor, entryPoints)
        rules[prop] = [{ criteria }]
      }
    }
    return rules
  }

  /**
     *  Generates interface rules from properties of the Class that is the interface.
     * @param {function} ProtoClass The class for which the rules are generated
     * @returns {InterfaceData}
     */
  static generate (ProtoClass) {
    const rules = new InterfaceData()
    const proto = ProtoClass.prototype
    // if (ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface) {
    const descriptors = Descriptors.get(proto)
    rules.protoProps = this.generateForDescriptors(descriptors)
    const staticDescriptors = Descriptors.get(ProtoClass)
    rules.staticProps = this.generateForDescriptors(staticDescriptors, true)
    rules.interfaces.push(ProtoClass)
    // }
    return rules
  }

  /**
     *  Adds / extends interface rules for Class.
     * @param {function|InterfaceData} ProtoClass
     * @param  {InterfaceData} [rules]
     * @return {InterfaceData}
     */
  static add (ProtoClass, rules = new InterfaceData()) {
    let interfaceData
    if (ProtoClass instanceof InterfaceData) {
      interfaceData = ProtoClass
    } else
    if (typeof ProtoClass === 'function') {
      interfaceData = InterfaceData.init(ProtoClass)
    } else {
      throw new Error('argument 1 must be type {function|InterfaceData}')
    }

    const entryPoints = [interfaceData.owner.name]
    for (const prop of Object.getOwnPropertyNames(rules.protoProps)) {
      const equal_rule = rules.protoProps[prop][0]
      const equal_criteria = equal_rule.criteria
      if (prop in rules) {
        const criteria = interfaceData.protoProps[prop][0].criteria
        const ep = entryPoints.concat([`~${criteria.getOwner().name}~`, `~${equal_criteria.getOwner().name}~`])
        criteria.compare(equal_criteria, ep)
      }
      interfaceData.protoProps[prop] = [equal_rule]
    }
    for (const prop of Object.getOwnPropertyNames(rules.staticProps)) {
      const equal_rule = rules.staticProps[prop][0]
      const equal_criteria = equal_rule.criteria
      if (prop in rules) {
        const criteria = interfaceData.staticProps[prop][0].criteria
        const ep = entryPoints.concat([`~${criteria.getOwner().name}~`, `~${equal_criteria.getOwner().name}~`])
        criteria.compare(equal_criteria, ep)
      }
      interfaceData.staticProps[prop] = [equal_rule]
    }
    for (const val of rules.interfaces) {
      if (!interfaceData.interfaces.includes(val)) {
        interfaceData.interfaces.push(val)
      }
    }
    return interfaceData
  }

  /**
     * sets the interface rules for the class, if the class is an interface, it will generate and combine the rules.
     * @param {function} ProtoClass
     * @param {InterfaceData} [rules]
     * @returns {InterfaceData} new rules
     */
  static init (ProtoClass, rules) {
    let interfaceData = this.add(ProtoClass, rules)
    if (InterfaceBuilder.isInterface(ProtoClass) && !interfaceData.interfaces.includes(ProtoClass)) {
      // if(!interfaceData.interfaces.includes(ProtoClass)){
      rules = this.generate(ProtoClass)
      interfaceData = this.add(ProtoClass, rules)
      this.clearInterface(ProtoClass)
      // }
    }
    return interfaceData
  }

  /**
     * Clears a class that is an interface from properties.
     * @param {function} ProtoClass The class to be cleaned
     */
  static clearInterface (ProtoClass) {
    const proto = ProtoClass.prototype
    if (InterfaceBuilder.isInterface(ProtoClass)) {
      for (const prop of Object.getOwnPropertyNames(proto)) {
        if (prop === 'constructor') {
          continue
        }
        delete proto[prop]
      }
      for (const prop of Object.getOwnPropertyNames(ProtoClass)) {
        if (['length', 'name', 'prototype', 'isInterface', interfaceData].includes(prop)) {
          continue
        }
        delete ProtoClass[prop]
      }
    }
  }
}
InterfaceData.addGlobalEndPoints(InterfaceRules)
