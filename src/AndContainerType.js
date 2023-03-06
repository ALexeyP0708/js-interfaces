import {IType} from "./IType.js";
import {CTypes} from "./CTypes.js";

export class AndContainerType extends IType {
  #types
  #types_string
  constructor(container) {
    super();
    AndContainerType.#validateContainer(container)
    // set container
    this.#types=container
  }
  static #validateContainer(container){
    CTypes.validateTypes(container)
  }

  /**
   * 
   * @param data
   * @return {boolean}
   */
  validate(data) {
    let check=true  
    for(const type of this.#types){
      check=CTypes.isValidateData(data,type)
      if (!check) {break;}
    }
    return check;
  }

  /**
   * 
   * @param {AndContainerType} type must be only ContainerType type. 
   * @param method
   * @return {boolean}
   */
  compare(type, method = 'strict') {
    return CTypes.compareTypes(this.getTypes(),type.getTypes())
  }
  toString() {
    if(this.#types_string){
      return this.#types_string
    }
    //const SelfClass=Object.getPrototypeOf(this).constructor
    this.#types_string = `[${CTypes.typesString(this.#types)}]`
    return this.#types_string
  }
  getTypes(){
    return Object.assign([],this.#types)
  }
}
  
  

