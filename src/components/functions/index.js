import TableRowDataService from "../../services";

export function getDataType(datatype){
    datatype = datatype.toString();
    let sqdatatype = "text";
    if(datatype.search('double')!== -1){sqdatatype = "number";return sqdatatype;} 
    if(datatype.search('char')!== -1){sqdatatype = "text";return sqdatatype;} 
    if(datatype.search('bit')!== -1) {sqdatatype = "checkbox";return sqdatatype;}
    if(datatype.search('tiny')!== -1) {sqdatatype = "checkbox";return sqdatatype;}
    if(datatype.search('int')=== 0) {sqdatatype = "text";return sqdatatype;}
    if(datatype.search('bool')!== -1) {sqdatatype = "checkbox";return sqdatatype;}
    if(datatype.search('date')!== -1 || datatype.search('time')!== -1) {sqdatatype = "datetime-local";return sqdatatype;}
    return sqdatatype;
}

export function getDefaultValue(Row){
    let value = Row.Default.trim();
    console.log(Row.Type, Row.Default);
    //if(Row.Default === null || Row.Default === ''){
        if(Row.Type.search('char')!== -1){value = '';}
        if(Row.Type.search('bit')!== -1) {value = false;}
        if(Row.Type.search('tiny')!== -1) {value = false;}
        if(Row.Type.search('int')=== 0) {value = '';}
        if(Row.Type.search('bool')!== -1) {value = false}
        if(Row.Type.search('date')!== -1 || Row.Type.search('time')!== -1) {value = Date.now();}
    //}
    return value;
}

export function getRequiredPattern(datatype){
    let patt = '';
    if(datatype.search('char')!== -1){patt = '';} 
    if(datatype.search('bit')!== -1) {patt = '';}
    if(datatype.search('tiny')!== -1) {patt = '';}
    if(datatype.search('int')=== 0) {patt = '';}
    if(datatype.search('float')=== 0) {patt = '';}
    if(datatype.search('bool')!== -1) {patt = ''}
    if(datatype.search('date')!== -1  || datatype.search('time')!== -1) {patt = "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}";} 
    return patt;
}

export function additionalProperties(Row, fieldAtts,Rows){
    if(Row.Type.search('char')!== -1){
        fieldAtts['value']=Rows[Row.Field];
        return;
    } 
    if(Row.Type.search('tiny')!== -1 || Row.Type.search('bit')!== -1 || Row.Type.search('bool')!== -1)
    {
        fieldAtts['checked']=Rows[Row.Field];
        fieldAtts['value']=Rows[Row.Field];
        return;
    }
    if(Row.Type.search('int')=== 0) {
        fieldAtts['value']=Rows[Row.Field];
        return;
    }
    if(Row.Type.search('float')=== 0) {
        fieldAtts['value']=Rows[Row.Field];
        return;
    }
    if(Row.Type.search('date')!== -1 || Row.Type.search('time')!== -1) {
        if(Rows[Row.Field]){
        let DT = new Date(new Date(Rows[Row.Field]).toString().split('GMT')[0]+' UTC').toISOString().split('.')[0];
        fieldAtts['value']=DT;//SDT;
        fieldAtts['pattern']=getRequiredPattern(Row.Type);
        }
        return;
    }
    fieldAtts['value']=Rows[Row.Field]!==null?Rows[Row.Field]:'';
    //fieldAtts['value']=Rows[Row.Field];
}

export function validateValue(e){
    let result;
        switch (e.target.type) {
            case 'checkbox':
                result = e.target.checked;
                break;
            case 'datetime-local':
                result = e.target.value;
                break;
        
            default: 
                result= e.target.value;
                break;
        }
    return result;
}

export function getCommentAtts(comment){
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    return theobject;
}

export function isFieldEditable(fieldname, Key, comment)
{
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let result = true;
    if(theobject.isnoteditable)result=false;

    if(fieldname === 'id' || fieldname === 'createdBy' || fieldname === 'createdAt' || fieldname === 'parent') result = false;
    if(Key === 'PRI') result = false;
    return result;
}

