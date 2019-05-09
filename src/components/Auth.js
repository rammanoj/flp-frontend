import React, { Fragment, Component } from "react";
import { getCookie, setCookie, deleteCookie } from "./cookie";
import { Redirect, Link } from "react-router-dom";
import { NavBar, MessageDisplay } from "./elements/nav";
import { fetchAsynchronous } from "./controllers/fetch";
import { login, forgotPassword, signup, logout, green } from "./../api";
import {
  Grid,
  Card,
  Input,
  Checkbox,
  Button,
  Transition,
  Dimmer,
  Loader
} from "semantic-ui-react";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: getCookie("token")[1],
      user: "",
      password: "",
      remember_me: false,
      message: false,
      loading: false,
      visible: false
    };
  }

  handleChange = e => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  componentWillUnmount = () => {
    this.setState({
      user: "",
      password: "",
      remember_me: false,
      message: false,
      loading: false
    });
  };

  componentDidMount = () => {
    this.setState({ visible: true });
  };

  HandleFormSubmit = e => {
    e.preventDefault();
    this.setState({
      message: false,
      loading: true
    });
    let data = {
      user: this.state.user,
      password: this.state.password,
      remember_me: this.state.remember_me ? 1 : 0
    };
    fetchAsynchronous(
      login,
      "POST",
      data,
      { "Content-Type": "application/json" },
      this.HandleResponse
    );
  };

  HandleResponse = data => {
    if (data.error === 1) {
      this.setState({
        message: data.message,
        loading: false
      });
    } else {
      let date = Date.now();
      if (this.state.remember_me) {
        date = Date.now() + 90 * 60 * 60 * 24 * 1000;
      } else {
        date = Date.now() + 7 * 60 * 60 * 24 * 1000;
      }

      let cookies = [
        {
          key: "token",
          value: data.token,
          age: date
        },
        {
          key: "user",
          value: data.user_id,
          age: date
        }
      ];
      setCookie(cookies);
      this.setState({ isLoggedIn: true });
    }
  };

  render = () => {
    if (this.state.isLoggedIn) {
      return <Redirect to="/home" />;
    } else {
      document.body.style = "background: #ffffff;";
      return (
        <Fragment>
          <NavBar active={1} />

          <MessageDisplay
            message={this.state.message}
            header="Error"
            type={1}
          />

          <Transition
            animation="scale"
            visible={this.state.visible}
            duration={400}
          >
            <Grid>
              <Grid.Row textAlign="center">
                <Grid.Column width={6} />
                <Grid.Column width={4}>
                  <div
                    style={{
                      marginTop: "calc(50px + 10vh)",
                      textAlign: "center"
                    }}
                  >
                    <h2>Login Form</h2>
                    <Card style={{ width: "100%", padding: 10 }}>
                      <Input
                        icon="users"
                        iconPosition="left"
                        placeholder="Username / Email"
                        name="user"
                        style={{ marginBottom: 15 }}
                        value={this.state.username}
                        onChange={this.handleChange}
                      />

                      <Input
                        icon="lock"
                        iconPosition="left"
                        placeholder="Password"
                        name="password"
                        type="password"
                        style={{ marginBottom: 15 }}
                        value={this.state.password}
                        onChange={this.handleChange}
                      />
                      <div style={{ justifyContent: "center" }}>
                        <Checkbox
                          label="Remember me"
                          style={{ marginBottom: 15 }}
                          defaultChecked
                        />
                      </div>
                      <Button
                        disabled={this.state.loading}
                        onClick={this.HandleFormSubmit}
                        loading={this.state.loading}
                        secondary
                      >
                        Login
                      </Button>
                    </Card>
                    <Card style={{ padding: 10, width: "100%" }}>
                      <Link to="/forgotpassword">
                        Don't Remember Password ?
                      </Link>
                    </Card>
                  </div>
                </Grid.Column>
                <Grid.Column width={6} />
              </Grid.Row>
            </Grid>
          </Transition>
        </Fragment>
      );
    }
  };
}

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      email: "",
      message: false,
      loading: false,
      error: false,
      visible: false
    };
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value });
    return this.state[name];
  };

  componentWillUnmount = () => {
    this.setState({
      email: "",
      message: false,
      isLoggedIn: false,
      loading: false,
      error: false
    });
  };

  componentDidMount = () => {
    this.setState({ visible: true });
  };

  HandleFormSubmit = e => {
    e.preventDefault();
    this.setState({ loading: true });
    fetchAsynchronous(
      forgotPassword,
      "POST",
      { email: this.state.email },
      { "Content-Type": "application/json" },
      this.HandleResponse
    );
  };

  HandleResponse = data => {
    this.setState({
      message: data.message,
      loading: false,
      error: data.error === 1 ? true : false
    });
  };

  render = () => {
    let { state: obj } = this;
    if (obj.isLoggedIn) {
      return <Redirect to="/home" />;
    } else {
      document.body.style = "background: #fffff;";

      return (
        <Fragment>
          <NavBar active={3} />

          <MessageDisplay
            message={this.state.message}
            header={this.state.error ? "Error" : "Success"}
            type={this.state.error ? 1 : 0}
          />

          <Transition
            animation="scale"
            visible={this.state.visible}
            duration={400}
          >
            <Grid>
              <Grid.Row textAlign="center">
                <Grid.Column width={6} />
                <Grid.Column width={4}>
                  <div
                    style={{
                      marginTop: "calc(50px + 10vh)",
                      textAlign: "center"
                    }}
                  >
                    <h2>Forgot Password ?</h2>
                    <Card style={{ width: "100%", padding: 10 }}>
                      <Input
                        icon="mail"
                        type="email"
                        iconPosition="left"
                        placeholder="Enter email"
                        name="email"
                        style={{ marginBottom: 15 }}
                        value={this.state.email}
                        onChange={e => this.setState({ email: e.target.value })}
                      />

                      <Button
                        disabled={this.state.loading}
                        onClick={this.HandleFormSubmit}
                        loading={this.state.loading}
                        secondary
                      >
                        Validate
                      </Button>
                    </Card>
                    <Card style={{ padding: 10, width: "100%" }}>
                      <div>
                        <Link to="/signup">Signup</Link> |{" "}
                        <Link to="/login">Login</Link>
                      </div>
                    </Card>
                  </div>
                </Grid.Column>
                <Grid.Column width={6} />
              </Grid.Row>
            </Grid>
          </Transition>
        </Fragment>
      );
    }
  };
}

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      username: "",
      password: "",
      confirm_password: "",
      email: "",
      error: 1,
      message: false,
      loading: false,
      visible: false
    };
  }

  updateState = (name, value) => {
    this.setState({ [name]: value });
    return this.state[name];
  };

  componentDidMount = () => {
    this.setState({ visible: true });
  };

  componentWillUnmount = () => {
    this.setState({
      username: "",
      password: "",
      confirm_password: "",
      email: "",
      message: false,
      error: 1,
      loading: false
    });
  };

  HandleFormSubmit = e => {
    e.preventDefault();
    this.setState({ message: false, loading: true });
    let data = {
      username: this.state.username,
      password: this.state.password,
      confirm_password: this.state.confirm_password,
      email: this.state.email
    };
    fetchAsynchronous(
      signup,
      "POST",
      data,
      { "Content-Type": "application/json" },
      this.HandleResponse
    );
  };

  handleChange = e => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  HandleResponse = data => {
    this.setState({
      loading: false
    });
    if (data.error === 1) {
      this.setState({
        message: data.message,
        error: 1
      });
    } else {
      this.setState({
        message: "User successfully registered, confirm the verification mail",
        error: 0
      });
    }
  };

  render = () => {
    document.body.style = "background: #ffffff;";
    if (this.state.isLoggedIn) {
      return <Redirect to="/home" />;
    } else {
      document.body.style = "background: #fafafa;";
      // render the components
      return (
        <Fragment>
          <NavBar active={2} />
          <MessageDisplay
            message={this.state.message}
            header={this.state.error === 1 ? "Error" : "Success"}
            type={this.state.error === 1 ? 1 : 0}
          />

          <Transition
            animation="scale"
            visible={this.state.visible}
            duration={400}
          >
            <Grid>
              <Grid.Row textAlign="center">
                <Grid.Column width={6} />
                <Grid.Column width={4}>
                  <div
                    style={{
                      marginTop: "calc(50px + 10vh)",
                      textAlign: "center"
                    }}
                  >
                    <h2>Signup</h2>
                    <Card style={{ width: "100%", padding: 10 }}>
                      <Input
                        icon="users"
                        type="text"
                        iconPosition="left"
                        placeholder="Enter Username"
                        name="username"
                        style={{ marginBottom: 15 }}
                        value={this.state.username}
                        onChange={this.handleChange}
                      />
                      <Input
                        icon="mail"
                        type="email"
                        iconPosition="left"
                        placeholder="Enter Email"
                        name="email"
                        style={{ marginBottom: 15 }}
                        value={this.state.email}
                        onChange={this.handleChange}
                      />
                      <Input
                        icon="lock"
                        type="password"
                        iconPosition="left"
                        placeholder="Enter Password"
                        name="password"
                        style={{ marginBottom: 15 }}
                        value={this.state.password}
                        onChange={this.handleChange}
                      />
                      <Input
                        icon="lock"
                        type="password"
                        iconPosition="left"
                        placeholder="Confirm Password"
                        name="confirm_password"
                        style={{ marginBottom: 15 }}
                        value={this.state.confirm_password}
                        onChange={this.handleChange}
                      />
                      <Button
                        disabled={this.state.loading}
                        onClick={this.HandleFormSubmit}
                        loading={this.state.loading}
                        secondary
                      >
                        Register
                      </Button>
                    </Card>
                  </div>
                </Grid.Column>
                <Grid.Column width={6} />
              </Grid.Row>
            </Grid>
          </Transition>
        </Fragment>
      );
    }
  };
}

