import React, { Fragment, Component } from "react";
import { getCookie } from "./../cookie";
import { Link } from "react-router-dom";
import {
  Menu,
  Message,
  Transition,
  Input,
  Form,
  Grid,
  TextArea,
  Button,
  Dropdown,
  Icon
} from "semantic-ui-react";
import { red, green } from "./../../api";
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
      emptyData: false,
      icon: "user outline"
    };
  }

  set = obj => {
    this.setState(obj);
  };

  render = () => {
    let { isLoggedIn, active } = this.state;
    return (
      <div id="navbar">
        <Menu className="navbar_compon" secondary>
          {isLoggedIn ? (
            <Fragment>
              {this.props.display === true ? (
                <Menu.Item
                  icon="content"
                  style={{ color: "white" }}
                  onClick={() =>
                    this.props.set({ displayl: !this.props.displayl })
                  }
                />
              ) : (
                ""
              )}

              <Menu.Item
                name="Home"
                to="/home"
                as={Link}
                style={{ color: "white", marginLeft: 10 }}
                onClick={() => window.location.refresh()}
                active={active === 1}
              />

              <Menu.Item
                position="right"
                style={{ border: "none", outline: "none" }}
              >
                <Menu className="navbar_right" secondary>
                  {this.props.subgroup !== undefined &&
                  Object.entries(this.props.subgroup).length !== 0 ? (
                    <Menu.Item>
                      <Input
                        icon={
                          <Icon name="search" style={{ color: "#1ce0c3" }} />
                        }
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
                        <Dropdown
                          direction="left"
                          icon="bell"
                          style={{ color: "white" }}
                        >
                          <Dropdown.Menu
                            style={{
                              width: 350,
                              height: 350
                            }}
                          >
                            <AllNotify group={this.props.group} />
                          </Dropdown.Menu>
                        </Dropdown>
                      </Menu.Item>
                    </Fragment>
                  ) : (
                    ""
                  )}
                  <Menu.Item>
                    <Dropdown
                      icon={<Icon name={this.state.icon} />}
                      direction="left"
                      onClick={() => this.setState({ icon: "user" })}
                      onClose={() => this.setState({ icon: "user outline" })}
                    >
                      <Dropdown.Menu>
                        <Dropdown.Item
                          icon="cog"
                          as={Link}
                          to="/profile"
                          text="Settings"
                        />
                        <Dropdown.Divider />
                        <Dropdown.Item
                          as={Link}
                          to="/logout"
                          icon="power"
                          text="Logout"
                        />
                      </Dropdown.Menu>
                    </Dropdown>
                  </Menu.Item>
                </Menu>
              </Menu.Item>

              {this.props.display === true ? (
                <Menu.Item
                  icon="content"
                  style={{ color: "white" }}
                  onClick={() =>
                    this.props.set({ displayr: !this.props.displayr })
                  }
                />
              ) : (
                ""
              )}
            </Fragment>
          ) : (
            <Fragment>
              <Menu.Item active={true}>
                <h5 style={{ color: "white" }}>BrandFactory Inc</h5>
              </Menu.Item>
              <Menu.Item position="right">
                <Menu secondary>
                  {active === 2 ? (
                    <Menu.Item
                      as={Link}
                      style={{ color: "white" }}
                      to="/login"
                      name="Login"
                      position="right"
                      link={true}
                      active={active === 1}
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
                      style={{ color: "white" }}
                      active={active === 2}
                    />
                  ) : (
                    ""
                  )}
                </Menu>
              </Menu.Item>
            </Fragment>
          )}
        </Menu>
      </div>
    );
  };
}

/*
 * Props used:
 * 1. trigger
 * 2. update
 * 3. message
 * 4. type
 */
class MessageDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trigger: false,
      update: false
    };
    /* update: true does not imply the message is showed.
     * update: false does not also imply the message is not showed.
     * update value is just exchanged to to show/hide the message
     */
    this.timeout = false;
  }

  componentDidUpdate = (prevProps, presState) => {
    if (prevProps.update !== this.props.update) {
      if (this.timeout !== false) {
        clearTimeout(this.timeout);
      }
      this.setState(
        {
          update: !this.state.update,
          trigger: this.props.trigger
        },
        () => {
          this.timeout = setTimeout(
            () => this.setState({ trigger: false }),
            6000
          );
        }
      );
    }
  };

  handleDismiss = () => {
    this.setState({ trigger: false, message: "", type: 1 });
    clearTimeout(this.timeout);
  };

  render = () => {
    let color = this.props.type === 1 ? red : green;
    return (
      <Fragment>
        <Transition
          animation="scale"
          duration={400}
          visible={this.state.trigger}
        >
          <Message
            id="message-display"
            style={{ background: color, color: "white" }}
            onDismiss={this.handleDismiss}
            header={this.props.type === 1 ? "Error" : "Success"}
            content={this.props.message}
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
          <Grid.Column width={12} id="custom_textarea">
            <div style={{ width: "100%" }}>
              <TextArea
                id="custom_textara_comment"
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
                  id="submit"
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
