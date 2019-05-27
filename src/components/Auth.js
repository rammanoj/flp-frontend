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
import { contents as carousel } from "./../api";
import "./../App.css";

class Carousel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contents: carousel,
      selected: 0,
      visible: false,
      select: new Array(carousel.length),
      change: false
    };

    this.change = false;
  }

  componentDidMount = () => {
    this.setState({ visible: true });
  };

  render = () => {
    let { contents, selected } = this.state;
    return (
      <Fragment>
        <div>
          <h3>{contents[selected].header}</h3>
          <p>{contents[selected].message}</p>
        </div>

        <br />
        <br />
        {contents.map((obj, index) => (
          <span
            key={index}
            style={index === selected ? { backgroundColor: "#b9f6ca" } : {}}
            onClick={() => {
              this.setState({
                selected: index,
                visible: false,
                select: false
              });
              this.change = true;
            }}
            className="dot"
          />
        ))}
      </Fragment>
    );
  };
}

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: getCookie("token")[1],
      user: "",
      password: "",
      remember_me: false,
      message: {
        message: "",
        trigger: false,
        type: ""
      },
      update: false,
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
        message: { message: data.message, type: data.error, trigger: true },
        update: !this.state.update,
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
      document.body.style.backgroundColor = "#f0f4f3";
      return (
        <Fragment>
          <div id="login">
            <NavBar active={1} />

            <MessageDisplay
              message={this.state.message.message}
              type={this.state.message.type}
              trigger={this.state.message.trigger}
              update={this.state.update}
            />

            <Transition
              animation="scale"
              visible={this.state.visible}
              duration={400}
            >
              <Grid>
                <Grid.Row style={{ height: "89.5vh" }}>
                  <Grid.Column computer={3} mobile={1} />
                  <Grid.Column computer={10} mobile={14}>
                    <Card className="card_comp">
                      <Grid style={{ height: "100%" }}>
                        <Grid.Row style={{ height: "100%" }}>
                          <Grid.Column mobile={16} tablet={8} computer={8}>
                            <div className="carousel_compon">
                              <h2
                                style={{
                                  marginBottom: "5vh",
                                  marginTop: "10vh"
                                }}
                              >
                                BrandFactory Inc.
                              </h2>
                              <Carousel />
                            </div>
                          </Grid.Column>
                          <Grid.Column mobile={16} tablet={8} computer={8}>
                            <form className="login_form">
                              <h2 className="header">Login Please</h2>
                              <Grid style={{ height: "100%" }}>
                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={10}>
                                    <Input
                                      icon="users"
                                      iconPosition="left"
                                      placeholder="Username / Email"
                                      name="user"
                                      value={this.state.username}
                                      onChange={this.handleChange}
                                    />
                                  </Grid.Column>
                                  <Grid.Column width={3} />
                                </Grid.Row>
                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={10}>
                                    <Input
                                      icon="lock"
                                      iconPosition="left"
                                      placeholder="Password"
                                      name="password"
                                      type="password"
                                      value={this.state.password}
                                      onChange={this.handleChange}
                                    />
                                  </Grid.Column>
                                  <Grid.Column width={3} />
                                </Grid.Row>
                                <Grid.Row>
                                  <Grid.Column width={5} />
                                  <Grid.Column width={6}>
                                    <div style={{ justifyContent: "center" }}>
                                      <Checkbox
                                        label="Remember me"
                                        defaultChecked
                                      />
                                    </div>
                                  </Grid.Column>

                                  <Grid.Column width={5} />
                                </Grid.Row>
                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={5}>
                                    <Button
                                      disabled={this.state.loading}
                                      onClick={this.HandleFormSubmit}
                                      loading={this.state.loading}
                                      className="login_button"
                                      type="submit"
                                    >
                                      Login
                                    </Button>
                                  </Grid.Column>
                                  <Grid.Column width={5}>
                                    <Button
                                      className="signup_button"
                                      as={Link}
                                      to="/signup"
                                    >
                                      Signup
                                    </Button>
                                  </Grid.Column>

                                  <Grid.Column width={3} />
                                </Grid.Row>
                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={10}>
                                    <Link
                                      to="/forgotpassword"
                                      style={{ color: "#35b18a" }}
                                    >
                                      forgot your password ?
                                    </Link>
                                  </Grid.Column>
                                  <Grid.Column width={3} />
                                </Grid.Row>
                              </Grid>
                              <br />
                            </form>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    </Card>
                  </Grid.Column>
                  <Grid.Column computer={3} mobile={1} />
                </Grid.Row>
              </Grid>
            </Transition>
          </div>
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
      message: {
        message: "",
        trigger: false,
        tpye: ""
      },
      update: false,
      loading: false,
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
      loading: false
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
      message: {
        message: data.message,
        type: data.error,
        trigger: true
      },
      update: !this.state.update,
      loading: false
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
          <MessageDisplay
            message={this.state.message.message}
            type={this.state.message.type}
            trigger={this.state.message.trigger}
            update={this.state.update}
          />

          <div id="forgotpassword">
            <NavBar active={3} />

            <Transition
              animation="scale"
              visible={this.state.visible}
              duration={400}
            >
              <Grid>
                <Grid.Row style={{ height: "89.5vh" }}>
                  <Grid.Column mobile={1} tablet={0} computer={3} />
                  <Grid.Column mobile={14} tablet={16} computer={10}>
                    <Card className="card_comp">
                      <Grid style={{ height: "100%" }}>
                        <Grid.Row style={{ height: "100%" }}>
                          <Grid.Column mobile={16} tablet={8} computer={8}>
                            <div className="carousel_compon">
                              <h2
                                style={{
                                  marginBottom: "5vh",
                                  marginTop: "10vh"
                                }}
                              >
                                BrandFactory Inc.
                              </h2>
                              <Carousel />
                            </div>
                          </Grid.Column>
                          <Grid.Column mobile={16} tablet={8} computer={8}>
                            <form className="forgotpassword_form">
                              <h2 className="header">Forgot Password</h2>
                              <Grid style={{ height: "100%" }}>
                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={10}>
                                    <Input
                                      icon="mail"
                                      type="email"
                                      iconPosition="left"
                                      placeholder="Enter email"
                                      value={this.state.email}
                                      onChange={e =>
                                        this.setState({ email: e.target.value })
                                      }
                                    />
                                  </Grid.Column>
                                  <Grid.Column width={3} />
                                </Grid.Row>

                                <Grid.Row>
                                  <Grid.Column width={6} />
                                  <Grid.Column width={5}>
                                    <Button
                                      className="forgotpassword_button"
                                      disabled={this.state.loading}
                                      onClick={this.HandleFormSubmit}
                                      loading={this.state.loading}
                                      secondary
                                    >
                                      Validate
                                    </Button>
                                  </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                  <Grid.Column width={6} />
                                  <Grid.Column width={2}>
                                    <Link
                                      to="/login"
                                      style={{ color: "#35b18a" }}
                                    >
                                      Login
                                    </Link>
                                  </Grid.Column>
                                  <Grid.Column width={2}>
                                    <Link
                                      to="/signup"
                                      style={{ color: "#35b18a" }}
                                    >
                                      Signup
                                    </Link>
                                  </Grid.Column>
                                  <Grid.Column width={6} />
                                </Grid.Row>
                              </Grid>
                              <br />
                            </form>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    </Card>
                  </Grid.Column>
                  <Grid.Column mobile={1} tablet={0} computer={3} />
                </Grid.Row>
              </Grid>
            </Transition>
          </div>
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
      message: {
        message: "",
        trigger: false,
        type: ""
      },
      update: false,
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
      message: {
        message: "",
        trigger: false,
        type: ""
      },
      update: false,
      loading: false
    });
  };

  HandleFormSubmit = e => {
    e.preventDefault();
    this.setState({ loading: true });
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
    this.setState({
      message: {
        message:
          data.error === 1
            ? data.message
            : "User successfully registered, confirm the verification mail",
        trigger: true,
        type: data.error
      },
      update: !this.state.update
    });
  };

  render = () => {
    if (this.state.isLoggedIn) {
      return <Redirect to="/home" />;
    } else {
      document.body.style.backgroundColor = "#f0f4f3";
      // render the components
      return (
        <Fragment>
          <NavBar active={2} />
          <MessageDisplay
            message={this.state.message.message}
            type={this.state.message.type}
            trigger={this.state.message.trigger}
            update={this.state.update}
          />

          <div id="register">
            <Transition
              animation="scale"
              visible={this.state.visible}
              duration={400}
            >
              <Grid>
                <Grid.Row style={{ height: "89.5vh" }}>
                  <Grid.Column mobile={1} tablet={0} computer={3} />
                  <Grid.Column mobile={14} tablet={16} computer={10}>
                    <Card className="card_comp">
                      <Grid style={{ height: "100%" }}>
                        <Grid.Row style={{ height: "100%" }}>
                          <Grid.Column mobile={16} tablet={16} computer={8}>
                            <div className="carousel_compon">
                              <h2
                                style={{
                                  marginBottom: "5vh",
                                  marginTop: "10vh"
                                }}
                              >
                                BrandFactory Inc.
                              </h2>
                              <Carousel />
                            </div>
                          </Grid.Column>
                          <Grid.Column mobile={16} tablet={16} computer={8}>
                            <form className="register_form">
                              <h2 className="header">Register Please</h2>
                              <Grid style={{ height: "100%" }}>
                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={10}>
                                    <Input
                                      icon="users"
                                      type="text"
                                      iconPosition="left"
                                      placeholder="Enter Username"
                                      name="username"
                                      value={this.state.username}
                                      onChange={this.handleChange}
                                    />
                                  </Grid.Column>
                                  <Grid.Column width={3} />
                                </Grid.Row>
                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={10}>
                                    <Input
                                      icon="mail"
                                      type="email"
                                      iconPosition="left"
                                      placeholder="Enter Email"
                                      name="email"
                                      value={this.state.email}
                                      onChange={this.handleChange}
                                    />
                                  </Grid.Column>
                                  <Grid.Column width={3} />
                                </Grid.Row>
                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={10}>
                                    <Input
                                      icon="lock"
                                      type="password"
                                      iconPosition="left"
                                      placeholder="Enter Password"
                                      name="password"
                                      value={this.state.password}
                                      onChange={this.handleChange}
                                    />
                                  </Grid.Column>
                                  <Grid.Column width={3} />
                                </Grid.Row>

                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={10}>
                                    <Input
                                      icon="lock"
                                      type="password"
                                      iconPosition="left"
                                      placeholder="Confirm Password"
                                      name="confirm_password"
                                      value={this.state.confirm_password}
                                      onChange={this.handleChange}
                                    />
                                  </Grid.Column>
                                  <Grid.Column width={3} />
                                </Grid.Row>
                                <Grid.Row>
                                  <Grid.Column width={3} />
                                  <Grid.Column width={10}>
                                    <Button
                                      style={{ width: "100%" }}
                                      disabled={this.state.loading}
                                      onClick={this.HandleFormSubmit}
                                      loading={this.state.loading}
                                      secondary
                                      className="register_button"
                                    >
                                      Register
                                    </Button>
                                  </Grid.Column>

                                  <Grid.Column width={3} />
                                </Grid.Row>
                              </Grid>
                              <br />
                            </form>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    </Card>
                  </Grid.Column>
                  <Grid.Column mobile={1} tablet={0} computer={3} />
                </Grid.Row>
              </Grid>
            </Transition>
          </div>
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
