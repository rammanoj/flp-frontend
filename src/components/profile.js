import React, { Fragment, Component } from "react";
import { NavBar, MessageDisplay } from "./elements/nav";
import { getCookie } from "./cookie";
import {
  Grid,
  Dimmer,
  Loader,
  Card,
  Input,
  Button,
  Image as Images,
  Form,
  Icon
} from "semantic-ui-react";
import { profile, passwordUpdate, maxUploadSize } from "./../api";
import { fetchAsynchronous, fetchFileAsynchronous } from "./controllers/fetch";
import { Redirect } from "react-router-dom";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      origial: {
        username: "",
        email: "",
        pic: ""
      },
      username: "",
      email: "",
      pic: "",
      old_password: "",
      password: "",
      confirm_password: "",
      loading: [false, false],
      componentLoading: true,
      visible: false,
      message: {
        message: "",
        trigger: false,
        type: 0
      },
      update: false
    };
  }

  componentDidMount() {
    if (this.state.isLoggedIn) {
      let headers = {
        Authorization: "Token " + getCookie("token")[0].value
      };
      let uri = profile + getCookie("user")[0].value + "/";
      fetchAsynchronous(uri, "GET", "", headers, this.HandleAPIFetch);
    }
  }

  HandleAPIFetch = data => {
    if (data.hasOwnProperty("error")) {
      alert(data.message);
    } else {
      this.setState(
        {
          original: {
            username: data.username,
            email: data.email,
            pic: data.pic
          },
          username: data.username,
          email: data.email,
          componentLoading: false
        },
        () => this.setState({ visible: true })
      );
    }
  };

  handleChange = e => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  componentWillUnmount = () => {
    this.setState({
      isLoggedIn: getCookie("token")[1],
      original: { username: "", email: "", pic: "" },
      username: "",
      email: "",
      pic: "",
      old_password: "",
      password: "",
      confirm_password: "",
      message: {
        message: "",
        trigger: false,
        type: ""
      },
      update: false,
      loading: [true, true],
      componentLoading: true
    });
  };

  checkUpdated = () => {
    let { username, email, pic, original } = this.state;
    let data = {};
    if (username !== original.username) {
      data["username"] = username;
    }
    if (email !== original.email) {
      data["email"] = email;
    }

    if (pic !== original.pic) {
      data["pic"] = pic;
    }
    return data;
  };

  handleFormSubmit(e, form) {
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    let { loading } = this.state;
    let data = this.checkUpdated();
    if (form === 0) {
      this.setState({ loading: [true, loading[1]], message: false });
      fetchAsynchronous(
        profile + getCookie("user")[0].value + "/",
        "PATCH",
        data,
        headers,
        this.handleUpdate
      );
    } else if (form === 1) {
      this.setState({
        loading: [loading[0], true]
      });
      let data = {
        password: this.state.old_password,
        new_password: this.state.password,
        confirm_password: this.state.confirm_password
      };
      fetchAsynchronous(
        passwordUpdate,
        "PATCH",
        data,
        headers,
        this.handlePasswordUpdate
      );
    }
  }

  handleUpdate = response => {
    let { loading } = this.state;

    if (response.error === 1) {
      this.setState({
        message: { message: response.message, trigger: true, type: 1 },
        update: !this.state.update,
        loading: [false, loading[1]]
      });
    } else {
      this.setState({
        username: response.username,
        email: response.email,
        loading: [false, loading[1]],
        message: { message: response.message, trigger: true, type: 0 },
        update: !this.state.update
      });
    }
  };

  handlePasswordUpdate = response => {
    let { loading } = this.state;

    if (response.error === 1) {
      this.setState({
        loading: [loading[0], false],
        message: { message: response.message, trigger: true, type: 1 },
        update: !this.state.update
      });
    } else {
      this.setState({
        password: "",
        old_password: "",
        confirm_password: "",
        loading: [loading[0], false],
        message: {
          message: "Password succesfully updated!",
          trigger: true,
          type: 0
        },
        update: !this.state.update
      });
    }
  };

  handlepicUpdate = () => {
    // set the loader
    this.setState({ componentLoading: true });
    let data = new FormData();
    data.append("pic", this.state.pic);
    fetchFileAsynchronous(
      profile + getCookie("user")[0].value + "/",
      "PATCH",
      data,
      { Authorization: "Token " + getCookie("token")[0].value },
      response => {
        if (response.error === 1) {
          this.setState({
            message: { message: response.message, trigger: true, type: 1 },
            update: !this.state.update,
            componentLoading: false
          });
        } else {
          let original = Object.assign({}, this.state.original);
          original.pic = response.pic;
          this.setState({
            message: {
              message: "Profile pic successfully updated",
              trigger: true,
              type: 0
            },
            update: !this.state.update,
            pic: "",
            original: original,
            componentLoading: false
          });
        }
      }
    );
  };

  render() {
    if (!this.state.isLoggedIn) {
      return <Redirect to="/login" />;
    }
    document.body.style = "background: #f0f4f3;";
    return (
      <Fragment>
        <NavBar active={2} />
        <MessageDisplay
          message={this.state.message.message}
          type={this.state.message.type}
          trigger={this.state.message.trigger}
          update={this.state.update}
        />
        {this.state.componentLoading ? (
          <Dimmer active inverted>
            <Loader inverted content="fetching Profile" />
          </Dimmer>
        ) : (
          <Fragment>
            <div style={{ marginTop: "20vh" }}>
              <Grid>
                <Grid.Row style={{ height: "100vh" }}>
                  <Grid.Column computer={5} tablet={3} mobile={1} />
                  <Grid.Column computer={6} tablet={10} mobile={14}>
                    <Card id="profile_card">
                      <div
                        style={{
                          display: "block",
                          margin: "0 auto",
                          textAlign: "center",
                          padding: 20
                        }}
                      >
                        {this.state.original.pic === "" ? (
                          <Icon
                            name="user"
                            size="large"
                            style={{ color: "#99a3b2" }}
                          />
                        ) : (
                          <Images
                            src={this.state.original.pic}
                            style={{ borderRadius: "50%" }}
                            size="tiny"
                          />
                        )}

                        <p
                          style={{
                            color: "#35b18a",
                            marginTop: 2
                          }}
                        >
                          <input
                            style={{ display: "none" }}
                            type="file"
                            id="postfile"
                            onChange={e => {
                              let file = e.target.files[0];
                              let type = file.type.split("/")[0];
                              if (type === "image") {
                                // Max allowed size is 2MB
                                if (file.size > maxUploadSize) {
                                  this.setState({
                                    message: {
                                      message: "Max Image size is 2MB",
                                      trigger: true,
                                      type: 1
                                    },
                                    update: !this.state.update
                                  });
                                } else {
                                  var img = new Image();
                                  img.src = e.target.result;
                                  var self = this;
                                  img.onload = function() {
                                    if (this.height / this.width === 1) {
                                      self.setState({ pic: file });
                                    } else {
                                      self.setState({
                                        message: {
                                          message:
                                            "Images should have same resolutions like 360:360, 640:640 etc.",

                                          trigger: true,
                                          type: 1
                                        },
                                        update: !self.state.update
                                      });
                                    }
                                  };
                                  img.src = window.URL.createObjectURL(file);
                                }
                              } else {
                                this.setState({
                                  message: "Only image files are accepted",
                                  error: true
                                });
                              }
                            }}
                          />
                          {this.state.pic !== "" ? (
                            ""
                          ) : (
                            <label
                              htmlFor="postfile"
                              style={{ cursor: "pointer" }}
                            >
                              Edit Pic{" "}
                            </label>
                          )}
                        </p>
                      </div>
                      {this.state.pic !== "" ? (
                        <div style={{ textAlign: "center" }}>
                          {this.state.pic.name.length >= 20
                            ? this.state.pic.name.substr(0, 19) + ".."
                            : this.state.pic.name}
                          <br />
                          <span
                            style={{ color: "#81adf4", cursor: "pointer" }}
                            onClick={this.handlepicUpdate}
                          >
                            Update
                          </span>{" "}
                          <span
                            style={{ color: "red", cursor: "pointer" }}
                            onClick={() => this.setState({ pic: "" })}
                          >
                            Cancel
                          </span>
                        </div>
                      ) : (
                        ""
                      )}
                      <Card.Content extra>
                        <Form id="profile_form">
                          <Grid>
                            <Grid.Row>
                              <Grid.Column width={4}>username:</Grid.Column>
                              <Grid.Column width={12}>
                                <Input
                                  style={{ width: "100%" }}
                                  icon="user"
                                  name="username"
                                  onChange={this.handleChange}
                                  iconPosition="left"
                                  placeholder="Enter Username"
                                  value={this.state.username}
                                />
                              </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                              <Grid.Column width={4}>email:</Grid.Column>
                              <Grid.Column width={12}>
                                <Input
                                  style={{ width: "100%" }}
                                  icon="mail"
                                  name="email"
                                  onChange={this.handleChange}
                                  iconPosition="left"
                                  placeholder="Enter email"
                                  value={this.state.email}
                                />
                              </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                              <Grid.Column width={6} />
                              <Grid.Column width={4}>
                                <Button
                                  disabled={this.state.loading[0]}
                                  onClick={e => this.handleFormSubmit(e, 0)}
                                  loading={this.state.loading[0]}
                                  secondary
                                >
                                  Update
                                </Button>
                              </Grid.Column>
                              <Grid.Column width={6} />
                            </Grid.Row>
                          </Grid>
                        </Form>
                      </Card.Content>
                      <Card.Content extra>
                        <Form id="password_form">
                          <Grid>
                            <Grid.Row>
                              <Grid.Column width={4}>
                                Current Password:
                              </Grid.Column>
                              <Grid.Column width={12}>
                                <Input
                                  style={{ width: "100%" }}
                                  icon="lock"
                                  iconPosition="left"
                                  name="old_password"
                                  type="password"
                                  onChange={this.handleChange}
                                  placeholder="Enter password"
                                  value={this.state.old_password}
                                />
                              </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                              <Grid.Column width={4}>New Password:</Grid.Column>
                              <Grid.Column width={12}>
                                <Input
                                  style={{ width: "100%" }}
                                  icon="lock"
                                  iconPosition="left"
                                  name="password"
                                  type="password"
                                  onChange={this.handleChange}
                                  placeholder="Enter New password"
                                  value={this.state.password}
                                />
                              </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                              <Grid.Column width={4}>Confirm:</Grid.Column>
                              <Grid.Column width={12}>
                                <Input
                                  style={{ width: "100%" }}
                                  icon="lock"
                                  type="password"
                                  name="confirm_password"
                                  onChange={this.handleChange}
                                  iconPosition="left"
                                  placeholder="Confirm your password"
                                  value={this.state.confirm_password}
                                />
                              </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                              <Grid.Column width={4} />
                              <Grid.Column width={8}>
                                <Button
                                  style={{ width: "100%" }}
                                  disabled={this.state.loading[1]}
                                  onClick={e => this.handleFormSubmit(e, 1)}
                                  loading={this.state.loading[1]}
                                  secondary
                                >
                                  Change Password
                                </Button>
                              </Grid.Column>
                              <Grid.Column width={4} />
                            </Grid.Row>
                          </Grid>
                        </Form>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                  <Grid.Column computer={5} tablet={3} mobile={1} />
                </Grid.Row>
              </Grid>
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export { Profile };
