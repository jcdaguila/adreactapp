import React, {useEffect, useState} from 'react';
import { getCombodata } from '../functions';

function CellsRenderer(props) {
    const[thevalue, setThevalue] = useState(props.data[props.field]);
    const[dataRow, setDataRow] = useState({});

    const onCellChange = (event) => {
        props.data[props.field] = event.target.value;
        props.data[props.field + 'name'] = event.target.options[event.target.selectedIndex].innerHTML;
        setThevalue(event.target.value);
        props.onCellChange();
    }
    
    const retrieveCombo = async ()=> {
        if(dataRow)
        if(Object.entries(dataRow).length === 0)
        {
            let data = {};
            data = getCombodata(props.combo);
            setDataRow(data);
        }
    }
    
    useEffect(() => {
        retrieveCombo();    
    });
    

    return(
        <div>
            <select value={thevalue} onChange={onCellChange}>
                {(function(items){
                    let key;
                    for(key in dataRow){
                        let comboitem = React.createElement('option',{ key : key, value : dataRow[key].id },dataRow[key].name);
                        items.push(comboitem);
                    }
                    return items;
                })([])
                }
            </select>
        </div>
    )
}

export default CellsRenderer;

/*
                <option value="red"> red </option>
                <option value="black"> black </option>
                <option value="green"> green </option>
                <option value="yellow"> yellow </option>
                <option value="violet"> violet </option>

*/