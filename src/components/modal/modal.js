import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

export default function TheModal(props) {
    const values = [true, 'sm-down', 'md-down', 'lg-down', 'xl-down', 'xxl-down', 'onclose'];
    const [fullscreen, setFullscreen] = useState(values[0]);
    const [show, setShow] = useState(props.show);

    useEffect(() => {
        //setShow(props.show);
    },[]);
  
    function handleShow(breakpoint) {
      setFullscreen(breakpoint);
      setShow(true);
    }
  
    return (
      <>
        {!props.show?values.map((v, idx) => (
          <Button key={idx} className="me-2" onClick={v==='onclose'?props.onClose:() => handleShow(v)}>
            {v==='onclose'?'Close':'Full screen '.concat((typeof(v) === 'string' && `below ${v.split('-')[0]}`))}
          </Button>
        )):<></>}
        <Modal show={show} fullscreen={fullscreen} onHide={() => {setShow(false);props.onClose();}}>
          <Modal.Header closeButton>
            <Modal.Title>{props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              {props.content}
          </Modal.Body>
        </Modal>
      </>
    );
  }