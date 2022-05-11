import React from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import TableRowDataService from "../../services";
import {getCommentAtts, getCarouselSp} from "../functions";
import moment from "moment";
import CellsRenderer from "./CellsRenderer";
import { createCombodata, reverseString } from '../functions';
import TableRow from "../record";
import {Image} from 'cloudinary-react';

import { TextField } from "@material-ui/core";
import ReactDOM from "react-dom";
import MessageBox from "../messagebox";
import Axios from 'axios';
import GetImages from "../getimages";
import {Button} from 'react-bootstrap';
import Carousel from "../carousel";
import saveicon from '../../images/save.ico';
import removeicon from '../../images/removeicon.png';
import printicon from '../../images/printicon.png';
import addicon from '../../images/addicon.jpg';
import uploadicon from '../../images/uploadicon.jpg';
import refreshicon from '../../images/refreshicon.jpg';

const getDatePicker = () => {
  function Datepicker() {}
  Datepicker.prototype.init = function(params) {
      /*const fillZeros = (a) => {
          return (Number(a) < 10) ? '0' + a : a;
      }*/
      const getFormatedDate = (dateString ) => {
          /*
          const dateParse = new Date(dateString.split('/')[1]+'-' + dateString.split('/')[0]+'-'+dateString.split('/')[2]);
          const dd = dateParse.getDate();
          const mm = dateParse.getMonth() + 1; //January is 0!
          const yyyy = dateParse.getFullYear();
          console.log(dateString, yyyy + '-' + fillZeros(mm) + '-' + fillZeros(dd));
          return yyyy + '-' + fillZeros(mm) + '-' + fillZeros(dd);
          */
          return moment(dateString).format('MMM/DD/YYYY HH:mm');
      }
      this.textInput = React.createRef();
      const eInput = React.createElement(TextField, {
          type: "datetime",
          defaultValue: getFormatedDate(params.value),
          ref: this.textInput
      });
      this.div = document.createElement('div');
      this.div.className = "ag-cell-parent-append";
      ReactDOM.render(eInput, this.div);
  };
  Datepicker.prototype.getGui = function() {
      return this.div;
  };
  Datepicker.prototype.afterGuiAttached = function() {
      this.textInput.current.focus();
  };
  Datepicker.prototype.getValue = function() {
      return this.textInput.current.querySelector('input').value;
  };
  Datepicker.prototype.destroy = function() {};
  Datepicker.prototype.isPopup = function() {
      return false;
  };
  return Datepicker;
}

class Grid01 extends React.Component{
  constructor(props) {
    super(props);
    this.updateTable=this.updateTable.bind(this);
    this.updateTableinternal=this.updateTableinternal.bind(this);    
    this.removeAllTableRows = this.removeAllTableRows.bind(this);
    this.removeOneTableRow = this.removeOneTableRow.bind(this);
    this.addTableRows = this.addTableRows.bind(this);
    this.refreshInfo = this.refreshInfo.bind(this);
    this.refreshInfoPrev = this.refreshInfoPrev.bind(this);
    this.getTableStructure = this.getTableStructure.bind(this);
    this.retrieveTableRows = this.retrieveTableRows.bind(this);
    this.getTableInfo = this.getTableInfo.bind(this);
    this.dateFormatter = this.dateFormatter(this);
    this.onCellChange = this.onCellChange.bind(this);
    this.onRowSelected=this.onRowSelected.bind(this);
    this.addNewTab= this.addNewTab.bind(this);
    this.uploadImages = this.uploadImages.bind(this);
    this.createButtons = this.createButtons.bind(this);
    this.selectImages = this.selectImages.bind(this);
    this.handleSetValues= this.handleSetValues.bind(this);
    this.getTextFromImage = this.getTextFromImage.bind(this);
    this.editOnCloudinary = this.editOnCloudinary.bind(this);
    this.getTableCommentAtts = this.getTableCommentAtts.bind(this);
    this.createProduct = this.createProduct.bind(this);
    this.showAll = this.showAll.bind(this);
    this.addToProduct = this.addToProduct.bind(this);

    this.imgset = new Set();
    this.nodeid = 0;
    this.set = new Set();
    this.tableCommentAtts={};
    this.tableStructure={};
    this.productid='';
    this.imagesSelected=[];
    this.KeyField='';
    this.savedataid = '';
    this.baseid = '';

    this.state = {
      gridApi: null,
      gridColumnApi: null,
      modules: AllCommunityModules,
      rowSelection: 'single',
      pagination: true,
      rowData: [],
      frameworkComponents: {
        cellsRenderer: CellsRenderer
      },
      filter:'true',
      message: "",
      rowHeight:-1,
      showall:false,
      needsbesaved:false,
    };


    //this.sizeToFit = this.sizeToFit.bind(this);
    //this.autoSizeAll = this.autoSizeAll.bind(this)
  }

