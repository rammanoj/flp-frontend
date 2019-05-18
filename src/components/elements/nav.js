import React, { Fragment, Component } from "react";
import { getCookie } from "./../cookie";
import { Link } from "react-router-dom";
import {
  Menu,
  Segment,
  Message,
  Transition,
  Input,
  Form,
  Grid,
  TextArea,
  Button,
  Dropdown,
  Loader
} from "semantic-ui-react";
import { red, green, notifyListView } from "./../../api";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchAsynchronous } from "./../controllers/fetch";
import { AllNotify } from "../allnotify";

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      active: this.props.active,
      search: "",
      notifications: ["asodnaosknd", "this is a sample", "hellow workd"],
      page: 1,
      paginate: false,
      loading: true,
      emptyData: false
    };
  }

  set = obj => {
    this.setState(obj);
  };

  render = () => {
    let { isLoggedIn, active } = this.state;
    return (
      <Segment inverted>
        <Menu inverted secondary style={{ height: 1 }}>
          {isLoggedIn ? (
            <Fragment>
              <Menu.Item active={true}>
                <h5>BrandFactory Inc</h5>
              </Menu.Item>

              <Menu.Item
                name="Home"
                to="/home"
                as={Link}
                onClick={() => window.location.refresh()}
                active={active === 1}
              />

              <Menu.Item position="right">
                <Menu inverted>
                  {Object.entries(this.props.subgroup).length !== 0 ? (
                    <Menu.Item>
                      <Input
                        icon="search"
                        type="text"
                        placeholder="Search"
                        value={this.state.search}
                        onChange={e =>
                          this.setState({ search: e.target.value })
                        }
                        onKeyPress={e => this.props.func(e, this.state.search)}
                      />
                    </Menu.Item>
                  ) : (
                    ""
                  )}
                  {this.props.hasOwnProperty("search") && this.props.search ? (
                    <Fragment>
                      <Menu.Item>
                        <Dropdown pointing icon="bell">
                          {/* <AllNotify group={this.props.group} /> */}
                        </Dropdown>
                      </Menu.Item>
                    </Fragment>
                  ) : (
                    ""
                  )}
                  <Menu.Item
                    name="Profile"
                    as={Link}
                    to="/profile"
                    onClick={this.handleItemClick}
                    active={active === 2}
                  />
                  <Menu.Item
                    name="Logout"
                    as={Link}
                    to="/logout"
                    onClick={this.handleItemClick}
                    active={active === 3}
                  />
                </Menu>
              </Menu.Item>
            </Fragment>
          ) : (
            <Fragment>
              <Menu.Item active={true}>
                <h4>BrandFactory</h4>
              </Menu.Item>
              <Menu.Item position="right">
                <Menu inverted>
                  {active === 2 ? (
                    <Menu.Item
                      as={Link}
                      to="/login"
                      name="Login"
                      position="right"
                      link={true}
                      active={active === 1}
                      onClick={this.handleItemClick}
                    />
                  ) : (
                    ""
                  )}
                  {active === 1 ? (
                    <Menu.Item
                      as={Link}
                      to="/signup"
                      name="Signup"
                      position="right"
                      style={{ float: "right" }}
                      active={active === 2}
                      onClick={this.handleItemClick}
                    />
                  ) : (
                    ""
                  )}
                </Menu>
              </Menu.Item>
            </Fragment>
          )}
        </Menu>
      </Segment>
    );
  };
}

class MessageDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: this.props.message,
      header: "",
      type: false,
      timeout: false
    };
    var timeout = false;
  }

  componentDidUpdate = (prevprops, presState) => {
    if (prevprops.message !== this.props.message) {
      if (this.timeout !== false) {
        clearTimeout(this.timeout);
      }
      this.setState({
        message: this.props.message,
        header: this.props.header
      });
      this.timeout = setTimeout(
        () => this.setState({ message: false, type: false, header: "" }),
        7000
      );
    }
  };

  handleDismiss = () => {
    this.setState({ message: false, header: "" });
    clearTimeout(this.timeout);
  };

  render = () => {
    let color = this.props.type === 1 ? red : green;
    return (
      <Fragment>
        <Transition
          animation="scale"
          duration={400}
          visible={this.state.message !== false}
        >
          <Message
            style={{
              left: 10,
              bottom: 30,
              width: "calc(100px + 20vw)",
              position: "absolute",
              color: color,
              zIndex: 1002
            }}
            onDismiss={this.handleDismiss}
            header={this.props.header}
            content={this.state.message}
          />
        </Transition>
      </Fragment>
    );
  };
}

class CustomTextArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false
    };
  }
  render = () => (
    <Form>
      <Grid>
        <Grid.Row>
          <Grid.Column width={2} />
          <Grid.Column
            width={12}
            style={{ border: "1px solid #dbdde0", borderRadius: 5 }}
          >
            <div style={{ width: "100%" }}>
              <TextArea
                placeholder={this.props.placeholder}
                style={{ border: "none", resize: "none" }}
                defaultValue={this.props.value}
                onChange={e => {
                  if (e.target.value === "") {
                    this.setState({ disabled: true });
                  } else {
                    this.setState({ disabled: false });
                    this.props.changeHandler(e);
                  }
                }}
              />
              <div style={{ float: "right" }}>
                <Button
                  secondary
                  disabled={this.state.disabled}
                  loading={this.props.loading}
                  onClick={this.props.onSuccess}
                >
                  {this.props.button}
                </Button>
                <Button onClick={this.props.onCancel}>cancel</Button>
              </div>
            </div>
          </Grid.Column>
          <Grid.Column width={2} />
        </Grid.Row>
      </Grid>
    </Form>
  );
}

export { NavBar, MessageDisplay, CustomTextArea };
