import React, { useEffect, useState } from 'react';
import TableRowDataService from "../../services";
import { Image } from 'cloudinary-react';
import { Carousel } from 'react-bootstrap';
import "./style.css";

const CarouselImg = (props) => {
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    //get data from table to fill grid
    const retrieveTableRows = async () => {
      let data = {};
      let params = {};
      params = { spname: props.carouselsp, parentid: props.parentid };
      await TableRowDataService.executeStoredProcedure(JSON.stringify(params))
        .then(response => {
          data = response.data;
        })
        .catch(e => {
          console.log(e);
        });
      return data;
    }

    //get structure and data from table
    const getTableInfo = async () => {
      let data = await retrieveTableRows();
      setRowData(data);
    }

    getTableInfo();
  }, []);


  const createImageGallery = () => {
    let gallery = [];
    let galleryAux = [];
    let i = 0;
    for (i = 0; i < rowData.length; i++) {
      let ImageAtts = {
        cloudName: "dleagle",
        publicId: rowData[i].name,
        key: rowData[i].id,
        //className: 'imgcarousel'
      }
      let ImageItem = <Carousel.Item key={rowData[i].id}>{React.createElement('a', { key: rowData[i].id, href: rowData[i].name, target: "_blank" }, React.createElement(Image, ImageAtts))}</Carousel.Item>;
      if (rowData[i].id === props.picid) {
        gallery.push(ImageItem);
      }
      else { galleryAux.push(ImageItem); }
    }
    gallery.push(...galleryAux);
    return gallery;
  }

  return (
    rowData 
    ?
    <div className='imgcarousel'></div>
    /*<Carousel interval={null}>
        {createImageGallery()}
      </Carousel>*/
    : <div></div>
  )
};

export default CarouselImg;