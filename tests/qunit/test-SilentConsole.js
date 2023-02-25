import {SilentConsole} from '../../src/export.js';
QUnit.module( 'Class SilentConsole');

QUnit.test('test methods SilentConsole',function(assert){
    let cnsl=Object.assign({},console);
    {
        let match={
            "console":cnsl,
            "props":Object.keys(cnsl),
            "plugs":(()=>{
                let result={ stack:[]};
                for(let key of Object.keys(cnsl)){
                    result[key]=(...args)=>{};
                }
                return result;
            })(),
            "pullMethods":{}
        };
        let sc=new SilentConsole(cnsl);
        assert.propEqual(sc,match,'constructor');
        
    }
    {
        let match={
                "console":cnsl,
                "props":
                    [
                        "error",
                        "log",
                        "warn",
                    ],
                "plugs":{
                    stack:[],
                    error:(()=>{return(...args)=>{}})(),
                    log:(()=>{return(...args)=>{}})(),
                    warn:(()=>{return(...args)=>{}})(),
                },
                "pullMethods":{}
            }
        ;
        let sc=new SilentConsole(cnsl,['error','log','warn']);
        assert.propEqual(sc,match,'constructor 2');
    }
    {
        let sc=new SilentConsole(cnsl,['error','log','warn']);
        let match={
                "console":cnsl,
                "props":
                    [
                        "error",
                        "log",
                        "warn",
                    ],
                "plugs":{
                    stack:[],
                    error:(()=>{return(...args)=>{}})(),
                    log:(()=>{return(...args)=>{}})(),
                    warn:(()=>{return(...args)=>{}})(),
                },
                "pullMethods":{
                    log:console.log
                }
            };
        
        sc.denyToSpeak(false,['log']);
        assert.ok(sc.pullMethods.log===console.log && cnsl.log!==console.log,'denyToSpeak');
        sc.denyToSpeak(true,['log']);
        assert.ok(sc.pullMethods.log===console.log && cnsl.log!==console.log && cnsl.log===sc.plugs.log,'denyToSpeak 2');
        cnsl.log('hello','friend');
        assert.deepEqual(sc.plugs.stack[0],['log',['hello','friend']],'denyToSpeak 3');
        sc.allowToSpeak(true,['log']);
        assert.ok(sc.plugs.stack[0]===undefined && sc.plugs.stack.length===0 && cnsl.log===console.log,'allowToSpeak');
    }
    
    
});
