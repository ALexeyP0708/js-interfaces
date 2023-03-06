import {IType} from "./IType.js";
import {CTypes} from "./CTypes.js";

export class ContainerType extends IType {
  #types
  constructor(container) {
    super();
    ContainerType.#validateContainer(container)
    // set container
    this.#types=container
  }
  static #validateContainer(container){
    CTypes.validateTypes(container)
  }

  /**
   * 
   * @param value
   * @return {boolean}
   */
  validate(value) {
    let check=true  
    for(const type of this.#types){
      check=this.isValidateData(data,type)
      if (!check) {break;}
    }
    return check;
  }
  compare(type, method = 'strict') {

  }
  toString() {
    if(this.#types_string){
      return this.#types_string
    }
    //const SelfClass=Object.getPrototypeOf(this).constructor
    this.#types_string = CTypes.typesString(this.#types)
    return `[${this.#types_string}]`
  }
}
  
  

