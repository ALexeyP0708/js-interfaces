import {InterfaceError} from "./InterfaceError.js";

/**
 * Defines interface types
 */
export class CTypes{
  /**
   * 
   * @param {Array} types
   */
  #types_list=[
    'null', 'undefined', 'object', 'boolean', 'number', 'string', 'symbol', 'function', 'mixed'
  ];
  constructor(types){
    if (!Array.isArray(types)) {
      throw new InterfaceError('InitTypes', { message: 'Array expected. Example:{types:["string","number"]}' })
    }
    types = Object.assign([], types)
    const errors = []
    for (let k = 0; k < types.length; k++) {
      if (types[k] === null) {
        types[k] = 'null'
      } else
      if (types[k] === undefined) {
        types[k] = 'undefined'
      }
      const entryPoints = [`types[${k}]`]
      const tt = typeof types[k]
      if (!(['function', 'object'].includes(tt) || tt === 'string' && ['null', 'undefined', 'object', 'boolean', 'number', 'string', 'symbol', 'function', 'mixed'].includes(types[k]))) {
        const error = new InterfaceError('InitTypes_badType', { entryPoints, dataType: types[k].toString(), className: Object.getPrototypeOf(this).constructor.name })
        errors.push(error)
      }
    }
    if (errors.length > 0) {
      throw new InterfaceError('InitTypes', { entryPoints, errors })
    }
  }
}