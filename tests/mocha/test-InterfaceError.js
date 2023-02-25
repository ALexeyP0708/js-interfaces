import {assert,expect,isNode} from './export.js'
import {InterfaceError} from '../../src/InterfaceError.js';
import '../../src/config/errors.js';

describe('Class InterfaceError', () => {
  const bufDefaultTpl=InterfaceError.types('default')
  InterfaceError.types('default','{$type}: {$entryPoints} - {$message}{$errors}')
  it('InterfaceError.static types (get and set and unset)',()=>{
    let msg='Hello'
    InterfaceError.types('test_message',msg)
    assert.ok(InterfaceError.types('test_message')===msg)
    // unset
    InterfaceError.types('test_message',null)
    assert.ok(InterfaceError.types('test_message')===undefined)
  })
  it('InterfaceError.setType and getType',()=>{
    assert.ok(new InterfaceError().setType('test').getType() ==='test','test setType and getType')
  })
  it('InterfaceError.setEntryPoints && getEntryPoints',()=>{
    let entryPoints=['point1','point2'];
    let ie=new InterfaceError().setEntryPoints(entryPoints)
    let res=ie.getEntryPoints()
    expect(res).to.eql(entryPoints).which.not.equal(entryPoints)
    entryPoints[0]='changed';
    res=ie.getEntryPoints();
    expect(res).to.not.eql(entryPoints)
  })
  it('InterfaceError.setVars and getVars',()=>{
    let vars={var1:'var1',var2:'var2'}
    let ie=new InterfaceError()
    let res = ie.setVars(vars).getVars()
    expect(res).to.eql(vars).which.not.equal(vars)
    vars.var1='changed';
    res=ie.getVars()
    expect(res).to.not.eql(vars)
  })
  it('InterfaceError.setErrors and getErrors',()=>{
    let errors=['error1','error2'];
    let ie=new InterfaceError().setErrors(errors)
    let res=ie.getErrors()
    expect(res).to.eql(errors).which.not.equal(errors)
    errors[0]='changed';
    res=ie.getErrors();
    expect(res).to.not.eql(errors)
  })
  it('InterfaceError.getStack',()=>{
    let ie=new InterfaceError()
    assert.ok(typeof ie.getStack()==='string')
  })
  it('static InterfaceError.getMessage', (done) => {
    InterfaceError.types('test','type={$type}\nentryPoints={$entryPoints}\nerrors={$errors}\nvar1={$var1}\nvar2={$var2}');
    let subInterfaceError=new InterfaceError()
      .setType('NO_TYPE')
      .setVars({message: 'sub error'})
      .setErrors([
        new InterfaceError()
          .setType('NO_TYPE')
          .setVars({message: 'sub sub error'})
      ]);
    let vars={
      type: 'type_test',
      entryPoints: ['point1', 'point2'],
      var1: 'message var1',
      var2: 'message var2',
      errors: [
        'Text error',
        new Error('Text error from Error class'),
        subInterfaceError
      ]
    }
    
    const tab='  ';
    
    // deep false
    let result = InterfaceError.getMessage('test',vars ,false);
    let msg ='type=type_test\n'
      +`entryPoints=[point1][point2]\n`
      +`errors=\n`
      +`var1=message var1\n`
      +`var2=message var2`;
    expect(result,'deep errors = false').to.equal(msg)
    
    // test - generate message (no cache)
    result = InterfaceError.getMessage('test',vars ,true,true);
    msg = 'type=type_test\n'
      +`entryPoints=[point1][point2]\n`
      +`errors=\n`
      +`${tab}Text error\n`
      +`${tab}Text error from Error class\n`
      +`${tab}NO_TYPE:  - sub error\n`
      +`${tab}${tab}NO_TYPE:  - sub sub error\n`
      +`var1=message var1\n`
      +`var2=message var2`
    // for test cache message sub errors
    expect(result,'generate message (no cache)').to.equal(msg)

    //  test with cache enabled
    subInterfaceError.setVars({message: 'change sub error'})
    result = InterfaceError.getMessage('test',vars ,true,true);
    expect(result,'get message deep errors from cache').to.equal(msg)
    
    //  test with cache disabled
    msg = 'type=type_test\n'
      +`entryPoints=[point1][point2]\n`
      +`errors=\n`
      +`${tab}Text error\n`
      +`${tab}Text error from Error class\n`
      +`${tab}NO_TYPE:  - change sub error\n`
      +`${tab}${tab}NO_TYPE:  - sub sub error\n`
      +`var1=message var1\n`
      +`var2=message var2`
    
    result = InterfaceError.getMessage('test',vars ,true,false);
    expect(result,'generate again message (disabled cache )').to.equal(msg)
    done()
  })
  it('InterfaceError.getMessage', (done) => {
    let subInterfaceError=new InterfaceError()
      .setType('NO_TYPE')
      .setVars({message: 'sub error'})
      .setErrors([
        new InterfaceError()
          .setType('NO_TYPE')
          .setVars({message: 'sub sub error'})
      ]);
    let interfaceError=new InterfaceError('interface error')
      .setType('type_test')
      .setEntryPoints(['point1', 'point2'])
      .setVars({
        var1: 'message var1',
        var2: 'message var2',
      })
      .setErrors(
        [
          'Text error',
          new Error('Text error from Error class'),
          subInterfaceError
        ]
      )
    const tab='  ';

    // deep false
    let result = interfaceError.getMessage('test',false ,false);
    let msg ='type=type_test\n'
      +`entryPoints=[point1][point2]\n`
      +`errors=\n`
      +`var1=message var1\n`
      +`var2=message var2`;
    expect(result,'deep errors = false').to.equal(msg)

    // test - generate  deep errors message (no cache)
    result = interfaceError.getMessage('test',true,false);
    msg = 'type=type_test\n'
      +`entryPoints=[point1][point2]\n`
      +`errors=\n`
      +`${tab}Text error\n`
      +`${tab}Text error from Error class\n`
      +`${tab}NO_TYPE:  - sub error\n`
      +`${tab}${tab}NO_TYPE:  - sub sub error\n`
      +`var1=message var1\n`
      +`var2=message var2`
    // for test cache message sub errors
    expect(result,'generate message (no cache)').to.equal(msg)

    //  test with cache enabled
    subInterfaceError.setVars({message: 'change sub error'})
    result = interfaceError.getMessage('test',true,true);
    expect(result,'get message deep errors from cache').to.equal(msg)
 
     //  test with cache disabled
     msg = 'type=type_test\n'
       +`entryPoints=[point1][point2]\n`
       +`errors=\n`
       +`${tab}Text error\n`
       +`${tab}Text error from Error class\n`
       +`${tab}NO_TYPE:  - change sub error\n`
       +`${tab}${tab}NO_TYPE:  - sub sub error\n`
       +`var1=message var1\n`
       +`var2=message var2`
 
     result = interfaceError.getMessage('test' ,true,false);
     expect(result,'generate again message (disabled cache )').to.equal(msg)
    done()
  })
 /* it('react InterfaceError.message',()=>{
    /!* see InterfaceError.getMessage test *!/
    let message='test message';
    InterfaceError.types('test_message','Error message: {$message}')
    let ie=new InterfaceError(message).setType('test_message')
    expect(ie.message).to.equal('Error message: test message')
    InterfaceError.types('test_message',null)
  })
  it('react InterfaceError.stack',()=>{
    /!* see InterfaceError.getMessage test *!/
    let message='test message';
    InterfaceError.types('test_message','Error message: {$message}')
    let ie=new InterfaceError(message).setType('test_message')
    expect(ie.message).to.equal('Error message: test message')
  })*/


  // server tests
  if(isNode){
    it('(server)InterfaceError.isWorker',()=>{
      assert.ok(!InterfaceError.isBrowser())
      globalThis={};
      class WorkerGlobalScope {};
      global.WorkerGlobalScope=WorkerGlobalScope
      globalThis = new WorkerGlobalScope
      try {
        assert.ok(InterfaceError.isWorker());
      } finally {
        delete global.WorkerGlobalScope
        globalThis=global
      }

    })
    it('(server)InterfaceError.isBrowser',()=>{
      assert.ok(!InterfaceError.isBrowser())
      globalThis={
        navigator:{
          userAgent:'ok'
        }
      }
      globalThis.window=globalThis
      try{
        assert.ok(InterfaceError.isBrowser());  
      }finally {
        globalThis=global
      }
    })
    it('(server)InterfaceError.isServer',()=>{
      assert.ok(InterfaceError.isServer())
      let buf=globalThis.process?.versions?.node
      globalThis={}
      try {
        assert.ok(!InterfaceError.isServer())
        globalThis.process={
          versions:{
            node:'1'
          }
        }
        assert.ok(InterfaceError.isServer())
        delete globalThis.process.versions.node
        assert.ok(!InterfaceError.isServer())  
      } finally {
        globalThis=global
      }
    })
  }
  if(!isNode){
    it('(browser)InterfaceError.isWorker',()=>{
      assert.ok(!InterfaceError.isWorker())
      globalThis={}
      class WorkerGlobalScope {}
      window.WorkerGlobalScope=WorkerGlobalScope
      globalThis = new WorkerGlobalScope
      try {
        assert.ok(InterfaceError.isWorker());
      } finally {
        delete window.WorkerGlobalScope
        globalThis=window
      }
    })
    it('(browser)InterfaceError.isBrowser',()=>{
      assert.ok(InterfaceError.isBrowser())
      globalThis={
        navigator:{
          userAgent:'ok'
        }
      }
      globalThis.window=globalThis;
      try {
        assert.ok(InterfaceError.isBrowser());
        delete globalThis.window.navigator.userAgent
        assert.ok(!InterfaceError.isBrowser());
      } finally {
        globalThis=window;
      }
    })
    it('(browser)InterfaceError.isServer',()=>{
      assert.ok(!InterfaceError.isServer())
      globalThis={
        process:{
          versions:{
            node:undefined
          }
        }
      }
      try {
        delete globalThis.process.versions.node
        assert.ok(!InterfaceError.isServer())
      } finally {
        globalThis=window
      }
    })
  }
  //browser-side tests

  it('static InterfaceError.getConsole and setConsole',()=>{
    try{
      assert.ok(console===InterfaceError.getConsole())
      let plug={}
      assert.ok(plug===InterfaceError.setConsole(plug).getConsole())  
    } finally {
      InterfaceError.setConsole(console)
    }
  })
  it('InterfaceError.handler',()=>{
    let ie=new InterfaceError()
      .setType('TEST_TYPE')
      .setErrors([
        new InterfaceError().setType('SUB_TEST_TYPE'),
        new InterfaceError().setType('SUB_TEST_TYPE').setErrors([
          new InterfaceError().setType('SUB_SUB_TEST_TYPE').setErrors([
            'error in SUB_SUB_TEST_TYPE'
          ]),
          new Error('Text Object Error class'),
          'Plain text error'
        ])
      ])
    
    const consoleGroupTpl=InterfaceError.types('consoleGroup');
    const consoleMessageTpl=InterfaceError.types('consoleMessage');
    const defaultTpl=InterfaceError.types('default');
    InterfaceError.types('consoleGroup','{$type}-group');
    InterfaceError.types('consoleMessage','{$message}');
    InterfaceError.types('default','{$type}-message');
    const counter={
      groupCollapsed:0,
      message:0,
      groupEnd:0
    }
    const messages_group_stack=[];
    const messages_stack=[];
    let plugConsole={
      groupCollapsed:(...args)=>{
        counter.groupCollapsed++
        messages_group_stack.push(args[0])
      },
      warn:(...args)=>{
        counter.message++
        messages_stack.push(args[0])
      },
      error:(...args)=>{
        counter.message++
        messages_stack.push(args[0])
      },
      groupEnd:()=>{
        counter.groupEnd++
      }
    }
    InterfaceError.setConsole(plugConsole)
    try {
      ie.handler();
      //console.log(counter)
      //console.log(messages_group_stack)
      //console.log(messages_stack)
      assert.ok(counter.groupEnd===counter.groupCollapsed,'Test if all groups are closed')
      assert.ok(counter.message===7,'Message count match test')
      expect(messages_group_stack,'group message test').to.eql([
        '%c TEST_TYPE-group', 
        "%c SUB_TEST_TYPE-group",
        "%c SUB_SUB_TEST_TYPE-group"
      ])
      expect(messages_stack).to.eql([
        "TEST_TYPE-message", 
        "SUB_TEST_TYPE-message",
        "SUB_TEST_TYPE-message",
        "SUB_SUB_TEST_TYPE-message",
        "error in SUB_SUB_TEST_TYPE",
        "Text Object Error class",
        "Plain text error"
      ])
    } finally {
      InterfaceError.types('consoleGroup',consoleGroupTpl);
      InterfaceError.types('consoleMessage',consoleMessageTpl);
      InterfaceError.types('default',defaultTpl);
      InterfaceError.setConsole(console)
    }
  })
    //Do not delete
/*  if(isNode){
    it('(server)InterfaceError.setHandlerHook',(done)=>{
      let plug_check=true
      let plug=()=>{plug_check=false}
      process.on('uncaughtExceptionMonitor',plug);
      process.on('uncaughtException',plug);
      
      // warn : directly interfering with the _event private property, 
      // since in other ways it is impossible to get listeners that are called once.
      // Having received listeners that are called once, you can set them again via process.on and they will be called once.

      let uncaughtExceptionMonitorListener=
        typeof process._events.uncaughtExceptionMonitor ==='function'
        ?[process._events.uncaughtExceptionMonitor]
        : Object.assign([],process._events.uncaughtExceptionMonitor??[])
      let uncaughtExceptionListener=
        typeof process._events.uncaughtException ==='function'
          ? [process._events.uncaughtException]
          :Object.assign([],process._events.uncaughtException??[])
      let restore=()=>{
        process.removeAllListeners('uncaughtExceptionMonitor')
        process.removeAllListeners('uncaughtException')
        if(uncaughtExceptionMonitorListener.length>0){
          for(let call of uncaughtExceptionMonitorListener){
            process.on('uncaughtExceptionMonitor',call)
          }
        }
        if(uncaughtExceptionListener.length>0){
          for(let call of uncaughtExceptionListener){
            process.on('uncaughtException',call)
          }
        }
      }
      let err=new InterfaceError();
      let check=false;
      err.handler=()=>{
        check=true;
      }
      try{
        process.removeAllListeners('uncaughtExceptionMonitor');
        process.removeAllListeners('uncaughtException');
        InterfaceError.setHandlerHook()
        // imitation uncaught exception
        process.emit('uncaughtExceptionMonitor',err)
        process.emit('uncaughtException',err)
        assert.ok(check,'Calling listeners for event uncaughtExceptionMonitor and uncaughtException established  InterfaceError.setHandlerHook method')
        assert.ok(plug_check,'Listener for event [uncaughtExceptionMonitor or uncaughtException] was fired that should not be fired')
      }finally{
        restore()
        uncaughtExceptionMonitorListener=process.listeners('uncaughtExceptionMonitor')
        process.removeListener('uncaughtExceptionMonitor',plug)
        uncaughtExceptionListener=process.listeners('uncaughtException')
        process.removeListener('uncaughtException',plug)
        assert.ok(uncaughtExceptionMonitorListener.includes(plug),'listener recovery test for uncaughtExceptionMonitor event')
        assert.ok(uncaughtExceptionListener.includes(plug),'listener recovery test for uncaughtException event')
      }
      done()
    })
  }*/

  if(isNode){
    it('(server)InterfaceError.setHandlerHook',async ()=>{
      let {EventEmitter} = await import('node:events')
      globalThis = {process:new EventEmitter ()}
      Object.assign(globalThis.process,{versions:{node:'node'}})
      try {

        assert.ok(InterfaceError.isServer(),'InterfaceError.isServer check')
        InterfaceError.setHandlerHook()
        let check=false;
        let error=new InterfaceError()
        error.handler=()=>{
          check=true
        }
        globalThis.process.emit('uncaughtExceptionMonitor',error)
        globalThis.process.emit('uncaughtException',error)
        assert.ok(check,'call listener for uncaughtExceptionMonitor event')
      } finally {
        globalThis=global
      }
    })
  }
  it('(browser)InterfaceError.setHandlerHook',()=>{
    let window=globalThis
    globalThis=new EventTarget()
    try {
      InterfaceError.setHandlerHook()
      let check=false;
      let error=new InterfaceError()
      error.handler=()=>{
        check=true
      }
      class ErrorEvent extends Event {constructor(type, eventInitDict){ super(type, eventInitDict);this.error=eventInitDict.error}}
      globalThis.dispatchEvent(new ErrorEvent('error',{error}))
      assert.ok(check)
    } finally {
      globalThis=window
    }
  })
})
