QUnit.module( 'Test API');

QUnit.test('Test API',function(assert){
    
    class TestIn{};
    class InterfaceTest{
        method(){
            return {
                arguments:[
                    {
                        types:['number',TestIn],
                    }
                ]
            };
        }
        static method(){}
        get react(){}
        set react(v){}
    }
    assert.ok(true);
});