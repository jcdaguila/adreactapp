import React from 'react';
import { getCombodata } from '../functions';

class Dropdown extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            thevalue : props.thevalue,
            dataRow : {}
        }
        this.onCellChange = this.onCellChange.bind(this);
        this.retrieveCombo = this.retrieveCombo.bind(this);
    
    }

    onCellChange(event){
        //console.log('props', this.props);
        //console.log('target', event.target);
        //this.props.data[this.props.field] = event.target.value;
        this.setState({
            thevalue : event.target.value
        });
        this.props.onChange(this.props.field, event.target.value);
    }
    
    retrieveCombo = async ()=> {
        if(this.state.dataRow)
        if(Object.entries(this.state.dataRow).length === 0)
        {
            let data = {};
            data = getCombodata(this.props.combo);
            this.setState({
                dataRow : data
            });
        }
    }
    
    componentDidMount(){
        this.retrieveCombo();    
    };
    
render(){
    return(
        <div>
            <select value={this.state.thevalue} onChange={this.onCellChange}>
                {(function(items, este){
                    let key;
                    for(key in este.state.dataRow){
                        let comboitem = React.createElement('option',{ key : key, value : este.state.dataRow[key].id }, este.state.dataRow[key].name);
                        items.push(comboitem);
                    }
                    return items;
                })([], this)
                }
            </select>
        </div>
    )
};
}

export default Dropdown;

/*value={this.state.thevalue} */