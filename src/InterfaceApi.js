/**
 * @module @alexeyp0708/interface-manager
 */

import { InterfaceBuilder, InterfaceData, InterfaceFuncBuilder, MirrorInterface } from './export.js'

export class InterfaceApi {
  static extend (ProtoClass, ...RestInterfaces) {
    return InterfaceBuilder.extend(ProtoClass, ...RestInterfaces)
  }

  static extendBefore (ProtoClass, ...RestInterfaces) {
    return InterfaceBuilder.extendBefore(ProtoClass, ...RestInterfaces)
  }

  static extendAfter (ProtoClass, ...RestInterfaces) {
    return InterfaceBuilder.extendAfter(ProtoClass, ...RestInterfaces)
  }

  /* static extendsFuncInterface(ProtoClass, ...RestInterfaces){
        return InterfaceFuncBuilder.extend(ProtoClass, ...RestInterfaces);
    } */
  static implement (ProtoClass, ...RestInterfaces) {
    return InterfaceBuilder.implement(ProtoClass, ...RestInterfaces)
  }

  static addGlobalEndPoints (...points) {
    return InterfaceData.addGlobalEndPoints(...points)
  }

  static setEndPoints (ProtoClass, ...points) {
    return InterfaceData.setEndPoints(ProtoClass, ...points)
  }

  static getEndPoints (ProtoClass) {
    return InterfaceData.getEndPoints(ProtoClass)
  }

  static getAllEndPoints (ProtoClass = undefined) {
    return InterfaceData.getAllEndPoints(ProtoClass)
  }

  static instanceOfInterface (object, Interface) {
    return InterfaceData.instanceOfInterface(object, Interface)
  }
}

export function iObject (rules) {
  return MirrorInterface.createInterface(undefined, rules)
}
export function iCall (args, rtrn) {
  const func = {
    '': function () {
      return {
        arguments: args,
        return: rtrn
      }
    }
  }['']
  func.isInterface = true
  return InterfaceApi.extendsFuncInterface(func)
}
InterfaceData.addGlobalEndPoints(InterfaceApi, iObject, iCall)
