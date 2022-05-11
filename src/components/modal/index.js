import React from "react";

import "./styles.scss";

const defaultProps = {
  title: "ModalTitle",
  onClose: () => {}
};

export default function Modal(props) {
  const { title, onClose, kind } = { ...defaultProps, ...props };
  let wrapperclass = (kind==='messagebox')?"modal__wrapper":"modal__wrapperF";
  return (
    <div className="modal__backdrop d-flex justify-content-center align-items-center">
      <div className={wrapperclass}>
        <div className="d-flex justify-content-between align-items-center">
          <h2>{title}</h2>
          <div className="modal__close" onClick={onClose}>
            x
          </div>
        </div>
        <div className="modal__content">{props.children}</div>
      </div>
    </div>
  );
}