export function a(key, fieldAtts, Rows){
    fieldAtts['checked']=Rows[key];
}

export function getHeaderName(comment, Field){
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let header = theobject.header;
    let result = Field;
    if(header) return header;
    result = comment !== ''?comment:Field;
    return result;
}

export function getHeaderGrid(comment,Field){
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let header = theobject.header;
    let result = Field;
    if(header) return header;
    result = comment !== ''?comment:Field;
    return result;
}

export function getKindofGrid(comment){
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let kindofgrid = theobject.grid;
    let result = '';
    if(kindofgrid) return kindofgrid;
    return result;
}


export function isComboCreated(combo){
    let result = {};
    let comboitem;
    for(comboitem in global.combos){
        if(combo.comboname === global.combos[comboitem].comboname && combo.params === global.combos[comboitem].params){
            result = global.combos[comboitem].data;
        }        
    };
    return result;
}

export function isImage(comment){
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let result = false;
    if(theobject.isimage)result=true;
    return result;
}

export function hasImages(comment){
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let result = false;
    if(theobject.hasimages)result=true;
    return result;
}

export function hasContextMenu(comment){
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let result = false;
    if(theobject.contextmenu)result=true;
    return result;
}

export function getComboName(comment){
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let result = {};
    if(theobject.params)result['params']=theobject.params;
    if(theobject.comboname)result['comboname']=theobject.comboname;
    return result;
}

export function getCarouselSp(comment){
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let result = theobject.carouselsp?theobject.carouselsp:'';
    return result;
}

export function getParamsFromComment(comment){
    let result = {};
    var properties = comment.split(',');
    var theobject = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        theobject[tup[0]] = tup[1];
    });
    let params='';
    let spname='';
    if(theobject.params)params=theobject.params;
    if(theobject.combo)spname=theobject.combo;

    var paramlist = params.split('/');
    let cont = 0;
    paramlist.forEach(function(param) {
        result['param' + cont.toString()] = param;
        cont++;
    });
    result['spname'] = spname;
    return result;
}

export async function createCombodata(combo, comment){
    let data = isComboCreated(combo);
    if(Object.entries(data).length === 0){
        if(combo.params){
            let params = getParamsFromComment(comment);
            await TableRowDataService.executeStoredProcedure(JSON.stringify(params))            
            .then(response => {
                    data = response.data;
                    global.combos.push({comboname:combo.comboname, params:combo.params, data:data});
                })
            .catch(e=>{
                    console.log(e);
            });
        }else
        {            
            await TableRowDataService.executeStoredProcedure(JSON.stringify({ spname: combo.comboname }))
            .then(response => {
                    data = response.data;
                    global.combos.push({comboname:combo.comboname, params:combo.params, data:data});
                })
            .catch(e=>{
                    console.log(e);
            });
        }
    }
}

export function getCombodata(combo){
    let data = isComboCreated(combo);
    return data;
}

export function purgeCombos(){
    global.combos = [];
    console.log('Purging Combos', global.combos);
}
//Remove DropDown data from Global.combos for tablename
export async function purgeCombo(tablename){
    let data;
    let params = getParamsFromComment('combo:sp_gettablecomment,params:'.concat(tablename));
    await TableRowDataService.executeStoredProcedure(JSON.stringify(params))            
    .then(response => {
            data = response.data;
            let combo = getComboName(data[0].TABLE_COMMENT);
            if(combo.comboname)
            {
                RemoveCombo(combo);
            }
        })
    .catch(e=>{
            console.log(e);
    });
}

//Search Comboname and remove combo data from Global.combo
export function RemoveCombo(combo){
    let comboitem;
    let comboitemfound=null;
    for(comboitem in global.combos){
        if(combo.comboname === global.combos[comboitem].comboname){
            comboitemfound = comboitem;
        }        
    };
    if(comboitemfound) global.combos.splice(comboitemfound, 1);
}

export function reverseString(str) {
    if (str === "")
      return "";
    else
      return reverseString(str.substr(1)) + str.charAt(0);
}