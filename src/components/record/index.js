import MenuContext from '../contextmenu'
import React from "react";
import TableRowDataService from "../../services";
import {getDataType, additionalProperties, validateValue, createCombodata, getCommentAtts} from "../functions";
import Dropdown from "../dropdown";
import TableGrid from "../grid";
import Report from "../report";
import {Image} from 'cloudinary-react';
import ImageGrid from "../../imagegrid";
import ImageSelector from '../../imageselector';
import MessageBox from "../messagebox/index";
import {Button} from "react-bootstrap";
import saveicon from '../../images/save.ico';
import removeicon from '../../images/removeicon.png';
import printicon from '../../images/printicon.png';
import refreshicon from '../../images/refreshicon.jpg';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Busy from "busy-wait-cursor";
//import ReactFacebookLogin from "../facebook";
//import Facebook from "../facebook01";

import beepsuccess from '../../audios/success.wav';
import beepwrong from '../../audios/wrong.wav';
var sndsuccess = new Audio(beepsuccess); // buffers automatically when created
var sndwrong = new Audio(beepwrong); // buffers automatically when created


export default class TableRow extends React.Component{
    constructor(props){
        super(props);
        this.onBlur=this.onBlur.bind(this);
        this.onChangeField=this.onChangeField.bind(this);
        this.onChange=this.onChange.bind(this);
        this.retrieveTableRow=this.retrieveTableRow.bind(this);
        this.getTableStructure=this.getTableStructure.bind(this);
        this.updateTableRow=this.updateTableRow.bind(this);
        this.deleteTableRow=this.deleteTableRow.bind(this);
        this.printTableRow=this.printTableRow.bind(this);
        this.closeEditTableRow=this.closeEditTableRow.bind(this);
        this.getTableInfo = this.getTableInfo.bind(this);
        this.addNewTab = this.addNewTab.bind(this);
        this.refreshInfo = this.refreshInfo.bind(this);
        this.getMenuContextItems = this.getMenuContextItems.bind(this);
        this.getTextFromImage = this.getTextFromImage.bind(this);
        this.openTextImageSource = this.openTextImageSource.bind(this);
        //this.getEbayList = this.getEbayList.bind(this);
        this.copyContent = this.copyContent.bind(this);
        this.pasteContent = this.pasteContent.bind(this);
        this.searchOnEbay = this.searchOnEbay.bind(this);
        this.createItemOnEbay = this.createItemOnEbay.bind(this);
        this.createItemOnWooCommerce = this.createItemOnWooCommerce.bind(this);
        this.openEbayItem = this.openEbayItem.bind(this);
        this.reviseItemOnWooCommerce = this.reviseItemOnWooCommerce.bind(this);
        this.removeItemOnWooCommerce = this.removeItemOnWooCommerce.bind(this);
        this.reviseItemoOnEbay = this.reviseItemoOnEbay.bind(this);
        this.getFirstPart = this.getFirstPart.bind(this);
        this.getMoreParts = this.getMoreParts.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.getTableCommentAtts = this.getTableCommentAtts.bind(this);
        this.clearUnsaved = this.clearUnsaved.bind(this);
        this.textAreaAdjust = this.textAreaAdjust.bind(this);
        this.refresh = this.refresh.bind(this);

        this.tableStructure={};
        this.baseid = '';
        this.state = {
            currentTableRow: {},
            message: "",
            KeyField: '',
            childtables:{},
            picid:'',
            tabIndex:0,
            tableCommentAtts:{},
            needsbesaved:false,
        };
    }

    refresh(){
        this.getTableInfo(this.props.id);
    }

    componentDidMount(){
        this.baseid = this.props.NombreTabla+(this.props.parent?this.props.parent:'')+this.props.id;
        this.getChildTables();
        this.getTableCommentAtts(); 
        this.setState({ needsbesaved:false });
        this.refresh();
    }

