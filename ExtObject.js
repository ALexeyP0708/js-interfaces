export class ExtObject extends Object{

    /**
     * формирует обьект параметров из аргументов.
     * @param  {Array} names - перечисляем имена аргументов
     * @param {Array} args - перечисляем аргументы которые будут соответствовать именам согласно в names
     * @param {object|undefined} obj_args аргументы которые переданы через обьект.
     * Если указан, и установлен соответствующий параметр то значения будут заимствоваться из этого параметра.
     * @param {boolean} is_merge если true то обьекты в obj_args будут обьедены с обьектамм args сопостовленые именам параметров.
     */
    static collectorArguments(names=[],args=[], obj_args,is_merge=false){
        let answer={};
        let check=false;
        if(typeof obj_args==='object' && obj_args !==null){
            check=true;
        }
        for(let k in names){
            let name=names[k];
            let arg=args[k];
            if(check){
                if(is_merge && typeof arg==='object' && arg!==null && typeof obj_args[name] ==='object' && obj_args[name]!==null){
                    answer[name]=Object.assign(arg,obj_args[name]);
                }else if(name in obj_args){
                    answer[name]=obj_args[name];
                } else {
                    answer[name]=arg;
                }
            } else{
                answer[name]=arg;
            }
        }
        return answer;
    }
}