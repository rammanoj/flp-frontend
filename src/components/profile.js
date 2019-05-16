import React, { Fragment, Component } from "react";
import { NavBar, MessageDisplay } from "./elements/nav";
import { getCookie } from "./cookie";
import {
  Grid,
  Dimmer,
  Loader,
  Transition,
  Card,
  Input,
  Button
} from "semantic-ui-react";
import { profile, passwordUpdate } from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";
import { Redirect } from "react-router-dom";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      origial: {
        username: "",
        email: ""
      },
      username: "",
      email: "",
      old_password: "",
      password: "",
      confirm_password: "",
      loading: [false, false],
      message: false,
      componentLoading: true,
      visible: false,
      error: false
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
          original: { username: data.username, email: data.email },
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
      original: { username: "", email: "" },
      username: "",
      email: "",
      old_password: "",
      password: "",
      confirm_password: "",
      message: false,
      loading: [true, true],
      componentLoading: true,
      error: false
    });
  };

  checkUpdated = () => {
    let { username, email, original } = this.state;
    let data = {};
    if (username != original.username) {
      data["username"] = username;
    }
    if (email != original.email) {
      data["email"] = email;
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
        loading: [loading[0], true],
        message: false
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
        message: response.message,
        loading: [false, loading[1]],
        error: true
      });
    } else {
      this.setState({
        username: response.username,
        email: response.email,
        loading: [false, loading[1]],
        message: response.message,
        error: false
      });
    }
  };

  handlePasswordUpdate = response => {
    let { loading } = this.state;

    if (response.error === 1) {
      this.setState({
        message: response.message,
        loading: [loading[0], false],
        error: true
      });
    } else {
      this.setState({
        password: "",
        old_password: "",
        confirm_password: "",
        loading: [loading[0], false],
        message: "Password Successfully updated",
        error: false
      });
    }
  };

  render() {
    if (!this.state.isLoggedIn) {
      return <Redirect to="/login" />;
    }
    document.body.style = "background: #ffffff;";
    return (
      <Fragment>
        <NavBar active={false} />
        <MessageDisplay
          message={this.state.message}
          header={this.state.error ? "Error" : "Success"}
          type={this.state.error ? 1 : 0}
        />
        {this.state.componentLoading ? (
          <Dimmer active inverted>
            <Loader inverted content="fetching Profile" />
          </Dimmer>
        ) : (
          <Fragment>
            <div style={{ marginLeft: "calc(30px + 2vw)", marginTop: 25 }}>
              <h1 style={{ color: "#1b1c1d", display: "inline" }}>
                Account Settings
              </h1>
              <p style={{ color: "#565454" }}>Edit your profile here</p>
            </div>
            <Grid container style={{ marginTop: 40 }}>
              <Grid.Column width={3} />
              <Grid.Column width={4} textAlign="center">
                <Transition
                  animation="scale"
                  visible={this.state.visible}
                  duration={400}
                >
                  <Card style={{ width: "100%", padding: 10, marginTop: 34 }}>
                    <Input
                      icon="users"
                      type="text"
                      iconPosition="left"
                      placeholder="Enter username"
                      name="username"
                      value={this.state.username}
                      onChange={this.handleChange}
                      style={{ marginBottom: 15, width: "100%" }}
                    />
                    <Input
                      icon="mail"
                      type="email"
                      iconPosition="left"
                      placeholder="Enter email"
                      name="email"
                      value={this.state.email}
                      onChange={this.handleChange}
                      style={{ marginBottom: 15, width: "100%" }}
                    />
                    <Button
                      disabled={this.state.loading[0]}
                      onClick={e => this.handleFormSubmit(e, 0)}
                      loading={this.state.loading[0]}
                      secondary
                    >
                      Update
                    </Button>
                  </Card>
                </Transition>
              </Grid.Column>
              <Grid.Column width={2} />
              <Grid.Column width={4} textAlign="center">
                <Transition
                  animation="scale"
                  visible={this.state.visible}
                  duration={400}
                >
                  <div>
                    <h4>Update Password</h4>
                    <Card style={{ width: "100%", padding: 10 }}>
                      <Input
                        icon="lock"
                        type="password"
                        iconPosition="left"
                        placeholder="Current Password"
                        name="old_password"
                        value={this.state.old_password}
                        onChange={this.handleChange}
                        style={{ marginBottom: 15 }}
                      />

                      <Input
                        icon="lock"
                        type="password"
                        iconPosition="left"
                        placeholder="New Password"
                        name="password"
                        value={this.state.password}
                        onChange={this.handleChange}
                        style={{ marginBottom: 15 }}
                      />

                      <Input
                        icon="lock"
                        type="password"
                        iconPosition="left"
                        placeholder="Confirm Password"
                        name="confirm_password"
                        value={this.state.confirm_password}
                        onChange={this.handleChange}
                        style={{ marginBottom: 15 }}
                      />

                      <Button
                        disabled={this.state.loading[1]}
                        onClick={e => this.handleFormSubmit(e, 1)}
                        loading={this.state.loading[1]}
                        secondary
                      >
                        Change Password
                      </Button>
                    </Card>
                  </div>
                </Transition>
              </Grid.Column>
              <Grid.Column width={3} />
            </Grid>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export { Profile };