  onFirstDataRendered = (params) => {
    //if(this.state.gridColumnApi)this.state.gridColumnApi.autoSizeColumn('id', false);
  }

  onGridReady = (params) => {
      this.setState({    
        gridApi : params.api,
        gridColumnApi : params.columnApi
      });
  };

  onSelectionChanged = () => {
    //var selectedRows = this.gridApi.getSelectedRows();
    //console.log(selectedRows);
    //document.querySelector('#selectedRows').innerHTML = selectedRows.length === 1 ? selectedRows[0].athlete : '';
  };

  onRowDoubleClicked = () => {
    //var selectedRows = this.state.gridApi.getSelectedRows();
    //console.log(selectedRows);
    //document.querySelector('#selectedRows').innerHTML = selectedRows.length === 1 ? selectedRows[0].athlete : '';
  };
  
  onCellValueChanged(params) {
    this.set.add(params.node.id);
    document.getElementById(this.savedataid).style.backgroundColor='red';
  }

  onCellChange = () => {
    this.set.add(this.nodeid);
    document.getElementById(this.savedataid).style.backgroundColor='red';
  }

  onRowSelected = (params) => {
    if (!params.node.selected) return;
    //this.setState({nodeid : params.node.id}); 
    this.nodeid = params.node.id; 
  }

  componentDidMount(){
    this.getTableInfo();
    this.setState({
      rowHeight:this.props.rowHeight,
    });
    this.getTableCommentAtts();
    this.savedataid = this.props.NombreTabla+(this.props.parent?this.props.parent:'')+'savedata';
    this.baseid = this.props.NombreTabla+(this.props.parent?this.props.parent:'');
  }

  async getTableCommentAtts(){
    let data = {};
    await TableRowDataService.executeStoredProcedure(JSON.stringify({spname:'sp_gettablecomment', tablename:this.props.NombreTabla}))            
    .then(response => {
            data = response.data;
            this.tableCommentAtts = getCommentAtts(data[0].TABLE_COMMENT);
        })
    .catch(e=>{
            console.log(e);
    });
  }

//get structure and data from table
  async getTableInfo(){
    let TS = await this.getTableStructure();
    let TheKeyField = '';
    for(let field in TS){
      if(TS[field].Key === 'PRI'){
        TheKeyField = TS[field].Field;
      }
    }

    let data = await this.retrieveTableRows(this.state.showall);
    this.tableStructure = TS;
    this.KeyField = TheKeyField;
    this.setState({
      rowData: data,
    });
  }
//get data from table to fill grid
  async retrieveTableRows(showall){
        let data = {};
        let params = {};
        if(this.props.parent){
          params = { spname: 'sp_listChildRows', constraintname: this.props.ConstraintName, parent: this.props.parent };
        }else{
          params = { spname: 'sp_listTableRows', tablename: this.props.NombreTabla, showall: showall, filters:this.props.filters?this.props.filters:'', ordered:this.props.ordered?this.props.ordered:'DESC' };
        }
        await TableRowDataService.executeStoredProcedure(JSON.stringify(params))
          .then(response => {
            data = response.data;
          })
          .catch(e=>{
            console.log(e);
        });
        
        return data;
  }
// get structure from table to create grid headers
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
//Add new tab this order is sent in chain to the form parent.
addNewTab(thetab){
  this.props.addNewTab(thetab);    
}

//creates a new Item to the Grid
async addTableRows(){
    //this.props.history.push('/add');
    let data = {};
    if(this.props.parent){
      //parent means the table has foreign key with a parent table      
        await TableRowDataService.executeStoredProcedure(JSON.stringify({ spname: 'getNextChildRow', constraintname: this.props.ConstraintName, parent: this.props.parent }))
        .then(response => {
                data = response.data;
                this.refreshInfo();
                this.setState({
                  message: "Item Added successfully!"
              });
            })
        .catch(e=>{
                console.log(e);
        });
    }
    else{
      //If table has not form parent it creates a new item and opens a new tab to be filled out.   
      await TableRowDataService.executeStoredProcedure(JSON.stringify({ spname: 'getNextRow', tablename: this.props.NombreTabla, create: '1' }))   
      .then(response => {
              data = response.data;
              //this.props.history.push(`/${this.props.NombreTabla}/${data[0].v_Resultado}`);
              let thegrid = <TableRow refreshInfo={this.refreshInfo} addNewTab={this.addNewTab} NombreTabla = {this.props.NombreTabla} id = {data[0].v_Resultado}/>;
              this.props.addNewTab({parent: this.props.NombreTabla, name: data[0].v_Resultado, content: thegrid});
              this.setState({
                message: "Item Added successfully!"
            });
          })
      .catch(e=>{
              console.log(e);
      });
    }
  }

