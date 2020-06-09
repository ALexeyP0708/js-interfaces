	<html>
		<head>
			<script src="Interfaces.js" ></script>
			<script>
	class TestInterface1 extends InterfaceManager {
		method1(){
			return {
				0:{typeof:['string']},
				return:{typeof:['string']}
			}
		}
	}
	TestInterface1.prototype.__interface__={};
	TestInterface1.prototype.prop1={
										typeof:['number']
									}
	class TestInterface2 extends TestInterface1 {
		method2(){}
	}
	TestInterface2.prototype.__interface__={};
	TestInterface2.prototype.prop2={
										typeof:['number']
									}
	class Test0 extends	TestInterface2{
		method4(...argu){
			//this.argu_method1=arg;
			return argu[0];
		}
	}							
	class TestInterface3 extends Test0 {
		method3(){
			return {
				0:{typeof:['string']},
				return:{typeof:['string']}
			}
		}
		method4(){
			return {
				0:{typeof:['string']},
				return:{typeof:['string']}
			}
		}
	}
	TestInterface3.prototype.__interface__={};	
	TestInterface3.prototype.prop3={
										typeof:['object']
									}
	class Test extends TestInterface3{// абстрактный класс
		method1(...arg){
			this.arg_method1=arg;
			return arg[0];
		}
	}
	class Test2 extends Test { // реализация класса
		method4(...argu){
			return 'text';
		}
	}
	Test2.prototype.method2='Hello';
	Test2.prototype.prop1='1'; 
	//Test.prototype.hello='Hello';
	
	var test= new Test2();
	var test2= new Test2();
		test.method1(2);
		test.method4(2);
		
	console.log(test2);	
			</script>
		</head>
		<body></body>

	</html>