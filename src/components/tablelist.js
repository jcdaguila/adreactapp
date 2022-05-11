import React, { useEffect, useState, useRef } from "react";
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import TableRowDataService from "../services";
import TableGrid from "./grid";
import { Button } from 'react-bootstrap'; //Find Variants https://react-bootstrap.github.io/components/buttons/;
import { useAuth } from './auth/context/authContext';
import Topnav from "./topnav";
//import Reddit from "./reddit";

const TablesList = (props) => {
    const mounted = useRef(false);
    const { user } = useAuth();
    const [TableRows, setTableRows] = useState([]);
    const [tableName, settableName] = useState('');

    useEffect(() => {
        mounted.current = true;
        retrieveTableRows();
        return () => {
            mounted.current = false;
        };
    }, []);

    const retrieveTableRows = () => {
        TableRowDataService.getAll('listado')
            .then(response => {
                setTableRows(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    const setActiveTableRow = (thetableName) => {
        settableName(thetableName);
        let parameters = {
            addNewTab: addNewTab,
            NombreTabla: thetableName,
            titleTable: thetableName,
            buttonsToCreate: "save,add,remove,refresh",
            filters: '',
            ordered: 'DESC',
        }
        if (thetableName === 'file') {
            parameters.buttonsToCreate = "save,remove,refresh,upload,generate,showall,addtoproduct,clearunsaved";
            parameters.filters = 'assigned = 0';
            parameters.ordered = 'ASC';
            parameters.nogallery = true;
        }
        let thegrid = React.createElement(TableGrid, parameters);
        props.addNewTab({ parent: thetableName, name: thetableName.toString(), content: thegrid });
    }

    const addNewTab = (thetab) => {
        props.addNewTab(thetab);
    }

    return (
        <div className="ag-theme-alpine" style={{ "width": "100%", "height": 'calc(100% - 86px)', " overflow": 'hidden' }}>
                <p className='navbar-brand' style={{textAlign:'right'}}>
                    WebApp - Welcome {user.displayName || user.email}
                </p>
            <Topnav></Topnav>
            <AgGridReact
                //suppressTouch={false}
                modules={AllCommunityModules}
                pagination={true}
                rowData={TableRows}
                filter='true'>
                {(function () {
                    let AgColumn;
                    let AgAtts02 = {
                        suppressMovable: true,
                        key: 0,
                        field: 'TABLE_NAME',
                        resizable: true,
                        filter: "agTextColumnFilter"
                    }
                    AgAtts02['cellRendererFramework'] = function (params) {
                        return <Button style={{ width: '100%' }} variant="outline-primary" size="sm" to={"/" + params.value} onClick={() => setActiveTableRow(params.value)}>{params.value}</Button>
                    }
                    AgColumn = React.createElement('AgGridColumn', AgAtts02);
                    return AgColumn;
                })()
                }
            </AgGridReact>
        </div>
    );
}

export default TablesList;