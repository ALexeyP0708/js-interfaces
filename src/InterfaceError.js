/**
 *
 */
export let count =0
export class InterfaceError extends Error {
  static #types={}
  #type='default'
  
  #errors=[]
  
  #vars={}
  
  #entryPoints=[]
  
  #stack
  
  #message
  
  #cacheMessage
  
  //#constructorArgs
  static #console=console;
  
  constructor(message,fileName,lineNumber) {
    super();
    //this.#constructorArgs=args;
    this.#message=message;
    this.#stack=this.stack;
    Object.defineProperties(this,{
      message:{
        get:()=>{
          return this.getMessage(this.getType(),true,true)
        }
      },
      stack:{
        get:()=>{
          return this.message+'\n'+this.getStack()
        },
        set:(v)=>{
          this.setStack(v)
        }
      }
    })
  }
  
  /**
   * 
   * @param {string} type
   * @returns {InterfaceError}
   */
  setType(type){
    this.#type=type
    return this 
  }

  /**
   * 
   * @returns {string}
   */
  getType(){
    return this.#type
  }

  /**
   * 
   * @param {Array.<string>}entryPoints
   */
  setEntryPoints(entryPoints){
    this.#entryPoints=Object.assign([],entryPoints)
    return this;
  }
  
  getEntryPoints(){
    return Object.assign([],this.#entryPoints??[])
  }

  /**
   * 
   * @param {string} point
   * @returns {InterfaceError}
   */
  addEntryPoint(point){
    this.#entryPoints.push(point);
    return this
  }
  /**
   * 
   * @param {object} vars
   * @returns {InterfaceError|Error}
   */
  setVars(vars){
    this.#vars=Object.assign(this.#vars,vars);
    return this
  }
  
  getVars() {
    return Object.assign({}, this.#vars ?? {})
  }

  /**
   * 
   * @param {Array.<InterfaceError|Error|string>} errors
   * @returns {InterfaceError}
   */  
  setErrors(errors){
    this.#errors=Object.assign([],errors)
    return this
  }

  /**
   * 
   * @returns {*[]}
   */
  getErrors(){
    return Object.assign([],this.#errors??[])
  }

  /**
   * 
   * @param {Error|string} error
   * @returns {InterfaceError}
   */
  addError(error){
    this.#errors.push(error)
    return this
  }
/*  setStack(){
    
  }*/
  getStack(){
    return this.#stack
  }
  
  setStack (stack){
    this.#stack=stack;
    return this
  }

  /**
   * See Error.captureStackTrace
   * Overridden because Error.captureStackTrace overrides targetObject.stack property descriptors rather than directly overwriting. So getters and setters won't work
   * @param {object} targetObject
   * @param {function} constructorOpt
   * @returns {InterfaceError}
   */
/*  static captureStackTrace(targetObject,constructorOpt ){
    let bufObj={};
    super.captureStackTrace(bufObj,constructorOpt);
    targetObject.stack=bufObj.stack;
    return this;
  }*/
  /** 
   *
   * @param {Array} errors
   * @param {boolean} checkCache - determines whether to query child error messages from the cache or generate messages again
   */
  static #getErrorsMessage(errors,checkCache=true){
    const result = []
    const tab='  ';
    for (let k = 0; k < errors.length; k++) {
      result.push(errors[k])
      if (errors[k] instanceof InterfaceError) {
        result[k] = errors[k].getMessage(errors[k].getType(),true,checkCache)
      } else
      if (errors[k] instanceof Error) {
        result[k] = errors[k].message
      } else if(typeof errors[k] === 'string'){
        result[k] = errors[k]
      }
      result[k] = result[k].replace(/[\n]/ig, `\n${tab}`)
    }
    return `\n${tab}` + result.join(`\n${tab}`)
  }
  
  /**
   * Reads or writes the error type
   * If you pass the message parameter, it will create an error type with the given message.
   * If the message is of type undefined or not passed, then return messages of type error (return result)
   * @param {string} type  Error type
   * @param {undefined|null|string} [message] Error Message Template  undefined type - get message, string type - set message, null type - unset message  
   * @returns {string|undefined|boolean} 
   */
  static types(type,message){
    switch (message){
      case undefined:
        switch (this.#types[type]){
          case undefined:
            type='default'
          default:
            if(this.#types[type]===undefined) throw new Error('Missing "default" type message template')
            return this.#types[type]
            break
        }
        break
      case null:
        return delete this.#types[type];
        break;
      default:
        if(typeof message !== 'string'){
          throw Error('Argument message must be string type.');
        }
        this.#types[type]=message
    }
  }

  /**
   *
   * @param {string} type Message type
   * @param {{entryPoints:[]|string,errors:[]|string,message:string,type:string,stack:string}} [vars] Message Variables
   * @param {boolean} [deep=false]
   * @param {boolean} [checkCache=true]  - determines whether to query child error messages from the cache or generate messages again
   * @returns {string} return Error message
   */
  static getMessage(type,vars={},deep=false,checkCache=true){
    vars=Object.assign({},vars)

    let tpl = InterfaceError.types(type);
    const pattern_vars = Object.keys(vars).join('|')
    vars.entryPoints=vars.entryPoints??'';
    if (vars.entryPoints instanceof Array) {
      if(vars.entryPoints.length>0){
        vars.entryPoints = '[' + vars.entryPoints.join('][') + ']' 
      } else {
        vars.entryPoints = ''
      }
    }
    if(vars.errors instanceof Array){
      if(deep && vars.errors.length>0){
        vars.errors = this.#getErrorsMessage(vars.errors,checkCache)
      } else {
        vars.errors =''  
      }
    }
    if (pattern_vars !== '') {
      // let pattern =new RegExp('\\${('+pattern_vars+')}','ig');
      const pattern = new RegExp('{\\$([\\w]+)}', 'ig')
      return tpl.replace(pattern, (match, p1) => {
        if (p1 in vars && vars[p1]!==undefined) {
          return vars[p1]
        }
        return '' //`{$${p1}}`
      })
    } else {
      return tpl;
    }
  }
  
  /**
   * 
   * @param type
   * @param {boolean} [deep=false] Will print child errors
   * @param {boolean} [checkCache=true]  - determines whether to query child error messages from the cache or generate messages again
   * @returns {*}
   */
  getMessage(type=undefined,deep=false,checkCache=true){
    if (checkCache){
      if(type===undefined){
        //throw Error('The "type" argument must be set if the argument checkCache===true');
        type=this.getType()
      }
      if(this.#cacheMessage!==undefined){
        return this.#cacheMessage
      }
    }
    let vars = this.#getMessageVars()
    let SelfClass=Object.getPrototypeOf(this).constructor
    this.#cacheMessage=SelfClass.getMessage(type??vars.type,vars,deep,checkCache)
    return this.#cacheMessage
  }

  /**
   * 
   * @returns {{entryPoints:[],errors:[],message:string,type:string,stack:string}}
   */
  #getMessageVars(){
    const vars = this.getVars()
    vars.entryPoints = this.getEntryPoints()
    vars.errors = this.getErrors()
    vars.message=vars.message??this.#message
    vars.type=this.getType()
    vars.stack=this.getStack()
    return vars;
  }
  
  /**
   * Starts an error handler
   */
  handler(typeMsg='error'){
    this.#consoleRender(typeMsg);
  }
  
  #consoleRender(typeMsg = 'warn')
  {
    const errors=this.#errors??[]
    const levels = []
    let SelfClass=Object.getPrototypeOf(this).constructor
    let cnsl = SelfClass.getConsole()
    // open core group in console
    let msg = SelfClass.getMessage('consoleGroup',{type:this.#type,message:this.#message},false)
    cnsl.groupCollapsed(`%c ${msg}`, 'background:#FFF0F0;color:#FF3434;')
    // write core message this error
    msg = this.getMessage(this.getType(),false)
    msg = SelfClass.getMessage('consoleMessage',{message:msg,stack:this.getStack()},false)
    cnsl[typeMsg](msg)
    // child error handling
    for (let key = 0; key < errors.length; key++) {
      const error = errors[key]
      // open group in for child error
      let msgGroup,msgBody,stack,typeGroup,msg
      if (error instanceof InterfaceError) {
        typeGroup=error.getType()
        msgBody = error.getMessage(this.getType(),false)
        stack=error.getStack()
        const childErrors=error.getErrors()
        if(childErrors.length>0){
          msgGroup = SelfClass.getMessage('consoleGroup', {type:typeGroup},false)
          cnsl.groupCollapsed(`%c ${msgGroup}`, 'background:#FFF0F0;color:#FF3434;')
          levels.push(key)// [~0+2,1~,2~,3+2~,4~,5~]
          errors.splice(key + 1, 0, ...childErrors)
          for (let z = 0; z < levels.length; z++) {
            levels[z] = levels[z] + childErrors.length
          }
        }
      } else if(error instanceof Error){
        typeGroup=error.name??Object.getPrototypeOf(error).constructor.name
        msgBody = error.message
        stack=error.stack
      } else {
        typeGroup='NO_TYPE'
        msgBody=error
        stack=''
      }
      // write message in console for child error
      msg = SelfClass.getMessage('consoleMessage',{message:msgBody,stack:stack},false)
      cnsl[typeMsg](msg)
      // close childs groups 
      if (!(error instanceof InterfaceError) || error.getErrors().length===0) {
        while (levels[levels.length - 1] === key) {
          cnsl.groupEnd()
          levels.splice(levels.length - 1, 1)
        }  
      }
    }
    // close core groups
    cnsl.groupEnd()
  }
  static #handlerHook
  /**
   * Sets a hook to run an error handler for uncaught errors
   * sets an error handler globally
   */
  static setHandlerHook(){
    let SelfClass=this;
    if(this.isServer()){
      if(this.#handlerHook){
        globalThis.process.removeListener('uncaughtExceptionMonitor',this.#handlerHook)
      }
      this.#handlerHook=(err) => {
        if (err instanceof SelfClass) {
          globalThis.process.once('uncaughtException', (error) => {
            error.handler();
          })
        }
      }
      globalThis.process.on('uncaughtExceptionMonitor',this.#handlerHook)

    } else {
      let self=this.isWorker()?WorkerGlobalScope:globalThis;
      if(this.#handlerHook){
        self.removeEventListener('error',this.#handlerHook)
      } 
      this.#handlerHook=(event)=>{
        if(event.error instanceof SelfClass){
          event.error.handler();
          event.preventDefault();
        }
      }
      self.addEventListener('error',this.#handlerHook)
    }
  }
  static getConsole(){
    return this.#console;
  }
  
  static setConsole(console){
    this.#console=console;
    return this;
  }
  
  static isWorker(){
    return typeof WorkerGlobalScope !== 'undefined' && globalThis instanceof WorkerGlobalScope
  }
  
  static isBrowser(){
       return Boolean(typeof globalThis.window !=='undefined' && globalThis.navigator && globalThis.navigator.userAgent)
  }
  
  static isServer () {
    return  Boolean(globalThis.process?.versions?.node)
  }

  static _t_member(member_name, ...args) {
    let member=eval(`this.${member_name}`)
    if(typeof member === 'function'){
      if(/^(?:function[\s]*\(|\(?[\w,]*\)?\s*=>)/i.test(member.toString())){
        return member;
      }
      return member.call(this,...args);
    } else {
      return member;
    }
  }  
  _t_member(member_name, ...args) {
    let member=eval(`this.${member_name}`)
    if(typeof member === 'function'){
      if(/^(?:function[\s]*\(|\(?[\w,]*\)?\s*=>)/i.test(member.toString())){
        return member;
      }
      return member.call(this,...args);
    } else {
      return member;
    }
  }
}

Object.defineProperty(InterfaceError.prototype, 'name', {
  enumerable: false,
  value: 'InterfaceError'
})
