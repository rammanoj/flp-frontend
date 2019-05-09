import { getCookie } from "../cookie";

export const fetchFileAsynchronous = (uri, method, data, headers, callback) => {
  fetch(uri, {
    method: method,
    body: data,
    headers: headers
  })
    .then(response => response.json())
    .then(object => callback(object))
    .catch(error => {
      console.log(error);
      //   alert("Error occured on the server, please try again later");
    });
};

export const fetchAsynchronous = (uri, method, data, headers, callback) => {
  fetch(uri, {
    method: method,
    body: method === "GET" ? undefined : JSON.stringify(data),
    headers: headers
  })
    .then(response => response.json())
    .then(object => callback(object))
    .catch(error => {
      console.log(error);
      //   alert("Error occured on the server, please try again later");
    });
};