  async refreshInfoPrev(){
    if(this.set.size > 0)
    {    const result = await MessageBox.open({
          title: "Confirm",
          content: <p>There are not Saved Info, do You still want to refresh?(Not saved data will be lost)</p>,
          buttons: [
            { name: "Yes", handler: () => "yes" },
            { name: "No", handler: () => "no" }
          ]
        });
        if(result === 'yes'){
          this.set.clear();
          document.getElementById(this.savedataid).style.backgroundColor='white';
          this.refreshInfo();
        }
    }
    else this.refreshInfo();
}

  refreshInfo(){
    this.getTableInfo();
  }

  async removeAllTableRows(){
    const result = await MessageBox.open({
      title: "Confirm",
      content: <p>Do You want to remove All of them?</p>,
      buttons: [
        { name: "Yes", handler: () => "yes" },
        { name: "No", handler: () => "no" }
      ]
    });
    if(result === 'yes'){
      if(this.props.parent){
        TableRowDataService.deleteAllChild(this.props.NombreTabla, this.props.parent)
        .then(response => {
            this.refreshInfo();
            this.setState({
              message: "All The Items were removed successfully!"
          });        
        })
        .catch(e => {
            console.log(e);
        })
      }else{
        TableRowDataService.deleteAll(this.props.NombreTabla)
        .then(response => {
            this.refreshInfo();
            this.setState({
              message: "All The Items were removed successfully!"
          });        
        })
        .catch(e => {
            console.log(e);
        })

      }
    }
  }

  async removeOneTableRow(Field, value){
    const result = await MessageBox.open({
      title: "Confirm",
      content: <p>Do You want to remove it?</p>,
      buttons: [
        { name: "Yes", handler: () => "yes" },
        { name: "No", handler: () => "no" }
      ]
    });
    if(result === 'yes'){
      TableRowDataService.delete(Field, value, this.props.NombreTabla)
      .then(response => {
          this.refreshInfo();
          this.setState({
            message: "The Item was removed successfully!"
        });

      })
      .catch(e => {
          console.log(e);
      })
    }
  }

  updateTableinternal(){
    console.log(this.set);
    this.set.forEach( id => {
      console.log('id', id);
      console.log('data',this.state.gridApi.getRowNode(id).data);
      TableRowDataService.update(this.KeyField,this.state.gridApi.getRowNode(id).data[this.KeyField], this.state.gridApi.getRowNode(id).data, this.props.NombreTabla)
      .then(response=> {
        document.getElementById(this.savedataid).style.backgroundColor='white';
        })
      .catch(e=>{
            console.log(e);
        });
      }
    );
    // clear the set post update call
    this.set.clear();
}

