import axios from "axios";

export default axios.create({
    baseURL: "http://localhost:8080/api",//"https://app.appliancesdepot.net:8443/api",//"http://sgserver:8080/api",//"https://app.appliancesdepot.net:8443/api",//"https://sgserver:8443/api",//"https://sgethereum:8443/api",//"http://sgethereum:8080/api",//"http://192.168.1.65:8080/api",//"http://www.candywhite.space:8080/api",//"http://192.168.1.65:8080/api",
    headers: {
        "content-type": "application/json"
    }
});