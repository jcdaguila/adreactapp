import React, {useRef, useState, useEffect} from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import TablesList from "../../tablelist";
import './style.css';

const Htabs = (props) => {
    const [tabIndex, setTabIndex]=useState(0);
    const parentRef= useRef(null);
    //const [thetabs, setThetabs] = useState([]);

    useEffect(()=>{
      /*let thetabsAux = [];
      thetabsAux.push(props.firsttab?props.firsttab: { parent: '', name: 'Table List', content: <TablesList addNewTab={addNewTab}/> });
      setThetabs(thetabsAux);*/
    },[]);

    useEffect(()=>{
        //if(parentRef.current){
            //setParentHeight(parentRef.current.offsetHeight);
            //console.log('parentheight', parentHeight);
        //}
    }, [parentRef]);

  const deleteTab = (index) => {
    if (index > 0) {
      let temptabs = thetabs;
      temptabs.splice(index, 1);
      setTimeout(() => {
        setThetabs(temptabs);
        setTabIndex(index - 1);
      }, 10);
    }
  }

  const isAlreadyOpen=(thetab)=>{
    let result = -1;
    let cont = 0;
    thetabs.forEach(key =>{
      if(key.name === thetab.name && key.parent === thetab.parent){
        result = cont;
      }
      cont++;
    });
    return result;
  }

  const addNewTab=(thetab)=>{
    let iao = isAlreadyOpen(thetab);
    if(iao===-1){
      //let temptabs = [...thetabs, ...[thetab]];
      //temptabs.push(thetab);
      //setThetabs([...thetabs, ...[thetab]]);
      thetabs.push(thetab);
      //setTabIndex(temptabs.length - 1);
      setTabIndex(thetabs.length - 1);
    }
    else{
        setTabIndex(iao);
    }
  }

  const [thetabs, setThetabs] = useState([props.firsttab?props.firsttab: { parent: '', name: 'Table List', content: <TablesList addNewTab={addNewTab}/> }]);
  
  const onSelect=(index, lastindex, event)=>{
      setTabIndex(index);
  }

    return(
        <Tabs selectedIndex={tabIndex} onSelect={onSelect} style={{height:'100%'}} >
          <TabList>
            {thetabs.map((tab, index) => {
              //console.log(tab);
                return <Tab key={tab.name.toString().concat(tab.parent)}>
                    <span title={tab.parent}>{tab.name}</span>
                    <span>{tab.name.toString().length < 3?"___":""}</span>
                    <span title='Remove Tab' style={{color:"red"}} onClick={() => deleteTab(index)}> (x)</span>
                  </Tab>;
                }
            )}
          </TabList>
          {thetabs.map((tab, index) =>
            <TabPanel 
              key={tab.name.toString().concat(tab.parent)} 
              forceRender={true} 
              style={{ width:"100%", height: 'calc(100% - 105px)', border: '1px solid rgba(0, 0, 0, 0.25)'/*, overflowY: 'scroll'*/}}
            >
                {tab.content}
            </TabPanel>
          )}
        </Tabs>
    );
  };

  export default Htabs;