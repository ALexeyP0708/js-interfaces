/**
 * @module @alexeyp0708/interface-manager
 */

import {
  CriteriaMethodType,
  InterfaceData,
  InterfaceBuilder, InterfaceError
} from './export.js'

export class InterfaceFuncBuilder {
  static generateRules (Func) {
    let rules = InterfaceData.get(Func)
    const entryPoints = []
    if (rules === undefined) {
      if (InterfaceBuilder.isInterface(Func)) {
        rules = new InterfaceData(Func)
        entryPoints.push(Func.name)
        let criteria = Func.call({})
        criteria = CriteriaMethodType.formatToObject(criteria)
        if (criteria.options === undefined) {
          criteria.options = {}
        }
        criteria.options = Object.assign({}, criteria.options, {
          entryPoints,
          owner: Func
        })
        criteria = new CriteriaMethodType(criteria)
        rules.ownRules = [{ criteria }]
        rules.interfaces.push(Func)
        Func.isFuncInterface = true
      } else {
        rules = new InterfaceData()
      }
    }
    return rules
  }

  /**
     *
     * @param Func
     * @param {InterfaceData} rules
     */
  static addRules (Func, rules, entryPoints = []) {
    let interfaceData
    if (Func instanceof InterfaceData) {
      interfaceData = Func
    } else {
      interfaceData = InterfaceData.get(Func)
      entryPoints = [Func.name]
    }
    const equal_rule = rules.ownRules[0]
    if (equal_rule !== undefined) {
      const equal_criteria = equal_rule.criteria
      if (interfaceData.ownRules.length > 0 && interfaceData.ownRules[0].criteria !== undefined) {
        const criteria = interfaceData.ownRules[0].criteria
        entryPoints = entryPoints.concat([`~${criteria.getOwner().name}~`, `~${equal_criteria.getOwner().name}~`])
        criteria.compare(equal_criteria, entryPoints)
      }
      interfaceData.ownRules = [equal_rule]
    }
    if (rules.interfaces.length > 0) {
      for (const val of rules.interfaces) {
        if (!interfaceData.interfaces.includes(val)) {
          interfaceData.interfaces.push(val)
        }
      }
    }
  }

  static buildFunc (Func, criteria) {
    if (InterfaceBuilder.isInterface(Func)) {
      return Func
    }
    const entryPoints = [Func.name]
    return InterfaceBuilder.generateSandbox(Func, criteria, entryPoints)
  }

  static extendsInterfaces (Func, ...RestInterfaces) {
    const rules = this.generateRules(Func)
    let sandbox
    try {
      for (const iface of RestInterfaces) {
        const interfaceData = this.generateRules(iface)
        this.addRules(rules, interfaceData, [Func.name])
      };
      sandbox = this.buildFunc(Func, rules.ownRules[0].criteria)
    } catch (e) {
      if (e instanceof InterfaceError) {
        e.renderErrors()
      }
      throw e
    }
    InterfaceData.set(sandbox, rules)

    return sandbox
  };
};
