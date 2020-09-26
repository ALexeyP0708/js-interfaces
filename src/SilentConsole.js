/**
 * @module @alexeyp0708/interface-manager
 */
import {buffer} from './export.js';
/**
 * Denies and allows displaying messages to the console.
    @prop {Array} props methods in the console that need to be controlled
    @props {Array} console the place where the console methods are stored
    @props {Array} plugs plugs for console methods
 */
export class SilentConsole{
    /**
     * @param {object} console object to be observed. as a rule, this is an object that implements console methods.
     * By default, this is a console dedicated to interfaces
     * @param {array|string} props  lists methods for observation. If string and matches "undefined",then observables will be all methods.
     */
    constructor(console=buffer.console,props=undefined){
        let self=this;
        this.console=console;
        this.props=[];
        this.props=props??Object.keys(this.console);
        this.pullMethods={};
        this.plugs={
            stack:[]
        };
        for(let prop of this.props){
            this.plugs[prop]=(...args)=>{
                self.plugs.stack.push([prop,args]);
            }
        }
    }
    clearStack(props=undefined){
        if(Array.isArray(props)){
            //props=props??this.props;
            for(let key=0; key<this.plugs.stack.length; key++){
                if(props.includes(this.plugs.stack[key][0])){
                    this.plugs.stack.splice(key,1);
                    key--;
                }
            }
        } else{
            this.plugs.stack=[];
        }
        
    }
    isDenied(props=undefined){
        props=props??this.props;
        let pull=Object.keys(this.pullMethods);
        let check=true;
        for(let prop of props){
            if(!pull.includes(prop)){
                check=false;
                break;
            }
        }
        return check;
    }
    
    /**
     * Prevent messages from being displayed in the console.
     * @param remember if true, then it will remember messages that are displayed through the console.
     */
    denyToSpeak  (remember=false,props=undefined){
        let console=this.console;
        props=props??this.props;
        for(let prop of props){
            if(console[prop]!==undefined  && this.pullMethods[prop]===undefined){
                this.pullMethods[prop]=console[prop];
            }
        }
        let plug=function(){};
        if(remember){
            for(let prop of props){
                if(console[prop]!==undefined){
                    if(this.plugs[prop]!==undefined){
                        console[prop]=this.plugs[prop];
                    } else{
                        console[prop]=plug;
                    }
                }
            }
        } else {
            for(let prop of props){
                if(console[prop]!==undefined ){
                    console[prop]=plug;
                }
            }
        }
    }

    /** 
     * allow displaying messages in the console
     * @param {boolean} display if true, it will display  the messages that were remembered earlier.
     * @param {boolean} display if true, list of methods to restore
     */
    allowToSpeak(display=false, props=undefined){
        props=props??Object.keys(this.pullMethods);
        let console=this.console;
        for(let prop of props){
            console[prop]=this.pullMethods[prop];
            delete this.pullMethods[prop];
        }
        if(display){
            for(let k=0;k<this.plugs.stack.length; k++){
                let set=this.plugs.stack[k];
                if(set!==undefined && props.includes(set[0])){
                    console[set[0]](...set[1]);
                    this.plugs.stack.splice(k,1);
                    k--;
                }
            }
        }
        let check=true;
        for(let prop in this.pullMethods){
            check=false;
            break;
        }
        if(check){
            this.plugs.stack=[];
        };
    };
};