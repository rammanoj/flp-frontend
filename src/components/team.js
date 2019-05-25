import React, { Fragment, Component } from "react";
import { getCookie } from "./cookie";
import { Loader, Icon, Image } from "semantic-ui-react";
import Pagination from "semantic-ui-react-button-pagination";
import Scrollbars from "react-custom-scrollbars";
import { paginationCount, TeamUserList } from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";

export default class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedin: getCookie("token")[0].value,
      loading: true,
      group: this.props.group,
      page: 1,
      emptyresult: false,
      items: 0,
      offset: 0,
      users: [],
      pagination: false
    };
  }

  handlePageClick = offset => {
    this.setState(
      {
        offset: offset,
        page: Math.ceil(offset / paginationCount) + 1,
        loading: true
      },
      () => this.fetch()
    );
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.group !== this.props.group) {
      this.setState(
        {
          group: this.props.group,
          page: 1,
          offset: 0,
          items: 0,
          users: [],
          loading: true
        },
        () => this.fetch()
      );
    }
  };

  componentDidMount = () => {
    this.fetch();
  };

  fetch = () => {
    fetchAsynchronous(
      TeamUserList + this.state.group.pk + "/?page=" + this.state.page,
      "GET",
      undefined,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.fetchCallback
    );
  };

  fetchCallback = response => {
    if (this.state.page === 1 && response.results.length === 0) {
      this.setState({
        emptyresult: true,
        loading: false
      });
    } else if (this.state.page === 1) {
      let users = response.results,
        length = response.results.length;

      if (length < response.count) {
        this.setState({
          pagination: true,
          items: response.count
        });
      } else {
        this.setState({
          pagination: false,
          items: 0
        });
      }
      this.setState({
        users: users,
        loading: false,
        emptyresult: false
      });
    } else {
      this.setState({
        items: response.count,
        users: response.results,
        loading: false,
        emptyresult: false
      });
    }
  };

  render = () => {
    return (
      <Fragment>
        <br />
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#5e6160" }}>Team Members</p>
        </div>
        <Scrollbars style={{ height: "30vh" }}>
          {this.state.loading ? (
            <Loader active>getting users..</Loader>
          ) : (
            <Fragment>
              {this.state.emptyresult ? (
                <Fragment>
                  <br />
                  <h4>No users in the group.</h4>
                  <br />
                </Fragment>
              ) : (
                <Fragment>
                  {this.state.users.map((obj, index) => (
                    <div key={index} id="team_users">
                      <div>
                        {obj.pic !== "" ? (
                          <Image src={obj.pic} avatar />
                        ) : (
                          <Icon
                            name="user"
                            circular
                            inverted
                            style={{ background: "#c2c4c6" }}
                          />
                        )}
                        <span>
                          {obj.username.length > 25
                            ? obj.username.substr(0, 23) + ".."
                            : obj.username}
                        </span>
                      </div>
                    </div>
                  ))}
                  {this.state.pagination === true ? (
                    <div
                      style={{
                        marginTop: 30,
                        marginBottom: 20,

                        textAlign: "center"
                      }}
                    >
                      <Pagination
                        limit={paginationCount}
                        offset={this.state.offset}
                        total={this.state.items}
                        onClick={(e, props, offset) =>
                          this.handlePageClick(offset)
                        }
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </Fragment>
              )}
            </Fragment>
          )}
        </Scrollbars>
      </Fragment>
    );
  };
}