    async getTableCommentAtts(){
        let data = {};
        await TableRowDataService.executeStoredProcedure(JSON.stringify({spname:'sp_gettablecomment', tablename:this.props.NombreTabla}))            
        .then(response => {
                data = response.data;
                this.setState({
                    tableCommentAtts: getCommentAtts(data[0].TABLE_COMMENT)
                  });
            })
        .catch(e=>{
                console.log(e);
        });
    }

    async getChildTables(){
        let data = {};
        await TableRowDataService.executeStoredProcedure(JSON.stringify({ spname: 'sp_getChildTables', tablename: this.props.NombreTabla }))
            .then(response => {
                data = response.data;
                this.setState({
                    childtables: data
                  });
            })
            .catch(e=>{
                console.log(e);
            });
    }    

    async getTableInfo(id){
        let TS = await this.getTableStructure();
        let TheKeyField = '';
        for(let field in TS){
          if(TS[field].Key === 'PRI'){
            TheKeyField = TS[field].Field;
          }
        }    
        let data = await this.retrieveTableRow(id);
        this.tableStructure = TS;
        this.setState({
          currentTableRow: data,
          KeyField: TheKeyField
        });    
    }

async retrieveTableRow(id){
        let data = {};
        await TableRowDataService.get(id, this.props.NombreTabla)
            .then(response => {
                data = response.data;
            })
            .catch(e=>{
                console.log(e);
            });
        return data;
}

/*
getTableRow(id){
        TableRowDataService.get(id, this.props.NombreTabla)
            .then(response=>{
                this.setState({
                    currentTableRow: response.data
                });
            })
            .catch(e=>{
                console.log(e);
            });
}*/

async getTableStructure(){
        let data = {};
        await TableRowDataService.getTableStructure(this.props.NombreTabla)
        .then(response=>{
          data = response.data;
        })
        .catch(e=>{
            console.log(e);
        });
        return data;
}
    /*
    getTableStructure(){
        TableRowDataService.getTableStructure(this.props.NombreTabla)
        .then(response=>{
            this.setState({
                tableStructure: response.data
            });
            const {tableStructure} = this.state;
            let rows = {};
            let key;
            for(key in tableStructure) {
                let Row = tableStructure[key];
                rows[Row.Field] = getDefaultValue(Row.Type);
            }
            this.setState(prevState=>({
                fields: rows
            }));
        })
        .catch(e=>{
            console.log(e);
        });
    }*/

    onBlur(e) {
        if (this.state.needsbesaved) {
            this.setState(prevState => ({
                currentTableRow: {
                    ...prevState.currentTableRow,
                    [e.target.id]: validateValue(e).toUpperCase()
                },
            }));
        }
    };

    onChangeField(e){
        let newvalue = validateValue(e)//.toUpperCase();
        this.setState(prevState=>({
                 currentTableRow: {
                     ...prevState.currentTableRow,
                     [e.target.id] : newvalue
                 },
                 needsbesaved:true
         }));
     }

     onChange(field, newvalue){
        newvalue = newvalue//.toUpperCase();
         this.setState(prevState=>({
            currentTableRow: {
                ...prevState.currentTableRow,
                [field] : newvalue
            },
            needsbesaved:true
        }));
     }

    closeEditTableRow(){
                this.props.history.push('/' + this.props.NombreTabla);
    }

    printTableRow(){
        let theReport = <Report addNewTab={this.addNewTab} NombreTabla = {"thereport"} id = {this.props.id}/>;
        this.props.addNewTab({parent:"thereport", name: this.props.id.toString(), content: theReport});
    }

    clearUnsaved(){
        this.refresh();
        this.setState({
            message: "Unsaved data Cleared successfully!",
            needsbesaved:false
        });
    }

    updateTableRow(){
        TableRowDataService.update(this.state.KeyField, this.state.currentTableRow[this.state.KeyField], this.state.currentTableRow, this.props.NombreTabla)
            .then(response=> {
                this.setState({
                    message: "The TableRow was updated successfully!",
                    needsbesaved:false
                });
                //setTimeout(()=>this.props.history.push('/' + this.props.NombreTabla), 1000);
                this.refreshInfo();
            })
            .catch(e=>{
                console.log(e);
            });
    }

