import React from 'react';
import './styles.css';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

const MenuContext = (props) => {
    const {menucontext, element} = props; 
    return (
      <>
      {
        React.createElement(ContextMenuTrigger, {id:menucontext.id}, element)
      }

      {(function (){
        let itemsarray = [];
        menucontext.items.forEach(element => {
          itemsarray.push(React.createElement(MenuItem,{key:element.text, onClick:element.onclick},element.text));
        });
        return React.createElement(ContextMenu, {id:menucontext.id}, itemsarray);
      }())
      }
        </>
    )
}

export default MenuContext;