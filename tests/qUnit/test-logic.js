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
});