class Logout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      text: "",
      loading: true,
      visible: false
    };
  }

  componentDidMount() {
    if (this.state.isLoggedIn) {
      fetchAsynchronous(
        logout,
        "POST",
        undefined,
        { Authorization: "Token " + getCookie("token")[0].value },
        this.HandleResponse
      );
    } else {
      this.setState(
        {
          loading: false
        },
        () =>
          this.setState({
            text: "You have already logged out !!",
            visible: true
          })
      );
    }
  }

  HandleResponse = response => {
    deleteCookie(["token", "user"]);
    if (response.error === 0) {
      this.setState(
        {
          loading: false,
          text: "You have successfully logged out!!"
        },
        () => this.setState({ visible: true })
      );
    } else {
      this.setState(
        {
          loading: false,
          text: "You have already logged out!!"
        },
        () => this.setState({ visible: true })
      );
    }
  };

  render = () => {
    document.body.style = "background: #ffffff;";
    // logout the user
    return (
      <Fragment>
        {this.state.loading ? (
          <Dimmer active inverted>
            <Loader content="Logging you out" />
          </Dimmer>
        ) : (
          <Fragment>
            <NavBar active={3} />
            <Grid>
              <Grid.Row textAlign="center">
                <Grid.Column width={6} />
                <Grid.Column width={4}>
                  <Transition
                    animation="scale"
                    visible={this.state.visible}
                    duration={400}
                  >
                    <div
                      style={{
                        marginTop: "calc(50px + 10vh)",
                        textAlign: "center"
                      }}
                    >
                      <Card style={{ padding: 10 }}>
                        <h5 style={{ color: green }}>{this.state.text}</h5>
                      </Card>
                      <Card style={{ padding: 10 }}>
                        <div style={{ display: "inline" }}>
                          <Link to="/login">Login back ?</Link> |{" "}
                          <Link to="/signup">Signup</Link>
                        </div>
                      </Card>
                    </div>
                  </Transition>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Fragment>
        )}
      </Fragment>
    );
  };
}

export { Login, ForgotPassword, Register, Logout };
