import React from "react";
import ReactDOM from "react-dom";
import Modal from 'react-bootstrap/Modal';
import CarouselImg from "./carousel";
import "./style.css";

const defaultProps = {
  title: "Carousel",
  content: <></>,
  container: "#app-message-box",
};

export default {
  open: props => {
    return new Promise(resolve => {
      const { container, carouselsp, parentid, picid } = {
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

      ReactDOM.render(
        <Modal show={true} fullscreen={true} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {React.createElement(CarouselImg, { carouselsp: carouselsp, parentid: parentid, picid: picid })}
          </Modal.Body>
        </Modal>
        , containerElement
      );
    });
  }
};