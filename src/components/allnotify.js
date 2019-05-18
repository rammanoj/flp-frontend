import React, { Fragment } from "react";
import { notifyListView } from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";
import { Dropdown, Menu, Loader } from "semantic-ui-react";
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

  componentDidUpdate(prevprops, presProps) {
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

  fetch(uri) {
    if (this.state.paginate) {
      fetchAsynchronous(
        uri,
        "GET",
        undefined,
        { Authorization: "Token " + getCookie("token")[0].value },
        this.callback
      );
    }
  }

  callback = response => {
    // this.setState({ loading: false });
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({ paginate: false });
    } else {
      if (response.results.length === 0 && this.state.page === 1) {
        this.setState({
          loading: false,
          emptyData: true
        });
      } else {
        let notif = [...this.state.notifications];
        notif.push(response.results);
        this.setState({
          loading: false,
          emptyData: false,
          notifications: notif
        });
      }
    }
  };

  render = () => {
    return (
      <Fragment>
        {this.state.emptyData ? (
          <Dropdown.Menu
            style={{ width: "25vw", height: "40vh", overflow: "auto" }}
          >
            <Dropdown.Header>
              <div style={{ textAlign: "center" }}>
                <br />
                No notifications currently!
                <br />
              </div>
            </Dropdown.Header>
          </Dropdown.Menu>
        ) : (
          <Dropdown.Menu
            id="allnotify"
            style={{ width: "25vw", height: "40vh", overflow: "auto" }}
          >
            {this.state.loading ? (
              <Dropdown.Item active={false} disabled={true}>
                <Loader active size="mini" />
              </Dropdown.Item>
            ) : (
              <Fragment>
                <InfiniteScroll
                  dataLength={this.state.notifications.length}
                  next={this.fetch}
                  hasMore={this.state.paginate}
                  loader={<Loader active />}
                  scrollableTarget="allnotify"
                >
                  {this.state.notifications.map((obj, index) => (
                    <Dropdown.Item
                      key={index}
                      style={{ whiteSpace: "normal" }}
                      onClick={() => {}}
                    >
                      {obj.text}
                    </Dropdown.Item>
                  ))}
                </InfiniteScroll>
              </Fragment>
            )}
          </Dropdown.Menu>
        )}
      </Fragment>
    );
  };
}

export { AllNotify };
