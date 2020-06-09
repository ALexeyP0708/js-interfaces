export class ExtError extends Error {
    /**
     *
     * @param {string} type тип сообщения или сообщение.
     * @param objTypes обьект
     *          {
     *              types:{
     *                  type_name:'message'
     *              }
     *          }
     */
    constructor (type='default',objTypes=ExtError,vars={}){
        let msg='';
        if(typeof type!=='string'){
            type='default';
        }
        if(type in objTypes.types){
            msg=objTypes.types[type];
        } else {
            msg=type;
            type='no_type';
        }
        let pattern_vars=Object.keys(vars).join('|');
        if(pattern_vars!==''){
            //let pattern =new RegExp('{\\$('+pattern_vars+')}','ig');
            let pattern =new RegExp('{\\$([\\w]+)}','ig');
            msg=msg.replace(pattern,(match,p1)=>{
                if(p1 in vars){
                    return vars[p1];
                }
                return '';
            });
        }
        super(msg);
        this.type=type;
    }
}
Object.defineProperty(ExtError.prototype,'name',{
    enumerable:false,
    value:'ExtError'
});
ExtError.types={
    default:'no message'
};