    updateTableRowInternal(){
        TableRowDataService.update(this.state.KeyField, this.state.currentTableRow[this.state.KeyField], this.state.currentTableRow, this.props.NombreTabla)
        .then(response=> {
            //this.needsbesaved=false;
        })
        .catch(e=>{
            console.log(e);
        });
    }

    async deleteTableRow(){
        const result = await MessageBox.open({
            title: "Confirm",
            content: <p>Do You want to remove it?</p>,
            buttons: [
              { name: "Yes", handler: () => "yes" },
              { name: "No", handler: () => "no" }
            ]
          });
          if(result === 'yes'){      
            TableRowDataService.delete(this.state.KeyField, this.state.currentTableRow.id, this.props.NombreTabla)
            .then(response=>{
                //this.props.history.push('/' + this.props.NombreTabla);
                this.refreshInfo();
            })
            .catch(e=>{
                console.log(e);
            });
          }
    }

    addNewTab(thetab){
        this.props.addNewTab(thetab);    
    }

    refreshInfo(){
        this.props.refreshInfo();
    }

    copyContent(e, props){       
        if (window.getSelection){ // all modern browsers and IE9+
            var selectedText = window.getSelection().toString();
            if (selectedText.length > 0){
                navigator.clipboard.writeText(selectedText);
            }else{
                navigator.clipboard.writeText(props.target.value);
            }
        }
        else{
            navigator.clipboard.writeText(props.target.value);
        }
    }

    async pasteContent(e, props){
        let text = await navigator.clipboard.readText();
        if(text.search('await')<0)props.target.value = text;
        this.setState(prevState=>({
            currentTableRow: {
                ...prevState.currentTableRow,
                [props.target.id] : text
            }
        }));
    }

    async openWooCItem(e, props){
        await TableRowDataService.getInfoWooCProduct(props.target.value, 0)
        .then(response => {
            window.open(response.data);
        })
        .catch(e=>{
                console.log(e);
        });
    }

    openEbayItem(e, props){
        window.open("https://www.ebay.com/itm/" + props.target.value);
    }

    searchOnEbay(e, props){
        window.open("https://www.ebay.com/sch/i.html?_nkw=" + props.target.value);
    }

    searchOnGoogle(e, props){
        window.open("https://www.google.com/search?q=" + props.target.value);
    }

    async createItemOnEbay(e, props){
            if(this.state.needsbesaved){
                this.setState({
                    message: "Unsaved info, Click on 'Save' or 'Clear Unsaved' button, to continue."
                });
                sndwrong.play();
            }
            else{
                const result = await MessageBox.open({
                    title: "Confirm",
                    content: <p>Do You want to Create the Ebay Item?</p>,
                    buttons: [
                    { name: "Yes", handler: () => "yes" },
                    { name: "No", handler: () => "no" }
                    ]
                });
                if(result === 'yes'){
                    const {spebay, spebaypics} = this.state.tableCommentAtts;
                    let ebayitemcreated = await TableRowDataService.createEbayList(JSON.stringify({ spebay: spebay, spebaypics: spebaypics, id: this.props.id }));
                    if(ebayitemcreated.data.AddItemResponse.Ack === "Success" || ebayitemcreated.data.AddItemResponse.Ack === "Warning"){
                        props.target.value = ebayitemcreated.data.AddItemResponse.ItemID;
                        this.setState(prevState=>({
                            currentTableRow: {
                                ...prevState.currentTableRow,
                                [props.target.id] : ebayitemcreated.data.AddItemResponse.ItemID
                            }
                        }));
                        this.updateTableRowInternal();
                        this.setState({
                            message: "The eBay Item has been posted successfully!"
                        });
                        sndsuccess.play();
                    }else{
                        this.setState({
                            message: ebayitemcreated.data.AddItemResponse.Errors.LongMessage
                        });
                        sndwrong.play();
                    }
                }
          }
    }

