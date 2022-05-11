import React, { useState, useEffect } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import TableRowDataService from "../../services";
import { getCommentAtts, getCarouselSp } from "../functions";
import moment from "moment";
import CellsRenderer from "./CellsRenderer";
import { createCombodata, reverseString } from '../functions';
import TableRow from "../record";
import { Image } from 'cloudinary-react';

import { TextField } from "@material-ui/core";
import ReactDOM from "react-dom";
import MessageBox from "../messagebox";
import Axios from 'axios';
import GetImages from "../getimages";
import { Button } from 'react-bootstrap';
import Carousel from "../carousel";
import saveicon from '../../images/save.ico';
import removeicon from '../../images/removeicon.png';
import printicon from '../../images/printicon.png';
import addicon from '../../images/addicon.jpg';
import uploadicon from '../../images/uploadicon.jpg';
import refreshicon from '../../images/refreshicon.jpg';

import beepsuccess from '../../audios/success.wav';
import beepwrong from '../../audios/wrong.wav';
var sndsuccess = new Audio(beepsuccess); // buffers automatically when created
var sndwrong = new Audio(beepwrong); // buffers automatically when created

const getDatePicker = () => {
  function Datepicker() { }
  Datepicker.prototype.init = function (params) {
    const getFormatedDate = (dateString) => {
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
  Datepicker.prototype.getGui = function () {
    return this.div;
  };
  Datepicker.prototype.afterGuiAttached = function () {
    this.textInput.current.focus();
  };
  Datepicker.prototype.getValue = function () {
    return this.textInput.current.querySelector('input').value;
  };
  Datepicker.prototype.destroy = function () { };
  Datepicker.prototype.isPopup = function () {
    return false;
  };
  return Datepicker;
}

const TableGrid = (props) => {
  const {NombreTabla, parent, ParentComment, filters, ordered, ConstraintName, grandparent, titleTable, buttonsToCreate, rowHeight, nogallery} = props;
  //var set = new Set();
  let imagesSelected = [];

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [modules, setModules] = useState(AllCommunityModules);
  const [rowSelection, setRowSelection] = useState('single');
  const [pagination, setPagination] = useState(true);
  const [rowData, setRowData] = useState([]);
  const [frameworkComponents, setFrameworkComponents] = useState({ cellsRenderer: CellsRenderer });
  const [filter, setFilter] = useState('true');
  const [message, setMessage] = useState("");
  const [showall, setShowAll] = useState(false);
  const [needsbesaved, setNeedsBeSaved] = useState(false);
  const [tableStructure, setTableStructure] = useState({});
  const [KeyField, setKeyField] = useState('');
  const [savedataid, setSaveDataId] = useState('');
  const [baseid, setBaseId] = useState('');
  const [tableCommentAtts, setTableCommentAtts] = useState({});
  const [updateset, setUpdateSet] = useState(new Set());
  const [imgset, setImgSet] = useState(new Set());
  const [productid, setProductId] = useState('');
  const [nodeid, setNodeId] = useState(0);

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onCellValueChanged = (params) => {
    console.log('onCellValueChange, params.node.id', params.node.id);
    const newSet = new Set(updateset);
    newSet.add(params.node.id);
    setUpdateSet(newSet);
    setNeedsBeSaved(true);
  }

  const onCellChange = (newnodeid) => {
    console.log('onCellChange, nodeid', newnodeid);
    const newSet = new Set(updateset);
    newSet.add(newnodeid);
    setUpdateSet(newSet);
    setNeedsBeSaved(true);
  }

  const onRowSelected = (params) => {
    if (!params.node.selected) return;
    setNodeId(params.node.id);
  }

  useEffect(() => {
    getTableStructure();
    getTableCommentAtts();
    setSaveDataId(NombreTabla + (parent ? parent : '') + 'savedata');
    setBaseId(NombreTabla + (parent ? parent : ''));
    getTableInfo();
  }, []);

  useEffect(() => {
    let savedatabtn = document.getElementById(savedataid);
    if(savedatabtn){savedatabtn.style.backgroundColor = needsbesaved?'red':'white';};
  }, [needsbesaved]);

  const getTableCommentAtts = async () => {
    let data = {};
    await TableRowDataService.executeStoredProcedure(JSON.stringify({ spname: 'sp_gettablecomment', tablename: NombreTabla }))
      .then(response => {
        data = response.data;
        setTableCommentAtts(getCommentAtts(data[0].TABLE_COMMENT));
      })
      .catch(e => {
        console.log(e);
      });
  }

  //get structure and data from table
  const getTableInfo = async () => {
    let data = await retrieveTableRows(showall);
    setRowData(data);
  }

  //get data from table to fill grid
  const retrieveTableRows = async (showall) => {
    let data = {};
    let params = {};
    if (parent) {
      params = { spname: 'sp_listChildRows', constraintname: ConstraintName, parent: parent };
    } else {
      params = { spname: 'sp_listTableRows', tablename: NombreTabla, showall: showall, filters: filters ? filters : '', ordered: ordered ? ordered : 'DESC' };
    }
    await TableRowDataService.executeStoredProcedure(JSON.stringify(params))
      .then(response => {
        data = response.data;
      })
      .catch(e => {
        console.log(e);
      });

    return data;
  }

  // get structure from table to create grid headers
  const getTableStructure = async () => {
    let data = {};
    await TableRowDataService.getTableStructure(NombreTabla)
      .then(response => {
        let TS = response.data;
        let TheKeyField = '';
        for (let field in TS) {
          if (TS[field].Key === 'PRI') {
            TheKeyField = TS[field].Field;
          }
        }
        setTableStructure(TS);
        setKeyField(TheKeyField);
      })
      .catch(e => {
        console.log(e);
      });
    return data;
  }

  //Add new tab this order is sent in chain to the form parent.
  const addNewTab = (thetab) => {
    props.addNewTab(thetab);
  }

  //creates a new Item to the Grid
  const addTableRows = async () => {
    let data = {};
    if (parent) {
      //parent means the table has foreign key with a parent table      
      await TableRowDataService.executeStoredProcedure(JSON.stringify({ spname: 'getNextChildRow', constraintname: ConstraintName, parent: parent }))
        .then(response => {
          data = response.data;
          refreshInfo();
          setMessage("Item Added successfully!");
        })
        .catch(e => {
          console.log(e);
        });
    }
    else {
      //If table has not form parent it creates a new item and opens a new tab to be filled out.   
      await TableRowDataService.executeStoredProcedure(JSON.stringify({ spname: 'getNextRow', tablename: NombreTabla, create: '1' }))
        .then(response => {
          data = response.data;
          let thegrid = <TableRow refreshInfo={refreshInfo} addNewTab={addNewTab} NombreTabla={NombreTabla} id={data[0].v_Resultado} />;
          props.addNewTab({ parent: NombreTabla, name: data[0].v_Resultado, content: thegrid });
          setMessage("Item Added successfully!");
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  const refreshInfoPrev = async () => {
    if (updateset.size > 0) {
      const result = await MessageBox.open({
        title: "Confirm",
        content: <p>There are not Saved Info, do You still want to refresh?(Not saved data will be lost)</p>,
        buttons: [
          { name: "Yes", handler: () => "yes" },
          { name: "No", handler: () => "no" }
        ]
      });
      if (result === 'yes') {
        refreshInfo();
        let updatesetAux = new Set(updateset);
        updatesetAux.clear();
        setUpdateSet(updatesetAux);
        setNeedsBeSaved(false);
      }
    }
    else refreshInfo();
  }

  const refreshInfo = () => {
    getTableInfo();
  }

  const removeAllTableRows = async () => {
    const result = await MessageBox.open({
      title: "Confirm",
      content: <p>Do You want to remove All of them?</p>,
      buttons: [
        { name: "Yes", handler: () => "yes" },
        { name: "No", handler: () => "no" }
      ]
    });
    if (result === 'yes') {
      if (parent) {
        TableRowDataService.deleteAllChild(NombreTabla, parent)
          .then(response => {
            refreshInfo();
            setMessage("All The Items were removed successfully!");
          })
          .catch(e => {
            console.log(e);
          })
      } else {
        TableRowDataService.deleteAll(NombreTabla)
          .then(response => {
            refreshInfo();
            setMessage("All The Items were removed successfully!");
          })
          .catch(e => {
            console.log(e);
          })

      }
    }
  }

  const removeOneTableRow = async (Field, value) => {
    const result = await MessageBox.open({
      title: "Confirm",
      content: <p>Do You want to remove it?</p>,
      buttons: [
        { name: "Yes", handler: () => "yes" },
        { name: "No", handler: () => "no" }
      ]
    });
    if (result === 'yes') {
      TableRowDataService.delete(Field, value, NombreTabla)
        .then(response => {
          refreshInfo();
          setMessage("The Item was removed successfully!");
        })
        .catch(e => {
          console.log(e);
        })
    }
  }

  const updateTableinternal = async() => {
    updateset.forEach(async id => {
      await TableRowDataService.update(KeyField, gridApi.getRowNode(id).data[KeyField], gridApi.getRowNode(id).data, NombreTabla)
      .then(response => {
      })
      .catch(e => {
          console.log(e);
      });
    }
    );
  }

  const updateTableinternalFinish = () => {
    setNeedsBeSaved(false);
    // clear the set post update call
    let updatesetAux = new Set(updateset);
    updatesetAux.clear();
    setUpdateSet(updatesetAux);
  }

  const updateTable = () => {
    console.log('updateset', updateset);
    updateset.forEach(async (id) => {
      await TableRowDataService.update(KeyField, gridApi.getRowNode(id).data[KeyField], gridApi.getRowNode(id).data, NombreTabla)
        .then(response => {
        })
        .catch(e => {
          console.log(e);
        });
    }
    );
    setNeedsBeSaved(false);
    setMessage("The TableRow was updated successfully!");
    // clear the set post update call
    let updatesetAux = new Set(updateset);
    updatesetAux.clear();
    setUpdateSet(updatesetAux);
  }

  const dateFormatter = (params) => {
    return moment(params.value).format('MM/DD/YYYY HH:mm');
  }

  const onClick = (thetablename, id) => {
    let tablerow = <TableRow refreshInfo={refreshInfo} addNewTab={addNewTab} NombreTabla={thetablename} id={id} grandparent={grandparent} />;
    if (props.addNewTab) props.addNewTab({ parent: thetablename, name: id.toString(), content: tablerow });
  }

  const uploadImages = async () => {
    let images = imagesSelected.sort((a, b) => a.lastModified - b.lastModified);
    let i;
    let imagestogrid = [];
    let imagestocloud = [];
    for (i = 0; i < images.length; i++) {
      let formData = new FormData();
      formData.append("file", images[i]);
      formData.append("upload_preset", process.env.REACT_APP_CLPRESET);

      await Axios.post("https://api.cloudinary.com/v1_1/dleagle/image/upload", formData)
        .then((response) => {
          imagestocloud.push({ url: response.data.secure_url });
        }
        );
    }
    for (i = 0; i < imagestocloud.length; i++) {
      let data;
      let parameters = NombreTabla === 'file'
        ? { spname: 'getNextRowFile', tablename: NombreTabla, url: encodeURIComponent(imagestocloud[i].url) }
        : { spname: 'getNextChildRowFile', constraintname: ConstraintName, parent: parent, url: encodeURIComponent(imagestocloud[i].url) };
      await TableRowDataService.executeStoredProcedure(JSON.stringify(parameters))
        .then(response => {
          data = response.data;
          imagestogrid.push({ id: data[0].v_Resultado, url: imagestocloud[i].url });
        })
        .catch(e => {
          console.log(e);
          setMessage(e.message);
        });
    }
    setMessage("Images have been uploade successfully!");
    sndsuccess.play();
    refreshInfo();
  };

  const handleSetValues = (checkValue, setItemValue) => {
    let imgsetAux = new Set(imgset);
    if (checkValue) {
      imgsetAux.add(setItemValue);
    }
    else {
      imgsetAux.delete(setItemValue);
    }
    setImgSet(imgsetAux);
  };

  const selectImages = async () => {
    const result = await GetImages.open({
      title: "Mark the Check to the Images you need, then click Yes...",
      content: <p>Do You want to add Selected Items?</p>,
      buttons: [
        { name: "Yes", handler: () => "yes" },
        { name: "No", handler: () => "no" }
      ],
      ConstraintName: ConstraintName,
      NombreTabla: NombreTabla,
      parent: parent,
      grandparent: grandparent,
      titleTable: titleTable,
      buttonsToCreate: '',//'retsel',
      handleSetValues: handleSetValues,
      refreshInfo: refreshInfo,
    });
    if (result === 'yes') {
      let data = [];
      imgset.forEach(async id => {
        let datarow = {
          "parent": parent,
          "fileid": id,
          "createdBy": "root@localhost",
        };
        await data.push(datarow);
      });
      await TableRowDataService.create(data, NombreTabla)
        .then(response => {
          refreshInfo();
        })
        .catch(e => {
          setMessage(e.message);
        });
      let imgsetAux = new Set(imgset);
      imgsetAux.clear();
      setImgSet(imgsetAux);
    }
  }

  const createProduct = async () => {
    document.body.style.cursor = 'progress';
    if (needsbesaved) {
      setMessage("Unsaved data, Click on 'Save' or 'Refresh to Clear' button, to continue.");
      sndwrong.play();
    }
    else {
      //await updateTableinternal();
        await TableRowDataService.executeStoredProcedure(JSON.stringify({ spname: 'sp_createproductfromimages' }))
        .then(response => {
          if (response.data[0].Rpta === 'Success') {
            setMessage("Product created successfully!");
            sndsuccess.play();
          } else {
            setMessage(response.data[0].Rpta);
            sndwrong.play();
          }
        })
        .catch(e => {
          setMessage(e.message);
          sndwrong.play();
        });
      refreshInfo();
    }
    document.body.style.cursor = 'default';
  }

  const addToProduct = async () => {
    document.body.style.cursor = 'progress';
    console.log('Que pasa:', productid);
    if (productid !== '') {
      if (needsbesaved) {
        setMessage("Unsaved info, Click on 'Save' or 'Clear Unsaved' button, to continue.");
        sndwrong.play();
      }
      else {
          //updateTableinternal();
          await TableRowDataService.executeStoredProcedure(JSON.stringify({ spname: 'sp_addtoproductfromimages', productid: productid }))
            .then(response => {
              if (response.data[0].Rpta === 'Success') {
                setMessage("Images added to Product successfully!");
                sndsuccess.play();
              }else{
                setMessage(response.data[0].Rpta);
                sndwrong.play();
              }
            })
            .catch(e => {
              setMessage(e.message);
              sndwrong.play();
            });
          refreshInfo();
      }
    }
    document.body.style.cursor = 'default';
  }

  const showAll = async () => {
    let data = await retrieveTableRows(!showall);
    setRowData(data);
    setShowAll(!showall);
  }

  const createButtons = () => {
    let saveButtonStyle = { backgroundColor: needsbesaved ? 'red' : 'white' };
    let result = React.createElement('div', {},
      buttonsToCreate.includes('save') ? React.createElement(Button, { id: NombreTabla + (parent ? parent : '') + 'savedata', variant: 'outline-primary', title: 'Save Data', size: 'sm', className: "m-1", style: { saveButtonStyle }, onClick: updateTable }, <img alt='' src={saveicon} width="20" />) : null,
      buttonsToCreate.includes('add') ? React.createElement(Button, { variant: 'outline-primary', title: 'Add Item', size: 'sm', className: "m-1", onClick: addTableRows }, <img alt='' src={addicon} width="20" />) : null,
      buttonsToCreate.includes('remove') ? React.createElement(Button, { variant: 'outline-primary', title: 'Remove All Items', size: 'sm', className: "m-1", onClick: removeAllTableRows }, <img alt='' src={removeicon} width="20" />) : null,
      buttonsToCreate.includes('refresh') ? React.createElement(Button, { variant: 'outline-primary', title: 'Refresh Grid', size: 'sm', className: "m-1", onClick: refreshInfoPrev }, <img alt='' src={refreshicon} width="20" />) : null,
      buttonsToCreate.includes('upload') ? React.createElement('input', { title: 'Select Images', size: 'sm', className: "m-1", type: 'file', id: baseid + 'files', multiple: true, onChange: (event) => { imagesSelected = Array.from(event.target.files); } }) : null,
      buttonsToCreate.includes('upload') ? React.createElement(Button, { variant: 'outline-primary', title: 'Upload Images', size: 'sm', className: "m-1", onClick: uploadImages }, <img alt='' src={uploadicon} width="20" />) : null,
      buttonsToCreate.includes('selpics') ? React.createElement(Button, { variant: 'outline-primary', title: 'Select Pictures', size: 'sm', className: "m-1", onClick: selectImages }, <img alt='' src={saveicon} width="20" />, 'Select Pictures') : null,
      buttonsToCreate.includes('showall') ? React.createElement(Button, { variant: 'outline-primary', title: 'Show All Records', size: 'sm', className: "m-1", onClick: showAll }, showall ? 'Show 100 Last Records' : 'Show All Records') : null,
      buttonsToCreate.includes('generate') ? React.createElement(Button, { variant: 'outline-primary', title: 'Create Product', size: 'sm', className: "m-1", onClick: createProduct }, 'Create Product') : null,
      buttonsToCreate.includes('addtoproduct') ? React.createElement('input', { title: 'Enter Product ID', size: 'sm', className: "m-1", id: baseid + "productid", placeholder: "Product Id", onChange: (event) => { setProductId(event.target.value); } }) : null,
      buttonsToCreate.includes('addtoproduct') ? React.createElement(Button, { variant: 'outline-primary', title: 'Upload Images', size: 'sm', className: "m-1", onClick: addToProduct }, '<=Add to Product') : null,
    );
    return result;
  }

  const editOnCloudinary = async (data) => {
    let picurlname = data.fileidname ? data.fileidname : data.name;
    picurlname = reverseString(picurlname);
    let pos = picurlname.search('/');
    if (pos > 0) picurlname = picurlname.substring(4, pos);
    picurlname = reverseString(picurlname);
    await navigator.clipboard.writeText(picurlname);
    window.open("https://cloudinary.com/console/media_library/folders");
  }


  const createGrid = () => {
    //if (rowData.length > 0) {
      return <div className="ag-theme-alpine" style={{ "width": "100%", "height": 'calc(100% - 55px)', " overflow": 'hidden' }}>
        {React.createElement('center', { style: { fontWeight: "bold" } }, titleTable.toUpperCase())}
        {createButtons()}
        <p>{message}</p>
        <AgGridReact
          id={baseid + 'ag'}
          modules={modules}
          pagination={pagination}
          rowSelection={rowSelection}
          //onSelectionChanged={onSelectionChanged.bind(this)}
          //onRowDoubleClicked={onRowDoubleClicked.bind(this)}
          onCellValueChanged={onCellValueChanged.bind(this)}
          onRowSelected={onRowSelected.bind(this)}
          rowData={rowData}
          components={{ datePicker: getDatePicker() }}
          frameworkComponents={frameworkComponents}
          filter={filter}
          onGridReady={onGridReady}
          paginationPageSize={10}
          rowHeight={tableCommentAtts['hasimages'] ? 200 : 50}
          suppressPropertyNamesCheck={true}
        >
          {(function (rows) {
            let key;
            let AgColumn;
            let cont = 0;
            for (key in tableStructure) {
              var Row = tableStructure[key];
              let CommentAtts = getCommentAtts(Row.Comment);
              let headername = CommentAtts['header'] ? CommentAtts['header'] : Row.Field;
              let AgAtts01 = {
                id: baseid + Row.Field + 'Field',
                suppressMovable: true,
                key: key,
                field: Row.Field,
                headerName: headername,
                enableFilter: true,
                enableSorting: true,
                editable: CommentAtts['isnoteditable'] ? false : true,
                resizable: true,
                filter: "agTextColumnFilter",
                sortable: true,
                hide: (Row.Field === 'parent' || CommentAtts['hide']) ? true : false
              };
              let AgAtts02 = {
                id: baseid + Row.Field + 'Field',
                suppressMovable: true,
                key: key,
                field: Row.Field,
                headerName: headername,
                resizable: true,
                filter: "agTextColumnFilter",
                sortable: true,
              }
              if (cont === 0) {
                let opt = rowHeight === 200 ? true : false;
                AgAtts02['cellRendererFramework'] = function (params) {
                  let spaces = '___';
                  return <div className={opt ? "btn-group-vertical" : ""}>
                    <Button variant="outline-danger" title='Delete Item' size="sm" onClick={() => removeOneTableRow(params.colDef.field, params.value)}>X</Button>
                    {!opt ? <label style={{ color: "white" }}>{spaces}</label> : ''}
                    <Button variant="outline-primary" title='Open Item' size="sm" onClick={() => onClick(NombreTabla, params.value)}>{params.value}</Button>
                    {opt ? <Button variant="outline-primary" title="Edit on Cloudinary" size="sm" onClick={() => editOnCloudinary(params.data)}>Edt</Button> : ''}
                  </div>
                }
                AgAtts02['pinned'] = 'left';
                AgAtts02['width'] = opt ? 75 : 110;
                AgColumn = React.createElement('AgGridColumn', AgAtts02);
              } else {
                let combo = { comboname: CommentAtts['comboname'], params: CommentAtts['params'] };//getComboName(Row.Comment);
                if (combo.comboname) {
                  createCombodata(combo, Row.Comment);
                  AgAtts01['cellEditor'] = 'cellsRenderer';
                  AgAtts01['cellEditorParams'] =
                  {
                    onCellChange: onCellChange,
                    combo: combo,
                    field: Row.Field,
                  };
                  AgAtts01['valueGetter'] = function (params) {
                    return (params.data[params.colDef.field]) ? params.data[params.colDef.field] : params.data[params.colDef.field.replace('name', '')];
                  };
                  AgAtts01['valueSetter'] = function (params) {
                    return true;
                  };
                  AgAtts01['field'] = Row.Field + 'name';
                }
                if (Row.Type.search('date') !== -1 || Row.Type.search('time') !== -1) {
                  AgAtts01['cellEditor'] = 'datePicker';
                  AgAtts01['cellRenderer'] = (params) => {
                    return moment(params.value).format('MMM/DD/YYYY HH:mm');
                  };
                  AgAtts01['valueFormatter'] = function name(params) {
                    return moment(params.value).format('MMM/DD/YYYY HH:mm');
                  };
                }
                if (Row.Type.search('tiny') !== -1 || Row.Type.search('bit') !== -1 || Row.Type.search('bool') !== -1) {
                  AgAtts01['cellRenderer'] = function (params) {
                    var input = document.createElement('input');
                    input.type = "checkbox";
                    let checkvalue = params.value.data ? params.value.data[0] : params.value;
                    input.checked = checkvalue;
                    input.addEventListener('click', function (event) {
                      checkvalue = !checkvalue;
                      params.node.data[params.colDef.field] = checkvalue;
                      setNodeId(params.node.id);
                      onCellChange(params.node.id);
                    });
                    return input;
                  }
                }
                if (Row.Type.search('text') !== -1) {
                  AgAtts01['cellEditor'] = 'agLargeTextCellEditor';
                }
                if (CommentAtts['isimage']) {
                  AgAtts01['cellRendererFramework'] = function (params) {
                    //return ;
                    return nogallery ? React.createElement('a', { href: params.value, target: "_blank" }, React.createElement(Image, { style: { width: 300 }, cloudName: "dleagle", publicId: params.value }))
                      : React.createElement(Image, {
                        style: { width: 300 }, cloudName: "dleagle", publicId: params.value,
                        onClick: async function (params01) {
                          let carouselsp = getCarouselSp(ParentComment);
                          await Carousel.open({
                            title: "Image Carousel",
                            buttons: [
                              { name: "Close", handler: () => "close" },
                            ],
                            carouselsp: carouselsp,
                            parentid: parent,
                            picid: params.data.fileid ? params.data.fileid : params.data.id,
                          });
                        }
                      });
                  }
                }
                AgColumn = React.createElement('AgGridColumn', AgAtts01);
              }
              rows.push(AgColumn);
              cont = cont + 1;
            }
            return rows;
          })([])
          }
        </AgGridReact>
      </div>
    //}else{return <></>}
  }

  return rowData? createGrid() : <div></div>;
};

export default TableGrid;