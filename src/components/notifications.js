import React, { Fragment } from "react";
import { getCookie } from "./cookie";
import { notifyListView } from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";
import { Icon, Menu, Loader } from "semantic-ui-react";
import { Scrollbars } from "react-custom-scrollbars";

export default class Notify extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      group: false,
      page: 1,
      emptyData: false,
      notifications: [],
      loading: false
    };
  }

  componentDidMount = () => {
    let uri =
      notifyListView.replace("<group_pk>", this.props.group.pk) + "?page=1";
    this.getList(uri);
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.group !== this.props.group) {
      this.setState({ group: this.props.group });
      let uri =
        notifyListView.replace("<group_pk>", this.props.group.pk) + "?page=1";
      this.getList(uri);
    }
  };

  getList = uri => {
    fetchAsynchronous(
      uri,
      "GET",
      undefined,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.callback
    );
    this.setState({ loading: true });
  };

  callback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      alert(response.message);
      this.setState({ loading: false, emptyData: true });
    } else {
      if (response.results.length === 0) {
        this.setState({
          loading: false,
          emptyData: true
        });
      } else {
        this.setState({
          loading: false,
          emptyData: false,
          notifications: response.results.splice(0, 5)
        });
      }
    }
  };

  render = () => {
    return (
      <React.Fragment>
        {this.state.isLoggedIn ? (
          <div style={{ marginTop: 10 }}>
            <Icon name="bell" />{" "}
            <h4 style={{ display: "inline", zIndex: 1000 }}>
              Recent Notifications
            </h4>
            <Scrollbars
              style={{
                height: "30vh"
              }}
            >
              {this.state.loading ? (
                <Loader active>loading..</Loader>
              ) : (
                <Fragment>
                  {this.state.emptyData ? (
                    <div style={{ textAlign: "center" }}>
                      <br />
                      No notifications currently!
                      <br />
                    </div>
                  ) : (
                    <Menu pointing vertical style={{ width: "99%" }}>
                      <form>
                        {this.state.notifications.map((obj, index) => (
                          <Menu.Item key={index} style={{ width: "99%" }}>
                            <div
                              dangerouslySetInnerHTML={{ __html: obj.text }}
                            />
                            <div style={{ float: "right" }}>
                              <Icon
                                name="close"
                                size="small"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  let ntf = [...this.state.notifications];
                                  ntf.splice(index, 1);
                                  this.setState({
                                    notifications: ntf,
                                    emptyData: ntf.length === 0
                                  });
                                }}
                              />
                            </div>
                          </Menu.Item>
                        ))}
                      </form>
                    </Menu>
                  )}
                </Fragment>
              )}
            </Scrollbars>
          </div>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  };
}