    async reviseItemoOnEbay(e, props){
        if(this.state.needsbesaved){
            this.setState({
                message: "Unsaved info, Click on 'Save' or 'Clear Unsaved' button, to continue."
            });
            sndwrong.play();
        }
        else{
            const result = await MessageBox.open({
                title: "Confirm",
                content: <p>Do You want to Revise the Ebay Item?</p>,
                buttons: [
                { name: "Yes", handler: () => "yes" },
                { name: "No", handler: () => "no" }
                ]
            });
            if(result === 'yes'){
                const {spebay, spebaypics} = this.state.tableCommentAtts;
                let ebayitemrevised = await TableRowDataService.reviseEbayList(JSON.stringify({ spebay: spebay, spebaypics: spebaypics, id: this.props.id, ebayid:props.target.value }));            
                if(ebayitemrevised.data.ReviseItemResponse.Ack === "Success"){
                    this.setState({
                        message: "The eBay Item has been revised successfully!"
                    });
                    sndsuccess.play();
                }else{
                    this.setState({
                        message: ebayitemrevised.data.ReviseItemResponse.Errors.LongMessage
                    });
                    sndwrong.play();
                }
            }
        }
    }

    async createItemOnWooCommerce(e, props){
        if(this.state.needsbesaved){
            this.setState({
                message: "Unsaved info, Click on 'Save' or 'Clear Unsaved' button, to continue."
            });
            sndwrong.play();
        }
        else{
            const result = await MessageBox.open({
                title: "Confirm",
                content: <p>Do You want to Create the WooCommerce Item?</p>,
                buttons: [
                { name: "Yes", handler: () => "yes" },
                { name: "No", handler: () => "no" }
                ]
            });
            if(result === 'yes'){    
                let woocitemcreated = await TableRowDataService.createWoocList(this.props.id);
                console.log(woocitemcreated);
                if(woocitemcreated.data.message){
                    this.setState({
                        message: woocitemcreated.data.message
                    });
                    sndwrong.play();
                }else{
                    props.target.value = woocitemcreated.data.id;
                    this.setState(prevState=>({
                        currentTableRow: {
                            ...prevState.currentTableRow,
                            [props.target.id] : woocitemcreated.data.id
                        }
                    }));
                    this.updateTableRowInternal();
                    this.setState({
                        message: "The WooCommerce Item has been posted successfully!"
                    });
                    sndsuccess.play();
                }
            }
        }
    }

    async reviseItemOnWooCommerce (e, props){
        if(this.state.needsbesaved){
            this.setState({
                message: "Unsaved info, Click on 'Save' or 'Clear Unsaved' button, to continue."
            });
            sndwrong.play();
        }
        else{
            const result = await MessageBox.open({
                title: "Confirm",
                content: <p>Do You want to Revise the WooCommerce Item?</p>,
                buttons: [
                { name: "Yes", handler: () => "yes" },
                { name: "No", handler: () => "no" }
                ]
            });
            if(result === 'yes'){    
                let woocitemrevised = await TableRowDataService.reviseWoocList(this.props.id, props.target.value);
                if(woocitemrevised.data.message){
                    this.setState({
                        message: woocitemrevised.data.message
                    });
                    sndwrong.play();
                }else{
                    this.setState({
                        message: "The WooCommerce Item has been Revised successfully!"
                    });
                    sndsuccess.play();
                }
            }
        }
    }

