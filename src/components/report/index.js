import React from 'react';
//import IframeResizer from 'iframe-resizer-react';

class Report extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            thevalue : props.thevalue,
            dataRow : {}
        }
   
    }

    componentDidMount(){
    };
    
render(){
    return(
        <div className="div-table" style={{ "height": 900, "width" : "100%" }}>
        <iframe
            title= {"Report" + this.props.NombreTabla + this.props.id }
            src="http://www.candywhite.space/Reports/report/ReportQCY&Num_rqc=MI2020-03774&rs:Embed=true"
            //src="http://www.candywhite.space/Reports/report/ReportQCY&rs:Embed=true&Num_rqc=MI2020-03774&rs:Command=Render&rs:Format=HTML4.0&rc:Toolbar=false&dsu:DataSourceName=SGSERVER\reportuser&dsp:DataSourceName=AscSky945"
            //src="http://sgserver/Reports/report/ReportQCA?rs:Embed=true&Num_rqc=MI2021-00004"
            frameBorder="0" 
            height="900" 
            width="100%"
        >
        </iframe>
    </div>
    )
};
}

export default Report;

/*
            <IframeResizer
                log
                src="http://sgserver/Reports/report/ReportQCL?rs:Embed=true&Num_rqc=MI2021-00006"
                style={{ height:1000, width: '1px', minWidth: '100%'}}
            />

        <div className="div-table" style={{ "height": 1000, "width" : "100%" }}>
            <iframe id='iframe2'
                title= {"Report" + this.props.NombreTabla + this.props.id }
                //src="http://sgserver/Reports/report/ReportQCL?rs:Embed=true&Num_rqc=MI2021-00006"
                src="http://sgserver/Reports/report/ReportQCA?rs:Embed=true&Num_rqc=MI2021-00004"
                frameBorder="0" 
                height="100%" 
                width="100%"
            >
            </iframe>
        </div>            
*/