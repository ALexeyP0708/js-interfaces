class Interface {
    constructor() {
        Interface.constructInterface(this);
        //this.deprecatedInterface(props);
    }

    static constructInterface(self) {
        let prop = Object.getOwnPropertyNames(self);
        //if(self instanceof Interfaces){
        Object.defineProperty(self, '__interfaces__', {
            enumerable: false,
            value: {}
        });
        //}
        //------
        let //keys_class = [],
            //keys_interface = [],
            proto = self
            //,is_interfaces = false
            ;

        let check = false;
        while (!check) {
            proto = Object.getPrototypeOf(proto);
            if (proto.constructor.name === 'Interfaces') {
                check = true;
                break;
            }
            let proto_keys = Object.getOwnPropertyNames(proto);
            // определяем, является ли наследуемый класс интерфейсом
            if (proto_keys.includes('__interface__')) {

                if (proto.__interface__ === undefined || typeof proto.__interface__ !== 'object' || proto.__interface__ == null) {
                    proto.__interface__ = {};
                    Object.defineProperty(proto, '__interface__', {
                        enumerable: false
                    });
                    for (let i in proto_keys) {
                        if (['__interface__', 'constructor'].includes(proto_keys[i])) {
                            continue;
                        }
                        proto.__interface__[proto_keys[i]] = proto[proto_keys[i]];
                        if (!(proto_keys[i] in self.__interfaces__)) {
                            self.__interfaces__[proto_keys[i]] = [];
                        }
                        let type = 'property';
                        let criteria = proto[proto_keys[i]];
                        if (typeof criteria === 'function') {
                            type = 'method';
                            criteria = criteria();
                        }
                        self.__interfaces__[proto_keys[i]].push({
                            interface: proto.constructor.name,
                            type: type,
                            criteria: criteria
                        });
                        delete proto[proto_keys[i]];
                    }
                } else {
                    for (let i in  proto.__interface__) {
                        //self.__interfaces__[prop].push({interface:proto.constructor.name,type:type,criteria:criteria});
                        if (!(prop in self.__interfaces__)) {
                            self.__interfaces__[i] = [];
                        }
                        let type = 'property';
                        let criteria = proto.__interface__[i];
                        if (typeof criteria === 'function') {
                            type = 'method';
                            criteria = criteria();
                        }
                        self.__interfaces__[i].push({
                            interface: proto.constructor.name,
                            type: type,
                            criteria: criteria
                        });
                    }
                }
            } else {
                for (let i in proto_keys) {
                    if (['constructor'].includes(proto_keys[i])) {
                        continue;
                    }
                    if (!prop.includes(proto_keys[i])) {
                        self[proto_keys[i]] = proto[proto_keys[i]];
                        prop.push(proto_keys[i]);
                    }
                }
            }
        }
        for (let property in self.__interfaces__) {
            if (!(property in self)) {
                Interface.renderMessage(['Missing property "' + self.constructor.name + '::' + property + '".']);
                continue;
            }
            let criteria_methods = [];
            for (let iface in self.__interfaces__[property]) {
                if (self.__interfaces__[property][iface].type == 'property') {
                    let check = InterfaceManager.prototype.checkingCriteria(self[property], self.__interfaces__[property][iface].criteria);
                    if (check === false) {
                        Interface.renderMessage(['Property "' + self.constructor.name + '::' + property + ' does not correspond not to one of the criteria ', self.__interfaces__[property][iface]]);
                        //break;
                    }
                } else if (self.__interfaces__[property][iface].type == 'method') {
                    if (typeof self[property] !== 'function') {
                        Interface.renderMessage(['Property "' + self.constructor.name + '::' + property + ' is not method.']);
                        continue;
                    }
                    var criteria = self.__interfaces__[property][iface].criteria;
                    if (typeof criteria != 'object' || criteria == null) {
                        continue;
                    }
                    criteria_methods.push(self.__interfaces__[property][iface]);
                }
            }
            ;
            if (typeof self[property] === 'function' && criteria_methods.length != 0) {
                let method = self[property];

                // проверка  аргументов лучше проверять до выполнения метода. т.к. состояние аргументов может измениться в методе.
                let wrap_method = function (...arg) {
                    for (let i in arg) {
                        for (let j in criteria_methods) {
                            let check = true;
                            let criteria = criteria_methods[j].criteria;
                            if (i in criteria) {
                                check = Interface.checkingCriteria(arg[i], criteria[i]);
                            } else if ('rest' in criteria) {
                                check = Interface.checkingCriteria(arg[i], criteria.rest);
                            }
                            if (check === false) {
                                Interface.renderMessage(['Argument "' + i + '" in "' + self.constructor.name + '::' + property + '" method  does not correspond not to one of the criteria ', criteria_methods[j]]);
                            }
                        }
                    }
                    var re = method.call(self, ...arg);
                    for (let i in criteria_methods) {
                        let check = true;
                        let criteria = criteria_methods[i].criteria;
                        if ('return' in criteria) {
                            let check = InterfaceManager.prototype.checkingCriteria(re, criteria.return);
                        }
                        if (check === false) {
                            InterfaceManager.prototype.renderMesseges(['Return result in "' + self.constructor.name + '::' + property + '" method  does not correspond not to one of the criteria ', criteria_methods[i]]);
                        }
                    }
                    return re;
                };
                Object.defineProperty(self, property, {
                    value: wrap_method
                });
            }
        }
    }

    static renderMessage(messege) {
        if (!Array.isArray(messege)) {
            messege = [messege];
        }
        console.warn('Interfaces: ', ...messege);
    }

    static checkingCriteria(obj, criteria) {
        let check = true;
        label1:
            for (let s in criteria) {
                switch (s) {
                    case 'typeof':
                        for (let i in criteria[s]) {
                            check = false;
                            if (typeof obj === criteria[s][i]) {
                                check = true;
                                break label1;
                            }
                        }
                        break;
                    case 'instanceof':
                        for (let i in criteria[s]) {
                            check = false;
                            if (obj instanceof criteria[s][i]) {
                                check = true;
                                break label1;
                            }
                        }
                        break;
                    case 'class':
                        for (let i in criteria[s]) {
                            check = false;
                            if (typeof obj == 'function' && obj === criteria[s][i]) {
                                check = true;
                                break label1;
                            }
                        }
                        break;
                }
            }
        return check;
    }

};