  updateTable(){
    this.set.forEach( id => {
      TableRowDataService.update(this.KeyField,this.state.gridApi.getRowNode(id).data[this.KeyField], this.state.gridApi.getRowNode(id).data, this.props.NombreTabla)
      .then(response=> {
            document.getElementById(this.savedataid).style.backgroundColor='white';
            this.setState({
                message: "The TableRow was updated successfully!"
            });
        })
      .catch(e=>{
            console.log(e);
        });
      }
    );
    // clear the set post update call
    this.set.clear();
}
/*
  sizeToFit(){
    console.log(this.state.gridColumnApi);
    //if(this.state.gridApi)this.state.gridApi.sizeColumnsToFit();
    if(this.state.gridColumnApi)this.state.gridColumnApi.autoSizeColumn('id', false);
  }
  
  autoSizeAll(skipHeader){
    if(this.state.gridApi && this.state.gridColumnApi){
    var allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach(function (column) {
      allColumnIds.push(column.colId);
    });
  
    this.state.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
  }
  }
*/
dateFormatter(params) {
  return moment(params.value).format('MM/DD/YYYY HH:mm');
}

onClick(thetablename, id){
  let tablerow = <TableRow refreshInfo={this.refreshInfo} addNewTab={this.addNewTab} NombreTabla = {thetablename} id = {id} grandparent = {this.props.grandparent}/>;
  if(this.props.addNewTab)this.props.addNewTab({parent:thetablename, name: id.toString(), content: tablerow});
}

uploadImages = async () => {
  let images = this.imagesSelected.sort((a, b) => a.lastModified - b.lastModified);
  let i;
  let imagestogrid = [];
  let imagestocloud = [];
  for (i=0; i < images.length; i++)
  {
      let formData = new FormData();
      formData.append("file", images[i]);
      formData.append("upload_preset", "e6ek9kl0");
  
      await Axios.post("https://api.cloudinary.com/v1_1/dleagle/image/upload", formData)
          .then((response)=>{
            imagestocloud.push({url:response.data.secure_url});
          }
      );
  }
  for(i=0; i<imagestocloud.length; i++){
    let data;
    let parameters=this.props.NombreTabla==='file'
      ?{ spname: 'getNextRowFile', tablename: this.props.NombreTabla, url: encodeURIComponent(imagestocloud[i].url) }
      :{ spname: 'getNextChildRowFile', constraintname: this.props.ConstraintName, parent: this.props.parent, url: encodeURIComponent(imagestocloud[i].url) };
    await TableRowDataService.executeStoredProcedure(JSON.stringify(parameters))
    .then(response => {
            data = response.data;
            imagestogrid.push({id:data[0].v_Resultado, url:imagestocloud[i].url});
        })
    .catch(e=>{
            console.log(e);
    });
  }
  this.setState({
    message: "Images have been uploade successfully!"
  });
  this.refreshInfo();
};

handleSetValues(checkValue, setItemValue){
  if(checkValue){
      this.imgset.add(setItemValue);
  }
  else{
      this.imgset.delete(setItemValue);
  }
};

async selectImages()
{
    const result = await GetImages.open({
      title: "Mark the Check to the Images you need, then click Yes...",
      content: <p>Do You want to add Selected Items?</p>,
      buttons: [
        { name: "Yes", handler: () => "yes" },
        { name: "No", handler: () => "no" }
      ],
      ConstraintName:this.props.ConstraintName, 
      NombreTabla:this.props.NombreTabla, 
      parent: this.props.parent, 
      grandparent: this.props.grandparent,
      titleTable: this.props.titleTable,
      buttonsToCreate:'',//'retsel',
      handleSetValues:this.handleSetValues,
      refreshInfo:this.refreshInfo,
    });
    if(result === 'yes'){
      let data=[];
      this.imgset.forEach( async id => {
        let datarow = {
          "parent": this.props.parent,
          "fileid": id,
          "createdBy": "root@localhost",
        };
        data.push(datarow);
      });
      console.log(data);
      await TableRowDataService.create(data, this.props.NombreTabla)
      .then(response => {
              //data = response.data;
              console.log('Images Created.')
              this.refreshInfo();
          })
      .catch(e=>{
              console.log(e);
      });
      this.imgset.clear();
    }
}

async createProduct(){
  document.body.style.cursor = 'progress';
  this.updateTableinternal();
  await TableRowDataService.executeStoredProcedure(JSON.stringify({spname:'sp_createproductfromimages'}))            
  .then(response => {
    this.setState({
      message: "Product created successfully!"
    });
  })
  .catch(e=>{
          console.log(e);
  });
  this.refreshInfo();
  document.body.style.cursor = 'default';
}

async addToProduct(){
  document.body.style.cursor = 'progress';  
  console.log(this.productid);
  if(this.productid !== ''){
    this.updateTableinternal();
    await TableRowDataService.executeStoredProcedure(JSON.stringify({spname:'sp_addtoproductfromimages', productid:this.productid}))
    .then(response => {
      this.setState({
        message: "Images added to Product successfully!"
      });
    })
    .catch(e=>{
            console.log(e);
    });
    this.refreshInfo();  
  }
  document.body.style.cursor = 'default';
}

async showAll(){
  let data = await this.retrieveTableRows(!this.state.showall);
  this.setState({
    rowData: data,
    showall:!this.state.showall
  });
}

createButtons(){
  let saveButtonStyle = {backgroundColor:this.state.needsbesaved?'red':'white'};
  let buttonsToCreate = this.props.buttonsToCreate;
  let result = React.createElement('div',{},
  buttonsToCreate.includes('save')?React.createElement(Button,{id:this.props.NombreTabla+(this.props.parent?this.props.parent:'')+'savedata', variant:'outline-primary', title:'Save Data', size:'sm', className:"m-1", style:{saveButtonStyle}, onClick:this.updateTable},<img alt='' src={saveicon} width="20" />):null,
  buttonsToCreate.includes('add')?React.createElement(Button,{variant:'outline-primary', title:'Add Item', size:'sm', className:"m-1", onClick:this.addTableRows},<img alt='' src={addicon} width="20" />):null,
  buttonsToCreate.includes('remove')?React.createElement(Button,{variant:'outline-primary', title:'Remove All Items', size:'sm', className:"m-1", onClick:this.removeAllTableRows},<img alt='' src={removeicon} width="20" />):null,
  buttonsToCreate.includes('refresh')?React.createElement(Button,{variant:'outline-primary', title:'Refresh Grid', size:'sm', className:"m-1", onClick:this.refreshInfoPrev},<img alt='' src={refreshicon} width="20" />):null,
  buttonsToCreate.includes('upload')?React.createElement('input',{title:'Select Images', size:'sm', className:"m-1", type:'file', id:this.baseid+'files', multiple:true, onChange:(event)=>{this.imagesSelected = Array.from(event.target.files);}}):null,
  buttonsToCreate.includes('upload')?React.createElement(Button,{variant:'outline-primary', title:'Upload Images', size:'sm', className:"m-1", onClick:this.uploadImages},<img alt='' src={uploadicon} width="20" />):null,
  buttonsToCreate.includes('selpics')?React.createElement(Button,{variant:'outline-primary', title:'Select Pictures', size:'sm', className:"m-1", onClick:this.selectImages},<img alt='' src={saveicon} width="20" />,'Select Pictures'):null,
  buttonsToCreate.includes('showall')?React.createElement(Button,{variant:'outline-primary', title:'Show All Records', size:'sm', className:"m-1", onClick:this.showAll},this.state.showall?'Show 100 Last Records':'Show All Records'):null,
  buttonsToCreate.includes('generate')?React.createElement(Button,{variant:'outline-primary', title:'Create Product', size:'sm', className:"m-1", onClick:this.createProduct},'Create Product'):null,
  buttonsToCreate.includes('addtoproduct')?React.createElement('input',{title:'Enter Product ID', size:'sm', className:"m-1", id:this.baseid+"productid", placeholder:"Product Id", onChange:(event)=>{this.productid = event.target.value;}}):null,
  buttonsToCreate.includes('addtoproduct')?React.createElement(Button,{variant:'outline-primary', title:'Upload Images', size:'sm', className:"m-1", onClick:this.addToProduct},'<=Add to Product'):null,
   );
  return result;
}

async editOnCloudinary(data){
  let picurlname = data.fileidname?data.fileidname:data.name;
  picurlname = reverseString(picurlname);
  let pos = picurlname.search('/');
  if(pos > 0) picurlname = picurlname.substring(4, pos);
  picurlname = reverseString(picurlname);
  await navigator.clipboard.writeText(picurlname);
  window.open("https://cloudinary.com/console/media_library/folders");
}

createGrid(){
  const {rowData} = this.state;
  const {tableStructure} = this;
  return <div  className="ag-theme-alpine" style={{ "width":"100%", "height": 'calc(100% - 55px)'," overflow":'hidden' }}>
  {React.createElement('center', {style:{fontWeight:"bold"}},this.props.titleTable.toUpperCase())}
  {this.createButtons()}
  <p>{this.state.message}</p>
  <AgGridReact
      id={this.baseid+'ag'}
      context={this.state.context}
      modules={this.state.modules}
      pagination={this.state.pagination}
      rowSelection={this.state.rowSelection}
      //onSelectionChanged={this.onSelectionChanged.bind(this)}
      //onRowDoubleClicked={this.onRowDoubleClicked.bind(this)}
      onCellValueChanged={this.onCellValueChanged.bind(this)}
      onRowSelected={this.onRowSelected.bind(this)}
      rowData={rowData}
      components={ {datePicker : getDatePicker()} }
      frameworkComponents={this.state.frameworkComponents}
      filter={this.state.filter}
      onGridReady={this.onGridReady}
      onFirstDataRendered={this.onFirstDataRendered}
      paginationPageSize = {10}      
      rowHeight={this.tableCommentAtts['hasimages']?200:50}//</div>{this.state.rowHeight}
      suppressPropertyNamesCheck={true}
  >
      {(function (rows, este, params) {
              let key;
              let AgColumn;
              let cont = 0;
              for(key in tableStructure) {
                  var Row = tableStructure[key];
                  let CommentAtts = getCommentAtts(Row.Comment);
                  let headername = CommentAtts['header']?CommentAtts['header']:Row.Field;
                  let AgAtts01={
                    id:este.baseid+Row.Field+'Field',
                    suppressMovable:true,
                    key:key,
                    field:Row.Field,
                    headerName:headername,
                    enableFilter:true,
                    enableSorting:true,
                    editable:CommentAtts['isnoteditable']?false:true,
                    resizable:true,
                    filter:"agTextColumnFilter",
                    sortable: true,
                    hide: (Row.Field === 'parent' || CommentAtts['hide'])?true:false
                  };
                  let AgAtts02={
                    id:este.baseid+Row.Field+'Field',
                    suppressMovable:true,
                    key:key,
                    field:Row.Field,
                    headerName:headername,
                    resizable:true,
                    filter:"agTextColumnFilter",
                    sortable: true,
                  }
                  if(cont === 0){
                    let opt = este.props.rowHeight===200?true:false;
                    AgAtts02['cellRendererFramework']=function(params) {
                      let spaces = '___';
                      return <div className={opt?"btn-group-vertical":""}>
                      <Button variant="outline-danger" title='Delete Item' size="sm" onClick={()=>este.removeOneTableRow(params.colDef.field, params.value)}>X</Button>
                      {!opt?<label style={{color:"white"}}>{spaces}</label>:''}
                      <Button variant="outline-primary" title='Open Item' size="sm" onClick={()=>este.onClick(este.props.NombreTabla, params.value)}>{params.value}</Button>
                      {/*opt?<Button variant="outline-primary" title="Image to Text" size="sm" onClick={()=>este.getTextFromImage(params.value)}>I2T</Button>:''*/}
                      {opt?<Button variant="outline-primary" title="Edit on Cloudinary" size="sm" onClick={()=>este.editOnCloudinary(params.data)}>Edt</Button>:''}
                      </div>
                    }
                    AgAtts02['pinned']='left';
                    AgAtts02['width']=opt?75:110;
                    AgColumn = React.createElement('AgGridColumn',AgAtts02);
                  }else{
                    let combo = {comboname:CommentAtts['comboname'], params:CommentAtts['params']};//getComboName(Row.Comment);
                    if(combo.comboname){
                      createCombodata(combo, Row.Comment);
                      AgAtts01['cellEditor']='cellsRenderer';
                      AgAtts01['cellEditorParams']= 
                      { 
                        onCellChange: este.onCellChange, 
                        combo: combo,
                        field: Row.Field,
                      };
                      AgAtts01['valueGetter']=function (params) {
                        return (params.data[params.colDef.field])?params.data[params.colDef.field]:params.data[params.colDef.field.replace('name','')];
                      };
                      AgAtts01['valueSetter']=function (params) {
                        return true;
                      };
                      AgAtts01['field']=Row.Field + 'name';
                    }
                    if(Row.Type.search('date')!== -1 || Row.Type.search('time')!== -1){
                      AgAtts01['cellEditor']='datePicker';
                      AgAtts01['cellRenderer']= (params) => {
                          return moment(params.value).format('MMM/DD/YYYY HH:mm');
                      };
                      AgAtts01['valueFormatter']= function name(params) {
                        return moment(params.value).format('MMM/DD/YYYY HH:mm');
                      };
                    }
                    if(Row.Type.search('tiny')!== -1 || Row.Type.search('bit')!== -1 || Row.Type.search('bool')!== -1){
                      AgAtts01['cellRenderer'] = function(params) { 
                        var input = document.createElement('input');
                        input.type="checkbox";
                        let checkvalue = params.value.data?params.value.data[0]:params.value;
                        input.checked=checkvalue;
                        input.addEventListener('click', function (event) {
                            checkvalue = !checkvalue;
                            params.node.data[params.colDef.field] = checkvalue;
                            //este.setState({nodeid : params.node.id});
                            este.nodeid = params.node.id;
                            este.onCellChange();
                        });
                        return input;
                      }
                    }
                    if(Row.Type.search('text')!== -1){
                      AgAtts01['cellEditor'] = 'agLargeTextCellEditor';
                    }
                    if(CommentAtts['isimage']){
                      AgAtts01['cellRendererFramework']=function(params) {
                        //return ;
                        return este.props.nogallery?React.createElement('a',{href:params.value, target:"_blank"},React.createElement(Image, {style:{width:300}, cloudName:"dleagle", publicId:params.value}))
                        :React.createElement(Image, {style:{width:300}, cloudName:"dleagle", publicId:params.value, 
                          onClick:async function(params01){
                            let carouselsp = getCarouselSp(este.props.ParentComment);
                            await Carousel.open({
                              title: "Image Carousel",
                              buttons: [
                                { name: "Close", handler: () => "close" },
                              ],
                              carouselsp:carouselsp,
                              parentid:este.props.parent,
                              picid:params.data.fileid?params.data.fileid:params.data.id,
                            });    
                          }
                        });                    
                      }
                    }
                    AgColumn = React.createElement('AgGridColumn',AgAtts01);
                  }
                  rows.push(AgColumn);
                  cont = cont +1;
                }
                return rows;
        })([], this, this.params)
      }    
  </AgGridReact>
</div>
}

getTextFromImage(picid){
  this.props.getTextFromImage(picid);
}
render(){
  const {rowData} = this.state;
  if(rowData){
  //if(rowData.length > 0){
      let elementGrid = this.createGrid();
      return elementGrid;
 /* }else{
    return (<div></div>)
  }*/
  
  }else{
    return (<div></div>)
  }
}
};

export default Grid01;