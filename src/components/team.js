import React, { Fragment, Component } from "react";
import { getCookie } from "./cookie";
import { Loader, Icon, Image } from "semantic-ui-react";
import { Paginate as Pagination } from "./elements/pagination";
import Scrollbars from "react-custom-scrollbars";
import { userpaginationcount as paginationCount, TeamUserList } from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";

export default class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedin: getCookie("token")[0].value,
      loading: true,
      group: this.props.group,
      emptyresult: true,
      page: 1,
      pages: 0,
      users: [],
      pagination: false
    };
  }

  handlePageClick = page => {
    console.log(page);
    this.setState(
      {
        page: page,
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
          pages: 0,
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
          pages: Math.ceil(response.count / paginationCount)
        });
      } else {
        this.setState({
          pagination: false,
          pages: 0
        });
      }
      this.setState({
        users: users,
        loading: false,
        emptyresult: false
      });
    } else {
      this.setState({
        pages: response.count,
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

        <p style={{ color: "#5e6160", marginLeft: "2vw" }}>Team Members</p>
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
                        page={this.state.page}
                        total={this.state.pages}
                        onClick={this.handlePageClick}
                        type={"arrow"}
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
