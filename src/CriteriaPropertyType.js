/**
 * @module @alexeyp0708/interface-manager
 */

import {
    InterfaceError,
    MirrorInterface,
    MirrorFuncInterface,
    CriteriaType,
    InterfaceData, CriteriaMethodType
} from "./export.js";

/**
 *  An instance of the CriteriaMethodType class stores the criteria for a property and manages criteria.  
 *  Describes class properties, class method arguments, class method return value, reactive properties.
 *  @prop {string[]|object[]|function[]} types  the set of types to which the value must match
  *  ```js
 *  [
 *       'mixed' // Any type
 *       'number', // type number 
 *       'string', // type string 
 *       'boolean', // type bool
 *       'symbol', // type symbol
 *       'function', // type function
 *        null, // type null
 *        undefined, // type undefined
 *        {name:'hello'}, //  implements the given instance as a prototype (Object.create (object))
 *        class AnyClass{}, // inherited  the AnyClass class
 *        class Mirror extends MirrorInterface{}, //to check for compliance of any object/class with the Mirror interface
 *  ]
 *  ```
 *  
 *  @prop {Array} includes  sets a set of values ​​that the input parameters must match
 *  Example:
 *  ```js
 *  [
 *      1, //the value must match 1 (number type)
 *      '2', //the value must match '2' (string type)
 *      true, //the value must match true (bool type)
 *      Symbol.for('hello'), //the value must match  Symbol.for('hello') (symbol type)
 *      function(){}, // the value must match a specific function (function type)
 *      class A {}, // if the value being compared is an object or function, then it must belong to class A, 
 *      {name:hello} // if the value being compared is an object,then it must implements  this object as a prototype (Object.create({name:hello})),
 *      null, // the value must match null
 *      undefined // the value must match undefined
 *  ]
 *  ```
 *  @prop {Array} excludes sets the set of values ​​that the input parameters must not match
 *  ```js
 *  [
 *      1, //the value not must match 1 (number type)
 *      '2', //the value not must match '2' (string type)
 *      true, //the value not must match true (bool type)
 *      Symbol.for('hello'), //the value not must match  Symbol.for('hello') (symbol type)
 *      function(){}, // the value not must match a specific function (function type)
 *      class A {}, // if the value being compared is an object or function, then it not must belong to class A
 *      {name:hello} // if the value being compared is an object,then it not must implements  this object as a prototype (Object.create({name:hello})),
 *      null, // the value not must match null
 *      undefined // the value not must match undefined
 *  ]
 *  ```
 * @prop {object} options - settings for criteria
 * ```js
 * {
 *     options:{entryPoints:[],owner:''}
 * }
 * ```
 */
