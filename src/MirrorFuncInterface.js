/**
 * @module @alexeyp0708/interface-manager
 */

import { CriteriaMethodType, PropertyCriteria, InterfaceBuilder, InterfaceFuncBuilder } from './export.js'

export class MirrorFuncInterface {
  static createInterface (NewFunc, args, rtrn) {
    const tc = typeof NewFunc
    let criteria = {}
    if (args !== undefined) {
      criteria = CriteriaMethodType.formatToObject(args)
    }
    if (rtrn !== undefined) {
      criteria.return = PropertyCriteria.formatToObject(rtrn)
    }
    if (tc === undefined) {
      [NewFunc] = [function () { return criteria }]
    } else
    if (tc === 'string') {
      NewFunc = { [NewFunc]: function () { return criteria } }[NewFunc]
    } else {
      throw Error('Invalid parameter type')
    }
    Object.setPrototypeOf(NewFunc, MirrorFuncInterface)
    NewFunc.isInterface = true
    InterfaceFuncBuilder.extendInterfaces(NewFunc)
  }

  build (call, ...Interfaces) {
    return InterfaceFuncBuilder.extendInterfaces(call, ...Interfaces)
  }
};
