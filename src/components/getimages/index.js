import React from "react";
import ReactDOM from "react-dom";
import ImageSelector from "../../imageselector";
import Modal from "../modal";
//import Modal from 'react-bootstrap/Modal';
import { Button } from "react-bootstrap";

const defaultProps = {
  title: "GetImages",
  content: <></>,
  container: "#app-message-box",
  buttons: []
};

export default {
  open: props => {
    return new Promise(resolve => {
      const { title, content, container, buttons, grandparent, titleTable, buttonsToCreate, handleSetValues, refreshInfo} = {
        ...defaultProps,
        ...props
      };
      const containerElement = document.querySelector(container);
      if (!containerElement) throw Error(`can't find container ${container}`);

      const handleClose = value => {
        let result = null;
        if (value && !value.target) {
          result = value;
        }
        ReactDOM.unmountComponentAtNode(containerElement);
        return resolve(result);
      };

      const handleButton = handler => () => {
        refreshInfoLocal();
        handleClose(handler());
      };

      const refreshInfoLocal =()=>{
        refreshInfo();
      };    

      ReactDOM.render(
        <Modal kind='' title={title} onClose={handleClose}>
        {
            React.createElement(ImageSelector,
              {
                ConstraintName:'FK_product_file',//ConstraintName, 
                NombreTabla:'product_file',//NombreTabla, 
                parent:grandparent, 
                titleTable:titleTable,
                buttonsToCreate:buttonsToCreate,
                handleSetValues:handleSetValues,
                showNoSelected:true,
              }
            )
        }
        <p></p>
        {content}
        {
          buttons.map(btn => {
            return (
            <Button variant="outline-success" size="sm" className="m-1" onClick={handleButton(btn.handler)} key={btn.name}>
              {btn.name}
            </Button>
            );
          })
        }
        </Modal>,
        containerElement
      );
    });
  }
};