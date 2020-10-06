
import {
} from "./export.js";

export let interfaceData = Symbol.for('interfaceData');
export class InterfaceData{
    /**
     * 
     * @param {function} [ProtoClass]
     * @param {InterfaceData|{[interfaces]:function[],[protoProps]:object,[staticProps]:object,[ownRules]:[],[end_points]:[]}} [data]
     */
    constructor(ProtoClass=undefined,data={}){
        if(ProtoClass!==undefined){
            Object.defineProperty(ProtoClass,interfaceData,{
                value:this,
                enumerable:false,
                configurable:true,
                writable:true
            });
        }
        this.owner=ProtoClass;
        this.isBuilt=false;
        this.interfaces=[];
        this.protoProps={};
        this.staticProps={};
        this.ownRules=[];
        this.end_points=[];
        InterfaceData.set(this,data);
    } 
    
    /**
     * set interface data for the class
     * @param {function|InterfaceData|{[interfaces]:function[],[protoProps]:object,[staticProps]:object,[ownRules]:[],[end_points]:[]}}  ProtoClass
     * @param {InterfaceData|{[interfaces]:function[],[protoProps]:object,[staticProps]:object,[ownRules]:[],[end_points]:[]}} [data]
     */
    static set(ProtoClass, data={}) {
        //return new InterfaceData(ProtoClass,data);
        let self=ProtoClass;
        //self.isBuilt=false;
        if(typeof ProtoClass === 'function'){
            self=this.init(ProtoClass);
        }
        if(data.end_points!==undefined){
            for(let point of data.end_points){
                if(!self.end_points.includes(point)){
                    self.end_points.push(point);
                }
            }
        }
        if(data.interfaces!==undefined && Array.isArray(data.interfaces)){
            /*for(let intf of data.interfaces){
                if(!self.interfaces.includes(intf)){
                    self.interfaces.push(intf);
                }
            }*/
            self.interfaces=data.interfaces;
            
        }
        if(data.staticProps!==undefined){
            for(let prop of Object.keys(data.staticProps)){
                self.isBuilt=false;
                self.staticProps[prop]=data.staticProps[prop];
            }
        }
        if(data.protoProps!==undefined){
            for(let prop of Object.keys(data.protoProps)){
                self.isBuilt=false;
                self.protoProps[prop]=data.protoProps[prop];
            }
        }
        if(data.ownRules!==undefined){
            self.isBuilt=false;
            self.ownRules=data.ownRules;
        }
        
    }

    /**
     * checks if interface data is installed
     * @param {function} ProtoClass
     * @returns {boolean}
     */
    static has(ProtoClass) {
        return ProtoClass.hasOwnProperty(interfaceData);
    }

    /**
     * initializes interface data for the class
     * @param {function} ProtoClass
     * @returns {InterfaceData}
     */
    static init(ProtoClass) {
        if (!this.has(ProtoClass)) {
            new InterfaceData(ProtoClass);
        }
        return this.get(ProtoClass);
    }
    
    /**
     * Returns interface data for the class
     * @param {function} ProtoClass
     * @returns {InterfaceData|undefined}
     */
    static get(ProtoClass) {
        return ProtoClass[interfaceData];
    }

    /**
     * We register endpoints globally.
     * Endpoints are classes where analysis stops along the prototype chain.
     * Analysis and assembly will not occur beyond the specified classes by prototypes.
     * @param {function[]} points
     */
    static addGlobalEndPoints(...points) {
        this.end_points.splice(this.end_points.length, 0, ...points);
    }

    /**
     * We register endpoints globally.
     * Endpoints are classes where analysis stops along the prototype chain.
     * Analysis and assembly will not occur beyond the specified classes by prototypes.
     * Local points they apply only when using a specific class or interface
     * @param {function}  ProtoClass The class for which the endpoints will be set
     * @param {...function} points
     */
    static setEndPoints(ProtoClass, ...points) {
        let interfaceData = this.init(ProtoClass);
        interfaceData.end_points = points;
    }

    /**
     * Returns endpoints for the class
     * @param {function|object} ProtoClass
     * @returns {function[]}
     */
    static getEndPoints(ProtoClass) {
        if(typeof ProtoClass === 'object'){
            let proto=Object.getPrototypeOf(ProtoClass);
            if(proto===null || !proto.hasOwnProperty('constructor')){
                return [];
            }
            ProtoClass=Object.getPrototypeOf(ProtoClass).constructor;
        }
        if (this.has(ProtoClass)) {
            return this.get(ProtoClass).end_points;
        }
        return [];
    }
    /**
     * Returns the endpoints for the class along with the global points
     * @param {function|object} ProtoClass
     * @returns {function[]}
     */
    static getAllEndPoints(ProtoClass = undefined) {
        let end_points = Object.assign([], this.end_points);
        if (ProtoClass !== undefined) {
            end_points = end_points.concat(this.getEndPoints(ProtoClass));
        }
        return end_points;
    }

    /**
     * Checks if a class / object implements an interface
     * @param {object|function} object
     * @param {function} Interface
     * @returns {boolean}
     */
    static instanceOfInterface(object, Interface) {
        let ProtoClass = object;
        let to = typeof object;
        if (to === 'object' && object !== null) {
            ProtoClass = Object.getPrototypeOf(object).constructor;
        } else if (to !== 'function') {
            return false;
        }
        let interfaceData = this.get(ProtoClass);
        if (interfaceData === undefined) {
            return false;
        }
        for (let iface of interfaceData.interfaces) {
            if (typeof iface === 'function' && (iface === Interface || Interface.isPrototypeOf(iface))) {
                return true;
            }
        }
        return false;
    }
}
let AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
InterfaceData.end_points = [
    Object,
    Array,
    Function,
    AsyncFunction,
    InterfaceData
];