export class CriteriaPropertyType extends CriteriaType{
    /**
     * 
     * @param {object} criteria  Object with criteria. Must iterate object properties CriteriaPropertyType 
     * Example:
     *  ```js
     *  {
     *      types:[
     *          'mixed' 
     *          'number',
     *          'string',
     *          ],
     *      includes:[],
     *      excludes:[],
     *      options:{entryPoints:'MyPoint'}
     *  }
     *  ```
     * @throws {InterfaceError} 
     */
    constructor(criteria = {}) {
        super(criteria);
        Object.defineProperties(this, {
            types: {
                enumerable: true,
                configurable: true,
                writable: true,
                value: ['mixed'],
            },
            includes: {
                enumerable: true,
                configurable: true,
                writable: true,
                value: []
            },
            excludes: {
                enumerable: true,
                configurable: true,
                writable: true,
                value: []
            }
        });
        this.initTypes(criteria.types, this.options.entryPoints);
        let errors = [];
        try {
            this.initIncludes(criteria.includes, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        };
        try {
            this.initExcludes(criteria.excludes, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        };
        if (errors.length > 0) {
            //throw new InterfaceError('Init_BadIncludesOrExcludes', {entryPoints: this.options.entryPoints, errors});
            new InterfaceError('Init_BadIncludesOrExcludes', {entryPoints: this.options.entryPoints, errors}).throw(true);
        }
        //this.freeze();
    }
    
    /**
     * Define the data type of the property
     * @param {Array.<string|function|object|CriteriaType>} types 
     * if string, then null|undefined|object|boolean|number|string|symbol|function|mixed 
     * If a function is written in the shorthand type `() => {}`, it is considered the interface of the function and will call it.
     * @param {string[]} entryPoints Indicate where the method call came from

     */
    initTypes(types = ['mixed'], entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        if(!Array.isArray(types)){
            new InterfaceError('InitTypes',{message:'Array expected. Example:{types:["string","number"]}'}).throw();
        }
        types = Object.assign([], types);
        let errors = [];
        for (let k=0; k<types.length;k++) {
            if (types[k] === null) {
                types[k] = 'null';
            }
            if (types[k] === undefined) {
                types[k] = 'undefined';
            }
            let entryPoints = [`types[${k}]`];
            let tt = typeof types[k];
            if (!(['function','object'].includes(tt) || tt === 'string' && ['null', 'undefined', 'object', 'boolean', 'number', 'string', 'symbol', 'function', 'mixed'].includes(types[k]))) {
                let error = new InterfaceError('InitTypes_badType', {entryPoints,dataType:types[k].toString(), className:Object.getPrototypeOf(this).constructor.name});
                errors.push(error);
            }
        }
        if (errors.length > 0) {
             new InterfaceError('InitTypes', {entryPoints, errors}).throw();
        }
        this.types = types;
    }

    /**
     * Define what values the property should include  
     * Rules:  
     * -Must match the types of current criteria
     * @param {Array} values 
     * @param {Array} entryPoints  Indicate where the method call came from
     */
    initIncludes(values = [], entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        values = Object.assign([], values);
        let errors = [];
        for (let k in values) {
            let value = values[k];
            try {
                this.validateType(value, [`includes[${k}]`]);
            } catch (e) {
                if (e instanceof InterfaceError) {
                    errors.push(e);
                } else {
                    throw e;
                }
            }
        }
        if (errors.length > 0) {
            new InterfaceError('InitIncludes', {entryPoints,errors}).throw(true);
        }
        this.includes = values;
    }

    /**
     * Define what values the property should exclude  
     * Rules:  
     * -Must match the types of current criteria
     * @param {Array} values
     * @param {Array} entryPoints  Indicate where the method call came from
     */
    initExcludes(values = [], entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        values = Object.assign([], values);
        let errors = [];
        for (let k in values) {
            let value = values[k];
            try {
                this.validateType(value, [`excludes[${k}]`]);
            } catch (e) {
                if (e instanceof InterfaceError) {
                    errors.push(e);
                } else {
                    throw e;
                }
            }
        }
        if (errors.length > 0) {
            new InterfaceError('InitExcludes', {errors, entryPoints}).throw(true);
        }
        this.excludes = values;
    }

    /**
     * Validation of incoming parameters according to the established current criteria (object)  
     * @param value
     * @param entryPoints Indicate where the method call came from
     * @returns {{types:boolean|*,includes:boolean|*,excludes:boolean|*}}
     * If there are no exceptions will return the result of matches
     * @throws {InterfaceError} 
     */
    validate(value, entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        let result={
            types:false,
            includes:false,
            excludes:false
        };
        result.types=this.validateType(value, entryPoints);
        let errors = [];
        try {
            result.includes=this.validateInIncludes(value, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                //sc.allowToSpeak();
                throw e;
            }
        }
        try {
            result.excludes=this.validateInExcludes(value, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                //sc.allowToSpeak();
                throw e;
            }
        }
        //sc.allowToSpeak();
        if (errors.length > 0) {
            new InterfaceError('Validate', {entryPoints,errors}).throw(true);
        }
        return result;
    }


    /**
     * Validation of incoming parameters by data type according to current the criteria (object) 
     * Rules:  
     * - The type of the passed value must match the criteria of the current object.
     * - If a class or object is passed, then they must inherit Class or Interface or object  specified 
     * in the types of the current criteria
     * - If the criteria set an interface inheriting the MirrorInterface interface, 
     * then any object or class passed must meet the criteria set by this interface
     * @param value
     * @param {Array} entryPoints Indicate where the method call came from
     * @returns {boolean|*} Returns a match or false. If there are no exceptions and false, then the set is empty.
     * @throws {InterfaceError} 
     */
    validateType(value, entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        let tv = typeof value;
        let types_string = [];
        if (value === null) {
            tv = 'null'
        }
        let errors=[];
        let check = false;
        let result=false;
        for (let type of this.types) {
            let tt = typeof type;
            if(type === null){tt='null';}
            if (tt === 'string') {
                types_string.push(type);
            } else  if (tt === 'object') {
                if(type instanceof CriteriaMethodType){
                    types_string.push(`function`);
                } else if(type instanceof CriteriaPropertyType){
                    types_string.push(`[${type.types.toString()}]`);
                } else {
                    types_string.push(`[object ${Object.getPrototypeOf(type).constructor.name}]`);
                }
            } else {
                types_string.push(`[function ${type.name}]`);
            }
            if(['object','function'].includes(tv)){
                if(tt==='object' && type instanceof CriteriaType){
                    try {
                        result=type.validate(value, entryPoints);
                        result=result.types;
                        check = true;
                        break;
                    } catch (e) {
                        if (!(e instanceof InterfaceError)) {
                            throw e;
                        }
                        errors.push(e);
                    }
                } else
                if(tv==='function' && tt==='object' && this.instanceOf(type, MirrorInterface)){
                    
                    try {
                        result=type.validate(value,entryPoints);
                        check=true;
                        break;
                    } catch (e) {
                        if(! (e instanceof InterfaceError) || e.type!=='Validate_BadMirrorProperties'){
                            //sc.allowToSpeak();
                            throw e;
                        }
                        errors.push(e);
                    }
                } else if(tv==='function' && this.instanceOf(type,MirrorFuncInterface)){
                    // MirrorFuncInterface says that you need to collect a function for subsequent validation. \
                    // The assembly takes place in a non-given this method
                    result=type;
                    check=true;
                    break;
                } else if(value === type || this.instanceOf(value, type)){
                    result=type;
                    check=true;
                    break;
                }  
            } else
            if (
                tt === 'string' && (type === 'mixed' || tv === type)
            ) {
                result=type;
                check=true;
                break;
            }
        }
        //sc.allowToSpeak();
        if (!check) {
            if(tv==='object'){
                tv=`[object ${Object.getPrototypeOf(value).constructor.name}]`;
            } else if(tv==='function'){
                tv=`[function ${value.name}]`;
            }
            new InterfaceError('ValidateType', {entryPoints, expectedTypes:`[${types_string.join(',')}]`,definedType:tv,errors}).throw(true);
        }
        return result;
    }


    /**
     * Checks if a value is in an array or belongs to a Class or an object in the passed array of values  
     * @param value
     * @param {Array} equalValues
     * @returns {boolean|*} Returns a match or false. 
     */
    isIncludeInValues(value, equalValues = []) {
        let check = false;
        let result=false;
        for (let equal of equalValues) {
            let te = typeof equal;
            if (te === 'function' || te === 'object' && equal !== null) {
                if (this.instanceOf(value, equal)) {
                    result=equal;
                    check = true;
                    break;
                }
            } else if (value === equal) {
                result=equal;
                check = true;
                break;
            }
        }
        return result;
    }
    
    /**
     * Validation incoming parameters for compliance with the values ​​set in the "includes" criteria  
     * @param value
     * @param {Array} entryPoints Indicate where the method call came from
     * @returns {boolean|*} Returns a match or false. If there are no exceptions and false, then the set is empty.
     * @throws {InterfaceError} InterfaceError.type==='ValidateInIncludes' An exception will be thrown if there are no matches.
     */
    validateInIncludes(value, entryPoints = ['not_defined']) {
        let equalValues = this.includes;
        let result=false;
        if (equalValues.length > 0) {
            result=this.isIncludeInValues(value,equalValues);
            if (false===result) {
                //Does not match the values [${values}].
                switch (typeof value) {
                    case 'function':
                        value = `function ${value.name}`;
                        break;
                    case 'object':
                        if (value !== null) {
                            value = `object ${Object.getPrototypeOf(value).constructor.name}`
                        } else {
                            value = 'null';
                        }
                        break;
                }
                new InterfaceError('ValidateInIncludes', {entryPoints, value}).throw();
            }
        }
        return result;
    }

    /**
     * Validation incoming parameters for compliance with the values ​​set in the "excludes" criteria  
     * @param value
     * @param {Array} entryPoints Indicate where the method call came from
     * @returns {boolean|*} Returns a match or false. If there are no exceptions and false, then the set is empty.
     * @throws {InterfaceError} InterfaceError.type==='ValidateInExcludes' An exception will be thrown if there is a match.
     */
    validateInExcludes(value, entryPoints = ['not_defined']) {
        let equalValues = this.excludes;
        let result=false;
        if (equalValues.length > 0) {
            result=this.isIncludeInValues(value,equalValues);
            if (false!==result) {
                //Does not match the values [${values}].
                switch (typeof value) {
                    case 'function':
                        value = `function ${value.name}`;
                        break;
                    case 'object':
                        if (value !== null) {
                            value = `object ${Object.getPrototypeOf(value).constructor.name}`
                        } else {
                            value = 'null';

                        }
                        break;
                }
                new InterfaceError('ValidateInExcludes', {entryPoints, value}).throw();
            }
        }
        return result;
    }
    
    /**
     * expands the current object with new criteria  
     * @param {CriteriaPropertyType} criteria
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type==='BadCriteria'
     */
    expand(criteria, entryPoints = ['not_defined']) {
        if (!(criteria instanceof Object.getPrototypeOf(this).constructor)) {
            new InterfaceError('BadCriteria', {className:Object.getPrototypeOf(this).constructor.name, entryPoints}).throw();
        }
        if (!this.types.includes('mixed')) {
            for (let type of criteria.types) {
                if (!this.isIncludeInValues(type,this.types)) {
                    this.types.push(type);
                }
            }
        }
        for (let include of criteria.includes) {
            if (!this.isIncludeInValues(include,this.includes)) {
                this.includes.push(include);
            }
        }
        for (let exclude of criteria.excludes) {
            if (!this.isIncludeInValues(exclude,this.excludes)) {
                this.excludes.push(exclude);
            }
        }
    }

    /**
     * compare criteria with  criteria current object  
     * @param {CriteriaPropertyType} criteria
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError} 
     * @see [method .#compareType]
     * @see [method .#compareIncludes]
     * @see [method .#compareExcludes]
     */
    compare(criteria, entryPoints = ['not_defined']) {
        entryPoints=Object.assign([],entryPoints);
        if (!(criteria instanceof Object.getPrototypeOf(this).constructor)) {
            new InterfaceError('BadCriteria', {className:Object.getPrototypeOf(this).constructor.name, entryPoints}).throw() ;
        }
        this.compareType(criteria, entryPoints);
        let errors = [];
        try{
            this.compareIncludes(criteria, entryPoints);
        } catch(e){
            if(e instanceof InterfaceError){
               errors.push(e); 
            }
            else {
                //sc.allowToSpeak();
                throw e;
            }
        }
        try{
            this.compareExcludes(criteria, entryPoints);
        } catch(e){
            if(e instanceof InterfaceError){
                errors.push(e);
            }
            else {
                //sc.allowToSpeak();
                throw e;
            }
        }
        //sc.allowToSpeak();
        if (errors.length > 0) {
            new InterfaceError('Compare_badParams', {errors, entryPoints}).throw(true);
        }
    }

    /**
     * Сompares the criteria types of the interfaces.  
     * Rules:  
     * - Types restrict the Types of the current object.  
     * - If the current object is of type mixed, then no comparison is made;  
     * - The types of the compared object must be present in the types of the current object  
     * - The types of the object being compared that are a Class or an object must implement (inherit) types 
     * that are classes or objects of the current object.  
     * @param {CriteriaPropertyType} criteria
     * @param {Array}entryPoints  Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type===Compare_badType
     */
    compareType(criteria, entryPoints = ['not_defined']){
        let errors=[];
        if (!this.types.includes('mixed')) {
            if (criteria.types.length <= 0 && this.types.length > 0) {
                //let entryPoints = [`types`];
                new InterfaceError('Compare_emptyStack', {entryPoints:entryPoints.concat(['types']), name:'types'}).throw();
                //errors.push(error);
            } else {
                for (let k in criteria.types) {
                    let type = criteria.types[k];
                    let entryPoints = [`types[${k}]`];
                    let include=this.isIncludeInValues(type,this.types);
                    if(this.types.length>0 && false===include){
                        errors.push(new InterfaceError('Compare_ValidateInTypes', {entryPoints, value:type}));
                    }
                    if(include instanceof CriteriaType && type instanceof CriteriaType ){
                        try{
                            include.compare(type,entryPoints); 
                        } catch (e) {
                           if(e instanceof InterfaceError){
                               errors.push(e);
                           } else {
                               throw e;
                           }
                        }
                    }
                }
            }
        }
        if (errors.length > 0) {
            new InterfaceError('Compare_badTypes', {entryPoints, errors}).throw();
        }
    }

    /**
     * Compares an array of included values ​​from the passed criteria with the current criteria (object)  
     * Rules:  
     * -Inclusions restrict the Inclusions of the current object.  
     * -The includes of the compared object must be present in the includes of the current object  
     * -The includes of the object being compared that are a Class or an object must implement (inherit) the includes 
     * that are classes or objects of the current object.  
     * @param {CriteriaPropertyType} criteria
     * @param {Array} entryPoints  Indicate where the method call came from
     */
    compareIncludes(criteria, entryPoints = ['not_defined']){
        let errors=[];
        if (criteria.includes.length <= 0 && this.includes.length > 0) {
            let entryPoints = [`includes`];
            let error = new InterfaceError('Compare_emptyStack', {name:'includes', entryPoints});
            errors.push(error);
        } else {
            for (let k in criteria.includes) {
                let include = criteria.includes[k];
                let entryPoints = [`includes[${k}]`];
                if(this.includes.length>0 &&  false===this.isIncludeInValues(include,this.includes)){
                    errors.push(new InterfaceError('ValidateInIncludes', {entryPoints, value:include}));
                }  
            }
        }
        if (errors.length > 0) {
            new InterfaceError('Compare_badIncludes', {entryPoints, errors}).throw();
        }
    }

    /**
     * Compares the exclusions of the passed criteria with the exclusions of the current criteria (object).  
     * Rules:  
     * - the exceptions must extend the exceptions from the current criterion (object);  
     * - In the passed criteria, the exclusions must contain the exclusions of the current criteria (object)  
     * if the criteria by the types of the passed criteria allow this
     * -Exceptions from the passed object, which are a class or object, can be parents (prototypes) 
     * for exceptions that are classes or objects of the current object.  
     * @param {CriteriaPropertyType} criteria
     * @param  {Array} entryPoints  Indicate where the method call came from
     */

    compareExcludes(criteria, entryPoints = ['not_defined']){
        let errors=[];
        if (criteria.excludes.length <= 0 && this.excludes.length > 0) {
            let entryPoints = [`includes`];
            let error = new InterfaceError('Compare_emptyStack', {name:'excludes', entryPoints});
            errors.push(error);
        } else {
            for (let k in this.excludes) {
                let exclude = this.excludes[k];
                let entryPoints = [`excludes[${k}]`];
                if(criteria.excludes.length>0 && false===criteria.isIncludeInValues(exclude,criteria.excludes)){
                    try{
                        criteria.validateType(exclude,entryPoints);
                        errors.push(new InterfaceError('ValidateInExcludes', {entryPoints, value:exclude}));
                    }catch(e){
                        if(!(e instanceof InterfaceError) || e.type!=='ValidateType'){
                            throw e;
                        }
                    }
                }
            }
        }
        if (errors.length > 0) {
            new InterfaceError('Compare_badExcludes', {entryPoints, errors}).throw();
        }
    }
    
    /**
     * Checks if a value implements a specified interface / class / object  
     * @param value
     * @param EqualClass
     * @returns {boolean}
     */
    instanceOf(value, EqualClass) {
        let tv=typeof value;
        let te=typeof EqualClass;
        if(tv==='object' && value!== null || tv==='function'){
            return value === EqualClass
                || te==='function' && value instanceof EqualClass
                || EqualClass.isPrototypeOf(value)
                || this.instanceOfInterface(value, EqualClass)
        } else if(te==='function' && ['boolean','number','string','symbol'].includes(tv)){
            return Object.getPrototypeOf(value).constructor===EqualClass;
        }
        return false;
    }

    /**
     * Checks if a class / object implements an interface  
     * @param {object|function} value
     * @param {function} EqualClass
     * @returns {boolean}
     */

    instanceOfInterface(value, EqualClass) {
        return InterfaceData.instanceOfInterface(value,EqualClass);
    }

    /**
     * Freeze the current object  
     */
    freeze() {
        Object.freeze(this);
    }


    
    /**
     * 
     * @param data
     * @param entryPoints
     * @returns {*}
     * 
     * @example
     * ```js
     * 
     * //from
     * data='string|number';
     * //or
     * data=['string','number'];
     * //to
     * data={types:['string','number']};
     * 
     * //from
     * data=class A{};
     * to
     * data={types:[A]};
     * 
     * //from
     * data={types:[]}
     * //or
     * data={types:['mixed','string']}
     * //to
     * data={types:['mixed']}
     * 
     * //from
     * data=()=>{};
     * //to 
     * data={
     *     types:[
     *         (()=>{})()
     *     ]
     * };
     * 
     * //from 
     * data={types:[()=>{}]}
     * //to
     * data={types:[(()=>{})()]}
     * 
     * //from
     * data={includes:'1'}
     * // to
     * data={includes:['1']}
     *
     * //from
     * data={excludes:'1'}
     * // to
     * data={excludes:['1']}
     * 
     * ```
     */
    static formatExtendedSyntaxToObject(data,entryPoints=['not defined']){
        let tp=typeof data;
        let result;
        if(tp === 'function' || tp==='string' || Array.isArray(data)){
            result={types:data};
        } else if(tp!=='object' || data===null){
            new InterfaceError('BadFormatCriteria',{entryPoints}).throw(true);
        } else {
            result=Object.assign({},data);
        }
        //types
        if(!Array.isArray(result.types) && result.types!==undefined){
            if(typeof result.types==='string'){
                result.types=result.types.split('|');
            } else {
                result.types=[result.types];
            }
        }
        if(result.types!==undefined && Array.isArray(result.types)){
            for(let key=0; key<result.types.length; key++){
                let type=result.types[key];
                let tt=typeof type;
                if(tt==='function' && type.prototype===undefined){
                    type=type();
                    type=CriteriaMethodType.formatExtendedSyntaxToObject(type,entryPoints);
                    result.types[key]=type;
                }
            }
        }
        return result;
    }

    /**
     * 
     * @param data
     * @param entryPoints
     * @returns {*}
     * @example
     * 
     * //from 
     * data={};
     * // or 
     * data={types:['mixed','string']};
     * //to 
     * data={types:['mixed'],includes:[],excludes:[]};
     * 
     * // from
     * data={types:'string',includes:'1',excludes:'1'};
     * // to 
     * data={types:['string'],includes:['1'],excludes:['1']};
     * 
     */
    static formatStrictSyntaxToObject (data,entryPoints=['not_defined']){
        if(data===null || data===undefined){
            data={};
        }
        if(typeof data!=='object'){
            new InterfaceError('CriteriaPropertyFormat',{message:'Object expected. Example:{types:["number"],includes:[1,2,3,4],excludes:[3]}'}).throw();
        }
        let result=Object.assign({},data);
        if(result.types===undefined){
            result.types=['mixed'];
        } else if(!Array.isArray(result.types)){
            result.types=[result.types];
        }
        if(result.types.includes('mixed') || result.types.length<=0){
            result.types=['mixed'];
        }
        /*for(let key=0; key<result.types.length; key++){
            if(typeof result.types[key]==='object' && result.types[key]!==null ){
                if('arguments' in result.types[key] || 'return' in result.types[key]){
                    result.types[key]=CriteriaMethodType.formatStrictSyntaxToObject(result.types[key]);
                }
            }
        }*/
        if(result.includes===undefined){
            result.includes=[];
        } else if (!Array.isArray(result.includes)) {
            result.includes = [result.includes];
        }

        if(result.excludes===undefined){
            result.excludes=[];
        } else if (!Array.isArray(result.excludes)) {
            result.excludes = [result.excludes];
        }
        if(result.options===undefined){
            result.options={entryPoints};
        }
        return result;
    }
   
}
InterfaceData.addGlobalEndPoints(CriteriaPropertyType);
