import { deleteCookie } from "../cookie";
import { MessageDisplay as setMessage } from "./../elements/nav";

export const fetchFileAsynchronous = (uri, method, data, headers, callback) => {
  fetch(uri, {
    method: method,
    body: data,
    headers: headers
  })
    .then(response => response.json())
    .then(object => {
      if (object.error === 1 && object.message === "Invalid token.") {
        deleteCookie(["token", "user"]);
        window.location = "/login";
        setMessage({ message: "sample message", type: 1, header: "asd" });
      } else {
        callback(object);
      }
    })
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
    .then(object => {
      if (object.error === 1 && object.message === "Invalid token.") {
        deleteCookie(["token", "user"]);
        window.location = "/login";
        setMessage({ message: "sample message", type: 1, header: "asd" });
      } else {
        callback(object);
      }
    })
    .catch(error => {
      console.log(error);
      //   alert("Error occured on the server, please try again later");
    });
};
