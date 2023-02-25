QUnit.module( 'JS logic test');

QUnit.test('test',function(assert){
    let checkTrueArray=(results,msg)=>{
        let matchs=[];
        results.forEach((v,k)=>{
            matchs.push(true);
        });
        assert.propEqual(results,matchs,msg);
    };
    let object={
        /**
         *  может ссылаться на текущий обьект через this, и метод не имеет свойства prototype
         */
        method(){
            return this;
        },
        /**
         *  не может ссылаться на текущий обьект через this, и метод не имеет свойства prototype
         */
        method2:()=>{
            return this;
        },
        /**
         * может ссылаться на текущий обьект через this, и метод  имеет свойство prototype
         */
        method3:function(){
            return this
        }
    };
// метод объекта
    checkTrueArray([
        object.method.prototype===undefined && object===object.method(),
        object.method2.prototype===undefined,object!==object.method2(),
        object.method3.prototype!==undefined,object===object.method3()
    ]);
    
    
// тест на super - делигация роли конструктора другому методу в наследнике.  
    {
        class A{
            constructor(a){
                this.a=a;
            }
        }

        class B extends A{
            constructor (a){
                B._constructor((...args)=>super(...args),a);
            }
            static _constructor(_super,...args){
               let self=_super(...args);
            }
        };
        let b=new B('dsf');
        checkTrueArray([
            b instanceof B,
            b instanceof A,
            b.a==='dsf'
        ]);
    }
    // тест на super 2- делигация роли конструктора другому методу в наследниках.   
    {
        class A{
            constructor(a){
                this.a=a;
            }
        }
        function B(...args){
            let self=this;
            if(typeof self.__constructor==='function'){
                let new_self=self.__constructor.call(self,...args);
                if(this.checkOwnCall!==true){
                    throw Error('You need to call super .__ constructor in your __constructor');
                } else {
                    delete this.checkOwnCall;
                }
                if(self!==new_self && typeof new_self==='object' && new_self!==null){
                    self=new_self;
                }
            }
            let self_A=new A(...args);
            Object.assign(self,self_A);
            return self;
        }
        B.prototype=Object.create(A.prototype,{constructor:{value:B},__constructor:{value(...args){this.checkOwnCall=true;}}});
        Object.setPrototypeOf(B,A);

        class C extends B{
            __constructor(a){
                this.c='success';
                super.__constructor(a);
            }
        }
        let b=new C('dsf');
        checkTrueArray([
            b instanceof B,
            b instanceof A,
            b.a==='dsf'
        ]);
    }
    {

        
        
        
        /*class A{
            constructor(a){
                this.A='success';

                console.log('A');
            }
        };
        class B extends A{
            constructor(a){
                super(a);
                console.log('B');
                this.B='success';
            }
        };
        let C=ClassFactory.extends('C',undefined,{
                __constructor(a){
                    this.C=a;
                    C.__super(this,a);
                    console.log('C');
                    //console.log([this.super.__constructor(a)]);
                },
                method(a){
                    
                },
                property:'qwer',
                get react(){
                    return 'asdf';
                }
        });
        class D extends C {
            __constructor(a){
                this.D='success';
                D.__super(this,a);
            }
        }
        let d= new D(2);
        console.log(d,d instanceof D, d instanceof C,d instanceof B,d instanceof A);*/
    }
});