import React, { Fragment } from "react";
import { notifyListView } from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";
import { Dropdown, Loader, List } from "semantic-ui-react";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { getCookie } from "./cookie";

class AllNotify extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      paginate: true,
      notifications: [],
      page: 1,
      emptyData: false
    };
  }

  componentDidMount = () => {
    let uri =
      notifyListView.replace("<group_pk>", this.props.group.pk) + "?page=1";
    this.fetch(uri);
  };

  componentDidUpdate(prevprops, prevState) {
    if (prevprops.group != this.props.group) {
      this.setState(
        {
          loading: true,
          notifications: [],
          paginate: true,
          page: 1,
          emptyData: false
        },
        () =>
          this.fetch(
            notifyListView.replace("<group_pk>", this.props.group.pk) +
              "?page=" +
              this.state.page
          )
      );
    }
  }

  fetch = uri => {
    console.log("came here to fetch the list notification results");
    if (this.state.paginate) {
      fetchAsynchronous(
        uri,
        "GET",
        undefined,
        { Authorization: "Token " + getCookie("token")[0].value },
        this.callback
      );
    }
  };

  callback = response => {
    console.log("came here to the callback");
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({ paginate: false });
    } else {
      if (response.results.length === 0 && this.state.page === 1) {
        this.setState({
          loading: false,
          emptyData: true
        });
      } else {
        let notif = this.state.notifications;
        notif.push(...response.results);
        this.setState({
          loading: false,
          emptyData: false,
          notifications: notif,
          page: this.state.page + 1,
          paginate: response.next !== ""
        });
      }
    }
  };

  render = () => {
    return (
      <div id="allnotify">
        {this.state.emptyData ? (
          <Dropdown.Header>
            <div style={{ textAlign: "center" }}>
              <br />
              No notifications currently!
              <br />
            </div>
          </Dropdown.Header>
        ) : (
          <Fragment>
            {this.state.loading ? (
              <Dropdown.Item
                active={false}
                disabled={true}
                style={{ marginTop: 20 }}
              >
                <Loader active size="tiny">
                  getting notifications
                </Loader>
              </Dropdown.Item>
            ) : (
              <List>
                <InfiniteScroll
                  dataLength={this.state.notifications.length}
                  next={() =>
                    this.fetch(
                      notifyListView.replace(
                        "<group_pk>",
                        this.props.group.pk
                      ) +
                        "?page=" +
                        this.state.page
                    )
                  }
                  hasMore={this.state.paginate}
                  loader={
                    <div style={{ color: "#474b49", textAlign: "center" }}>
                      Getting Notifs...
                    </div>
                  }
                  height={350}
                  style={{ width: 350, w: "normal" }}
                >
                  {this.state.notifications.map((obj, index) => (
                    <List.Item
                      id="all_notify_message"
                      key={index}
                      as={Link}
                      to={"/" + obj.link}
                    >
                      <List.Icon
                        name="bell"
                        size="large"
                        verticalAlign="middle"
                      />
                      <List.Content style={{}}>{obj.text}</List.Content>
                    </List.Item>
                  ))}
                </InfiniteScroll>
              </List>
            )}
          </Fragment>
        )}
      </div>
    );
  };
}

export { AllNotify };
