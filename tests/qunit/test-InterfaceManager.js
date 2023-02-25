import {
    InterfaceError
} from '../../src/export.js';

QUnit.module( 'Class InterfaceManager');


/*let consoleMessageTest=(silentConsole,match=[])=>{
    if(!(silentConsole instanceof SilentConsole)){ throw new Error('The instance must be owned SilentConsole class');}
    let check=true;
    if(match instanceof SilentConsole){
        match=match.plugs.stack;
    }
    let sets=silentConsole.plugs.stack;
    for(let key=0; key<match.length; key++){
        if(
            sets[key]===undefined ||
            match[key][0]!==undefined && sets[key][0]!==match[key][0] 
        ){
            check=false;
            break;
        }
        if(match[key][0]===undefined ){
            continue;
            
        }
        if(match[key][0]===sets[key][0]){
            if(match[key][1]===undefined){
                continue;
            }
            for(let x=0; x<match[key][1].length;x++){
                if(['object'].includes(typeof match[key][1][x]) && match[key][1][x]!==null ){
                    if(['object'].includes(typeof sets[key][1][x]) && match[key][1][x]!==null ){
                        // сравнивание обьектов не нужно
                        continue;
                    }
                    check=false;
                    break;
                }
                if(match[key][1][x]===sets[key][1][x]){
                    continue;
                } else {
                    check=false;
                    break;
                }
            }
        } else {
            check=false;
            break;
        }
    }
    return check;
};*/
/*QUnit.test('Test',function(assert){
    let scMath= new SilentConsole();
    scMath.denyToSpeak(true);
    console.group('Group');
    console.warn('Bad');
    console.groupEnd();
    scMath.allowToSpeak();
    console.log(scMath);
    let sc = new SilentConsole();
    console.log(sc);
    sc.denyToSpeak(true);
    console.group('Group');
    console.warn('Bad');
    console.groupEnd();
    assert.ok(consoleMessageTest(sc,scMath),'qwer');
    sc.allowToSpeak();
});*/
QUnit.test('Methods test InterfaceManager class',function(assert){
    let throwTest=(func,...args)=>{
        try {
            func(...args);
            return false;
        } catch (e) {
            if(e instanceof InterfaceError){
                return true;
            }
            throw e;
        }
    };
 


    // expandInterfaces
    {

    }



   
    // test
    {
        class TestInterface {
            method(){}
        }
    }
    assert.ok(true);
});

