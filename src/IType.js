/**
 * @abstract
 */
export class IType {
  /**
   * @abstract
   * @param {} type In reality, the type passed in implements the {IType}. Type not specified, for IDE.
   * Will always match the type of the implemented class.
   * If the wrong type comes in, then this is an internal error and should be reported to the developer
   * @param {string} [method='strict'] strict|restrict|expand
   * @return {boolean}
   */
  compare (type,method='strict'){
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.compare method not implemented.`)
  }


  /**
   * @abstract
   * @param {*} value
   * @return {boolean}
   */
  validate (value){
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.validate method not implemented.`)
  }

  /**
   * @abstract
   */
  toString(){
    throw new Error(`${Object.getPrototypeOf(this).constructor.name}.toString method not implemented.`)
  }
  /*

  getIntersect(type){
    return false
    //throw new Error(`${Object.getPrototypeOf(this).constructor.name}.getIntersect method not implemented.`)
  }
  
  /!**
   * @param {IType} type
   * @return {boolean|IType}
   *!/
  merge(type){
    return false
    //throw new Error(`${Object.getPrototypeOf(this).constructor.name}.merge method not implemented.`)
  }*/

}