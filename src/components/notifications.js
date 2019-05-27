import React, { Fragment } from "react";
import { getCookie } from "./cookie";
import { notifyListView } from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";
import { Loader, List } from "semantic-ui-react";
import { Scrollbars } from "react-custom-scrollbars";
import { Link } from "react-router-dom";

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
          notifications: response.results.splice(0, 10)
        });
      }
    }
  };

  set = obj => {
    this.setState(obj);
  };

  render = () => {
    return (
      <React.Fragment>
        {this.state.isLoggedIn ? (
          <div style={{ marginTop: 10 }}>
            <br />
            <Scrollbars
              autoHide
              autoHideTimeout={1000}
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
                    <div id="notify">
                      <List relaxed>
                        {this.state.notifications.map((obj, index) => (
                          <Fragment key={index}>
                            {obj.link !== null ? (
                              <List.Item
                                as={Link}
                                to={"/" + obj.link}
                                id="notify_message"
                              >
                                <List.Icon
                                  name="bell"
                                  size="large"
                                  verticalAlign="middle"
                                />
                                <List.Content>{obj.text}</List.Content>
                              </List.Item>
                            ) : (
                              <List.Item id="notify_message">
                                <List.Icon
                                  name="bell"
                                  size="large"
                                  verticalAlign="middle"
                                />
                                <List.Content>{obj.text}</List.Content>
                              </List.Item>
                            )}
                          </Fragment>
                        ))}
                      </List>
                    </div>
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