    async removeItemOnWooCommerce (e, props){
        const result = await MessageBox.open({
            title: "Confirm",
            content: <p>Do You want to Remove the WooCommerce Item?</p>,
            buttons: [
              { name: "Yes", handler: () => "yes" },
              { name: "No", handler: () => "no" }
            ]
          });
          if(result === 'yes'){    
            let woocitemremoved = await TableRowDataService.removeWoocList(this.props.id, props.target.value);
            if(woocitemremoved.data.message){
                this.setState({
                    message: woocitemremoved.message
                });
                sndwrong.play();
            }else{
                props.target.value = '';
                this.setState(prevState=>({
                    currentTableRow: {
                        ...prevState.currentTableRow,
                        [props.target.id] : ''
                    }
                }));
                this.updateTableRowInternal();
                this.setState({
                    message: "The WooCommerce Item has been Removed successfully!"
                });
                sndsuccess.play();
            }
          }
    }

    async getTextFromImage(e, props) {
        const result = await MessageBox.open({
            title: "Confirm",
            content: <p>Do You want to get Text from Image?</p>,
            buttons: [
                { name: "Yes", handler: () => "yes" },
                { name: "No", handler: () => "no" }
            ]
        });
        if (result === 'yes') {
            Busy.wait().then(async done => {
                await TableRowDataService.getTextFromImage(JSON.stringify({ spname: this.state.tableCommentAtts['getimageid'], id: this.props.id }))
                    .then(response => {
                        if (response.data.text) {
                            console.log(response.data.text);
                            props.target.innerHTML = response.data.text;
                            this.setState(prevState => ({
                                currentTableRow: {
                                    ...prevState.currentTableRow,
                                    [props.target.id]: response.data.text
                                }
                            }));
                            this.updateTableRowInternal();
                            this.setState({
                                message: 'Text imported from Image Successfully.'
                            });
                            sndsuccess.play();
                        }
                        else {
                            this.setState({
                                message: response.data
                            });
                            sndwrong.play();
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        this.setState({
                            message: e.message
                        });
                    });
                done();
            });
        }
    }

    async openTextImageSource(e, props){
            await TableRowDataService.executeStoredProcedure(JSON.stringify({spname:this.state.tableCommentAtts['getimageid'], id:this.props.id}))
            .then(response => {
                console.log(response.data[0].name);
                window.open(response.data[0].name);
            })
            .catch(e=>{
                this.setState({
                    message: e.message
                });
            });
    }

    getMenuContextItems(Row, este, currentTableRow, contextmenuopts){
        //current 012345678
        let items = [];
        if(contextmenuopts.search("0")>=0)
            items.push({id:this.baseid+'copy' + Row.Field, text:'Copy', 
                onclick:este.copyContent
            });
        if(contextmenuopts.search("6")>=0)
            items.push({id:this.baseid+'paste' + Row.Field, text:'Paste', 
                onclick:este.pasteContent
            });
        if(contextmenuopts.search("1")>=0)
            items.push({id:this.baseid+'open' + Row.Field, text:'Open eBay Item.', 
                onclick:este.openEbayItem
            });
        if(contextmenuopts.search("2")>=0)
            items.push({id:this.baseid+'searchebay' + Row.Field, text:'Search on eBay.', 
                onclick:este.searchOnEbay
            });
        if(contextmenuopts.search("3")>=0)
            items.push(!currentTableRow[Row.Field]?
            {id:this.baseid+'ebay' + Row.Field, text:'Create Item on ebay.', 
                onclick:este.createItemOnEbay
            }
            :
            {id:this.baseid+'reviseebay' + Row.Field, text:'Revise Item on ebay.', 
                onclick:este.reviseItemoOnEbay
            });
            if(contextmenuopts.search("4")>=0)
            {
                if(!currentTableRow[Row.Field])
                    items.push({id:this.baseid+'wooc' + Row.Field, text:'Create Item on WooCommerce.', 
                        onclick:este.createItemOnWooCommerce});
                else{
                    items.push({id:this.baseid+'revisewooc' + Row.Field, text:'Revise Item on WooCoomerce.', 
                    onclick:este.reviseItemOnWooCommerce});
                    items.push({id:this.baseid+'removewooc' + Row.Field, text:'Remove Item on WooCoomerce.', 
                    onclick:este.removeItemOnWooCommerce});
                    items.push({id:this.baseid+'openwooc' + Row.Field, text:'Open WooCommerce Item.', 
                    onclick:este.openWooCItem});
                }
            }
            if(contextmenuopts.search("5")>=0)
            items.push({id:this.baseid+'searchwooc' + Row.Field, text:'Search on Google.', 
                onclick:este.searchOnGoogle
            });
            if(contextmenuopts.search("7")>=0)
            items.push({id:this.baseid+'imgtotxt' + Row.Field, text:'Text from Image', 
                onclick:este.getTextFromImage
            });
            if(contextmenuopts.search("8")>=0)
            items.push({id:this.baseid+'imgsource' + Row.Field, text:'Open Image Source', 
                onclick:este.openTextImageSource
            });
        return items;
    }

    getFirstPart(tableStructure, currentTableRow){
        let saveButtonStyle = {backgroundColor:this.state.needsbesaved?'red':'white'};
        return <div>
                <div className="div-table-row">
                        <Button
                            variant="outline-success"
                            title='Remove Item'
                            size="sm"
                            className="m-1"
                            onClick={this.deleteTableRow}
                        >
                            <img alt='' src={removeicon} width="20" />                            
                        </Button>
                        <Button
                                    variant="outline-success"
                                    title="Save Data"
                                    size="sm"
                                    className="m-1"
                                    onClick={this.updateTableRow}
                                    style={saveButtonStyle}
                        >
                            <img alt='' src={saveicon} width="20" />
                        </Button>
                        <Button
                            variant="outline-success"
                            title='Print Item'
                            size="sm"
                            className="m-1"
                            onClick={this.printTableRow}
                        >
                            <img alt='' src={printicon} width="20" />
                        </Button>
                        <Button
                                    variant="outline-success"
                                    title="Refresh Data"
                                    size="sm"
                                    className="m-1"
                                    onClick={this.refresh}
                        >
                            <img alt='' src={refreshicon} width="20" />
                        </Button>
                        <Button
                                    variant="outline-success"
                                    title="Clear Unsaved Data"
                                    size="sm"
                                    className="m-1"
                                    onClick={this.clearUnsaved}
                        >
                            Clear Unsaved
                        </Button>
                        <p>{this.state.message}</p>
                </div>
                        <h4>{this.props.NombreTabla.toUpperCase()}</h4>
                        <form>
                        {(function (cols, este){
                            let key;
                            let cont = 0;
                            let cont1 = 0;
                            let fields = [];
                            let fieldshead = [];
                            let fieldsfoot = [];
                            for(key in tableStructure) {
                                    if(cont === 0) fields = [];
                                    var Row = tableStructure[key];
                                    let CommentAtts = getCommentAtts(Row.Comment);
                                    let fieldAtts = {
                                        //id:este.baseid+Row.Field,
                                        id:Row.Field,
                                        type:getDataType(Row.Type),
                                        className:"form-control",
                                        disabled : CommentAtts['isnoteditable']?true:false,
                                        readOnly : CommentAtts['isreadonly']?true:false,
                                    };
                                    let combo = {comboname:CommentAtts['comboname'], params:CommentAtts['params']};
                                    let field; 
                                    let headername = CommentAtts['header']?CommentAtts['header']:Row.Field;
                                    if(combo.comboname){
                                            createCombodata(combo);
                                            fieldAtts['combo']=combo; 
                                            fieldAtts['thevalue']=currentTableRow[Row.Field];
                                            fieldAtts['field']=Row.Field;
                                            fieldAtts['onChange']=este.onChange;
                                            //fieldAtts['onAfterUpdate']=este.onChange;
                                            field = React.createElement('div',{key:key, className:"form-group"},
                                            React.createElement('label',{htmlFor:headername},headername),
                                            React.createElement(Dropdown,fieldAtts));
                                    }else{
                                            let inputtype = 'input';
                                            if(Row.Type.search('text')!== -1){
                                                inputtype = "textarea";
                                                fieldAtts['onDoubleClick']=este.textAreaAdjust;
                                            }
                                            if(Row.Type.search('tiny')!== -1 || Row.Type.search('bit')!== -1 || Row.Type.search('bool')!== -1)fieldAtts['type'] = "checkbox";
                                            fieldAtts['onChange']=este.onChangeField;
                                            fieldAtts['onBlur']=este.onBlur;
                                            additionalProperties(Row, fieldAtts,currentTableRow);
                                            field = React.createElement('div',{key:key, className:"form-group", style:CommentAtts['contextmenu']?{border:'3px solid rgba(0, 0, 0, 0.05)'}:{}},
                                            React.createElement('label',{htmlFor:headername},headername),
                                            React.createElement(inputtype,fieldAtts));
                                    }
                                    if(CommentAtts['isimage']){
                                        const ImageStyles = {
                                            width: 600,
                                            height: 600,
                                            border: 1,
                                        };
                                        let fieldAtts2={
                                            //id:este.baseid+Row.Key,
                                            id:Row.Key,
                                            style:ImageStyles
                                        };
                                        fieldAtts2['cloudName']="dleagle";
                                        fieldAtts2['publicId'] = currentTableRow[Row.Field];
                                        field = React.createElement('div',{key:key, className:"form-group"},
                                        React.createElement('label',{htmlFor:headername},headername),
                                        React.createElement('a',{href:currentTableRow[Row.Field], target:"_blank"},React.createElement(Image,fieldAtts2)));
                                    }
                                    if(CommentAtts['contextmenu']){
                                        //'copy'=0,'open'=1,'search'=2,'ebay'=3
                                        let contextmenuopts = CommentAtts['contextmenuopts'];
                                        field= 
                                        <MenuContext 
                                            key={key.concat('menucontext')}
                                            menucontext={{
                                                id:este.baseid+key + Row.Field + 'menucontext',
                                                items: este.getMenuContextItems(Row, este, currentTableRow, contextmenuopts)
                                            }}
                                            element={field}
                                        ></MenuContext>;
                                    }
                                    if(CommentAtts['location'] === 'head'){
                                        fieldshead.push(field);
                                    }
                                    else if(CommentAtts['location'] === 'foot'){
                                        fieldsfoot.push(field);
                                    }
                                    else {
                                        fields.push(field);
                                        cont = cont + 1;
                                    }
                                if(cont === 5 || cont1 === (Object.entries(currentTableRow).length - 1)){
                                    let col = React.createElement('div',{key:key, className:"div-table-col"},fields);
                                    cols.push(col);
                                    cont = 0;
                                }
                                cont1 = cont1 + 1;
                            }
                            let rowshead = React.createElement('div', {className:"div-table-row"},fieldshead);
                            let rowsbody = React.createElement('div', {className:"div-table-row"},cols);
                            let rowsfoot = React.createElement('div', {className:"div-table-row"},fieldsfoot);
                            let thetable = React.createElement('div', {className:"div-table"}, rowshead, rowsbody, rowsfoot);
                            return thetable;
                            })([],this)
                        }
                        </form>
        </div>
    }

    getMoreParts (tableStructure, currentTableRow, childtables, maintab){
        let grids = [];
        if (Object.keys(childtables).length !== 0){
            let key;
            for(key in childtables) {
                let tableCommentAtts=getCommentAtts(childtables[key].TABLE_COMMENT);
                let kindofGrid = tableCommentAtts['grid']?tableCommentAtts['grid']:'';
                let headerGrid = tableCommentAtts['header']?tableCommentAtts['header']:childtables[key].TABLE_NAME;
                let rowHeight = tableCommentAtts['hasimages']?200:50;
                let grid;
                if(kindofGrid==='file'){
                    grid = React.createElement(TableGrid,
                        {addNewTab:this.addNewTab, 
                        ConstraintName:childtables[key].CONSTRAINT_NAME, 
                        NombreTabla:childtables[key].TABLE_NAME, 
                        parent: currentTableRow['id'], 
                        titleTable: headerGrid,
                        rowHeight:200,
                        buttonsToCreate:"remove,refresh,upload,save",
                        ParentComment:childtables[key].TABLE_COMMENT,
                        getTextFromImage:this.getTextFromImage
                    });
                    maintab.push({ parent: '', name: headerGrid + ' Grid', content: grid});
                    grids.push(grid);
                    grid = React.createElement(ImageSelector,
                        {
                          ConstraintName:childtables[key].CONSTRAINT_NAME,
                          NombreTabla:childtables[key].TABLE_NAME,
                          parent: currentTableRow['id'],
                          titleTable: headerGrid,
                          buttonsToCreate:"remove,refresh,upload,remsel",
                        }
                    );
                }else{
                    let addbutton='';
                    if(childtables[key].TABLE_NAME === 'part_file') addbutton=',selpics';
                        grid = React.createElement(TableGrid,
                                    {
                                        addNewTab:this.addNewTab, 
                                        ConstraintName:childtables[key].CONSTRAINT_NAME, 
                                        NombreTabla:childtables[key].TABLE_NAME, 
                                        parent: currentTableRow['id'], 
                                        grandparent: this.props.grandparent?this.props.grandparent:currentTableRow['id'],
                                        titleTable: headerGrid, 
                                        buttonsToCreate:"save,add,remove,refresh" + addbutton,
                                        rowHeight:rowHeight,
                                        ParentComment:childtables[key].TABLE_COMMENT,
                                        getTextFromImage:this.getTextFromImage
                                    }
                    );
                }
                maintab.push({ parent: '', name: headerGrid, content: grid});
                grids.push(grid);
            }
        }
        return grids;
    }

    onSelect(index, lastindex, event){
        this.setState({tabIndex:index});
    }

    textAreaAdjust(e) {
        console.log('entra', e.target.style);
        e.target.style.height = "1px";
        setTimeout(function() {
            e.target.style.height = (e.target.scrollHeight)+"px";
        }, 1);
    }      

    render(){
        const {currentTableRow, childtables} = this.state; 
        const {tableStructure} = this; 
        const divStyles={width:'100%', height:'100%'};
        let firstPart = this.getFirstPart(tableStructure, currentTableRow);
        let firsttab = { parent: '', name: 'Head', content: firstPart };
        let thetabs = [firsttab];
        this.getMoreParts(tableStructure, currentTableRow, childtables, thetabs);
        return(
        <div id={'ElRecord'.concat(this.props.id)} style={divStyles}>
            {
            currentTableRow ?
            (
            Object.keys(currentTableRow).length !== 0 ?
            (
            <Tabs selectedIndex={this.state.tabIndex} onSelect={this.onSelect} style={{height:'100%'}} >
            <TabList style={{ border: '1px solid rgba(0, 0, 0, 0.25)', backgroundColor:'rgba(0, 0, 0, 0.035)'}}>
            {thetabs.map((tab, index) => {
                return <Tab key={tab.name.toString().concat(tab.parent)}>
                    <span title={tab.parent}>{tab.name}</span>
                    <span>{tab.name.toString().length < 3?"___":""}</span>
                    </Tab>;
                }
            )}
            </TabList>
            {thetabs.map((tab, index) =>
            <TabPanel 
                key={tab.name.toString().concat(tab.parent)} 
                forceRender={true} 
                style={{ width:"100%", height: 'calc(100% - 50px)', border: '1px solid rgba(0, 0, 0, 0.25)', overflowY: 'scroll'}}
            >
                {tab.content}
            </TabPanel>
            )}
            </Tabs>
                ):
                (
                    <div>
                        <br />
                        <p>Please Click on a TableRow...</p>
                    </div>
                )
            ) : 
            (
                    <div>
                        <br />
                        <p>Please Click on a TableRow...</p>
                    </div>
            )
            }
        </div>        
        );
    }
}

/*
            <div className="div-table">
                {maintab}
                {othertabs}
            </div>

*/