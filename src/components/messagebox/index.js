import React from "react";
import ReactDOM from "react-dom";
import Modal from "../modal";
import {Button} from "react-bootstrap"

const defaultProps = {
  title: "MessageBox",
  content: <></>,
  container: "#app-message-box",
  buttons: []
};

export default {
  open: props => {
    return new Promise(resolve => {
      const { title, content, container, buttons } = {
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
        handleClose(handler());
      };

      ReactDOM.render(
        <Modal kind='messagebox' title={title} onClose={handleClose}>
          {content}
          {buttons.map(btn => {
            return (
              <Button variant="outline-success" size="sm" className="m-1" onClick={handleButton(btn.handler)} key={btn.name}>
                {btn.name}
              </Button>
            );
          })}
        </Modal>,
        containerElement
      );
    });
  }
};
