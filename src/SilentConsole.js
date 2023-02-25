
//import { InterfaceData } from './InterfaceData.js'

/**
 * @deprecated
 * Denies and allows displaying messages to the console.
    @prop {Array} props methods in the console that need to be controlled
    @props {Array} console the place where the console methods are stored
    @props {Array} plugs plugs for console methods
 */
export class SilentConsole {
  #console
  #props
  #plugs={
    stack:[]
  }
  #memoryStack=[]
  /**
     * @param {object|console} console object to be observed. as a rule, this is an object that implements console methods.
     * By default, this is a console dedicated to interfaces
     */
  constructor (console) {
    this.#console = Object.create(console)
    this.#props = Object.keys(console)
  }

  clearStack (props = undefined) {
    props=props??this.#props
    if (Array.isArray(props)) {
      for (let key = 0; key < this.#memoryStack.length; key++) {
        if (props.includes(this.#memoryStack[key][0])) {
          this.#memoryStack.splice(key, 1)
          key--
        }
      }
    } else {
      this.#memoryStack = []
    }
  }

  /**
   * 
   * @param {string} prop
   * @returns {boolean}
   */
  isDenied (prop) {
    const pull = Object.keys(this.#console)
    if (!pull.includes(prop)) {
      return false
    }
  }

  /**
   * Prevent messages from being displayed in the console.
   * @param remember if true, then it will remember messages that are displayed through the console.
   * @param {string[]} [props]
   */
  denyToSpeak (remember = false, props = undefined) {
    const console = this.#console
    props = props ?? this.#props
    const plug = function () {}
    if (remember) {
      for (const prop of props) {
        console[prop] = (...args) => {
          this.#memoryStack.push([prop, args])
        }
      }
    } else {
      for (const prop of props) {
        console[prop] = plug
      }
    }
  }

  /**
     * allow displaying messages in the console
     * @param {boolean} display if true, it will display  the messages that were remembered earlier.
     * @param {string[]} props 
     */
  allowToSpeak (display = false, props = undefined) {
    const console = this.#console
    props = props ?? this.#props
    for (const prop of props) {
      delete console[prop]
    }
    if (display) {
      for (let k = 0; k < this.#memoryStack.length; k++) {
        const data = this.#memoryStack[k]
        if (props.includes(data[0])) {
          console[data[0]](...data[1])
          this.#memoryStack.splice(k, 1)
          k--
        }
      }
    }
  }
  getConsole(){
    return this.#console
  }
}

//InterfaceData.addGlobalEndPoints(SilentConsole)
