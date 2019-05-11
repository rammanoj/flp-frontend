import React, { Fragment, Component } from "react";
import {
  Grid,
  Dimmer,
  Loader,
  Divider,
  Accordion,
  Menu,
  Icon,
  Transition,
  Button,
  Modal,
  Input,
  TextArea,
  Header
} from "semantic-ui-react";
import { Redirect } from "react-router-dom";
import { getCookie } from "./cookie";
import { NavBar, MessageDisplay } from "./elements/nav";
import { GroupListView, GroupCreateView, TeamAddRemoveUser } from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";
import { Scrollbars } from "react-custom-scrollbars";
import { BasePost } from "./post";
import UserList from "./team";
import { Invite } from "./invite";
import Notify from "./notifications";

class Home extends Component {
  constructor(props) {
    super(props);

    let params = this.props.match.params;
    this.state = {
      isLoggedIn: getCookie("token")[1],
      loading: true,
      groups: [],
      groupSelected: {},
      active: false,
      activeItem: false,
      groupname: "",
      groupabout: "",
      visible: false,
      formloading: false,
      message: {
        message: false,
        header: "",
        type: ""
      },
      loader: false,
      params: Object.keys(params).length !== 0 ? params : false,
      notFound: false
    };

    this.child = React.createRef();
  }

  handleSearch = (e, value) => {
    this.child.current.onsearchEnter(e, value);
  };

  setMessage = message => {
    this.setState({ message: message });
  };

  isempty = arg => {
    return Object.entries(arg).length === 0;
  };

  setLoader = value => {
    this.setState({ loader: value });
  };

  componentDidMount = () => {
    if (this.state.isLoggedIn) {
      fetchAsynchronous(
        GroupListView,
        "GET",
        undefined,
        { Authorization: "Token " + getCookie("token")[0].value },
        this.getGroupsCallback
      );
    } else {
      console.log("user is not loggedIn");
    }
  };

  getGroupsCallback = response => {
    if (!response.hasOwnProperty("error")) {
      this.setState(
        {
          loading: false,
          groups: response.results
        },
        () => {
          if (this.state.params) {
            let obj = this.state.groups.find(
              obj => obj.pk == this.state.params.group
            );
            if (obj === undefined) {
              this.setState({ notFound: true });
            } else {
              this.handleGroupSelect(obj);
            }
          }
        }
      );
    }
  };

  handleGroupSelect = obj => {
    this.setState({ groupSelected: obj, activeItem: obj.pk, active: false });
  };

  handleChange = e => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  HandleFormSubmit = () => {
    let data = {
      name: this.state.groupname,
      about: this.state.groupabout
    };

    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };

    this.setState({
      formloading: true,
      message: { message: false, header: "", type: 1 }
    });
    fetchAsynchronous(
      GroupCreateView,
      "POST",
      data,
      headers,
      this.handleGroupAPICallback
    );
  };

  handleModalClose = () => {
    this.setState({
      visible: false,
      groupname: "",
      groupabout: ""
    });
  };

  handleGroupAPICallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({
        message: { message: response.message, type: 1, header: "Error" },
        formloading: false
      });
    } else {
      let groups = this.state.groups;
      groups.unshift(response);
      this.setState({
        message: {
          message: "Successfully added the group",
          type: 0,
          header: "Success"
        },
        formloading: false,
        visible: false,
        groups: groups
      });
    }
  };

  updateGroup = obj => {
    let index = this.state.groups.indexOf(this.state.groupSelected);
    let groups = [...this.state.groups];
    groups[index] = obj;
    this.setState({ groups: groups, groupSelected: obj });
  };

  removeGroup = () => {
    let index = this.state.groups.indexOf(this.state.groupSelected);
    let groups = [...this.state.groups];
    groups.splice(index, 1);
    this.setState({ groups: groups, groupSelected: {} });
  };

  render() {
    let { groupSelected: group, active, activeItem, visible } = this.state;
    if (!this.state.isLoggedIn) {
      return <Redirect to="/login" />;
    }
    return (
      <div>
        {this.state.notFound ? <Redirect to="/404" /> : ""}
        {this.state.loading ? (
          <div>
            <Dimmer active inverted>
              <Loader size="medium">Fetching Groups..</Loader>
            </Dimmer>
          </div>
        ) : (
          <Fragment>
            <NavBar
              active={1}
              search={!this.isempty(group)}
              func={this.handleSearch}
            />
            <MessageDisplay
              message={this.state.message.message}
              header={this.state.message.header}
              type={this.state.message.type}
            />
            {this.state.loader ? (
              <Dimmer active>
                <Loader name="loading..." />
              </Dimmer>
            ) : (
              ""
            )}
            <Transition animation="scale" duration={400} visible={visible}>
              <Modal open={visible} centered={false}>
                <Modal.Header>
                  Add a new Group ?
                  <Button
                    icon="close"
                    onClick={this.handleModalClose}
                    circular
                    negative
                    style={{
                      float: "right"
                    }}
                  />
                </Modal.Header>
                <Modal.Content>
                  <Grid columns="equal">
                    <Grid.Row>
                      <Grid.Column />
                      <Grid.Column textAlign="center">
                        {" "}
                        <Input
                          icon="users"
                          type="text"
                          name="groupname"
                          iconPosition="left"
                          placeholder="Group Name"
                          value={this.state.gorupname}
                          onChange={this.handleChange}
                          style={{ marginBottom: 15 }}
                        />
                        <TextArea
                          placeholder="Tell us more"
                          name="groupabout"
                          value={this.state.groupabout}
                          onChange={this.handleChange}
                          style={{ marginBottom: 15 }}
                          rows={4}
                        />
                        <Button
                          disabled={this.state.formloading}
                          onClick={this.HandleFormSubmit}
                          loading={this.state.formloading}
                          secondary
                        >
                          Add new
                        </Button>
                        <Divider horizontal />
                      </Grid.Column>

                      <Grid.Column />
                    </Grid.Row>
                  </Grid>
                </Modal.Content>
              </Modal>
            </Transition>
            <Grid celled="internally" style={{ height: "83%" }}>
              <Grid.Row style={{ height: "83vh" }}>
                <Grid.Column width={4}>
                  <Scrollbars
                    style={{
                      height: "99%",
                      overflowX: "hidden",
                      width: "100%"
                    }}
                  >
                    <Accordion>
                      <Accordion.Title
                        active={active}
                        index={0}
                        onClick={() =>
                          this.setState({
                            active: active ? false : true
                          })
                        }
                      >
                        <Icon name="users" />
                        Groups <Icon name="dropdown" />
                      </Accordion.Title>
                      <Transition
                        animation="drop"
                        duration={500}
                        visible={active}
                      >
                        <Accordion.Content active={active}>
                          <div style={{ width: "auto", textAlign: "center" }}>
                            <Scrollbars style={{ height: "25vh" }}>
                              {this.state.groups.length === 0 ? (
                                <div style={{ textAlign: "center" }}>
                                  No groups currently
                                </div>
                              ) : (
                                <Menu vertical style={{ width: "100%" }}>
                                  <React.Fragment>
                                    {this.state.groups.map((obj, index) => (
                                      <Menu.Item
                                        key={index}
                                        name={obj.name}
                                        active={activeItem === obj.pk}
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          this.handleGroupSelect(obj)
                                        }
                                      >
                                        {obj.name}
                                      </Menu.Item>
                                    ))}
                                  </React.Fragment>
                                </Menu>
                              )}
                            </Scrollbars>
                          </div>
                        </Accordion.Content>
                      </Transition>
                    </Accordion>
                    <Button
                      secondary
                      style={{ width: "90%" }}
                      onClick={() =>
                        this.setState({
                          visible: true,
                          message: { message: false, header: "", type: 1 }
                        })
                      }
                    >
                      <Icon name="add" />
                      Add new Group
                    </Button>

                    {this.isempty(group) ? (
                      ""
                    ) : (
                      <Fragment>
                        <GroupSelected
                          group={group}
                          setLoader={this.setLoader}
                          updateGroup={this.updateGroup}
                          setMessage={this.setMessage}
                          removeGroup={this.removeGroup}
                        />
                      </Fragment>
                    )}
                  </Scrollbars>
                </Grid.Column>

                <Grid.Column width={8}>
                  {this.isempty(group) ? (
                    <div
                      style={{
                        marginTop: "calc(100px + 15vh)",
                        textAlign: "center"
                      }}
                    >
                      <h2>Select a Group to Continue</h2>
                      <Grid columns="equal">
                        <Grid.Row>
                          <Grid.Column />
                          <Grid.Column>
                            <Divider
                              horizontal
                              style={{ width: "10vw", marginLeft: 30 }}
                            >
                              Or
                            </Divider>
                          </Grid.Column>
                          <Grid.Column />
                        </Grid.Row>
                      </Grid>
                      <h2>Create a new Group</h2>
                    </div>
                  ) : (
                    <BasePost
                      ref={this.child}
                      setLoader={this.setLoader}
                      group={this.state.groupSelected}
                      setMessage={this.setMessage}
                      params={
                        this.state.params !== false
                          ? this.state.params.post
                          : false
                      }
                    />
                  )}
                </Grid.Column>

                <Grid.Column width={4}>
                  {this.isempty(group) ? (
                    ""
                  ) : (
                    <Scrollbars
                      style={{
                        height: "99%"
                      }}
                    >
                      <Notify group={group} />
                      <UserList group={group} />
                      <Invite group={group} setMessage={this.setMessage} />
                    </Scrollbars>
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Fragment>
        )}
      </div>
    );
  }
}

class GroupSelected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      group: this.props.group,
      visible: true,
      modalvisible: false,
      formloading: false,
      groupname: this.props.group.name,
      groupabout: this.props.group.about,
      message: { message: false, header: "", type: 1 },
      alertAction: 0,
      alertMessage: "",
      alertvisible: false
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.group != prevProps.group) {
      this.setState({
        group: this.props.group,
        groupname: this.props.group.name,
        groupabout: this.props.group.about
      });
    }
  };

  handleChange = e => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleModalClose = () => {
    this.setState({
      modalvisible: false
    });
  };

  handleUpdate = () => {
    let data = {
      name: this.state.groupname,
      about: this.state.groupabout
    };

    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };

    this.setState({ formloading: true });
    fetchAsynchronous(
      GroupListView + this.state.group.pk + "/",
      "PATCH",
      data,
      headers,
      this.handleUpdateResponse
    );
  };

  handleUpdateResponse = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({
        formloading: false
      });
      this.props.setMessage({
        message: response.message,
        type: 1,
        header: "Error"
      });
    } else {
      this.setState({
        formloading: false,
        modalvisible: false
      });
      this.props.setMessage({
        message: "Successfully Updated the group",
        type: 0,
        header: "Success"
      });
      this.props.updateGroup(response);
    }
  };

  handleAlert = operation => {
    /*
     * 0: delete
     * 1: exit
     */
    let content;
    if (operation === 0) {
      content =
        "The delete operation is invertible. All the posts regarding " +
        "the group will be permently lost on deleting the group.";
    } else {
      content =
        "You will have no access to the contents in the group on exiting the group";
    }
    this.setState({
      alertAction: operation,
      alertvisible: true,
      alertContent: content
    });
  };

  handleAlertClick = () => {
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value
    };
    this.setState({ alertvisible: false });
    this.props.setLoader(true);
    if (this.state.alertAction === 0) {
      fetchAsynchronous(
        GroupListView + this.state.group.pk + "/",
        "DELETE",
        undefined,
        headers,
        this.handleAlertResponse
      );
    } else {
      let data = {
        operation: "Remove",
        team: this.state.group.pk
      };
      headers["Content-Type"] = "application/json";
      fetchAsynchronous(
        TeamAddRemoveUser,
        "POST",
        data,
        headers,
        this.handleAlertResponse
      );
    }
  };

  handleAlertResponse = response => {
    this.props.setMessage({
      message: response.message,
      header: response.error === 0 ? "Success" : "Error",
      type: response.error === 0 ? 0 : 1
    });
    this.props.setLoader(false);
    this.props.removeGroup();
  };

  render = () => {
    let { group, modalvisible, alertvisible } = this.state;
    return (
      <Fragment>
        {this.state.alertloading ? (
          <Dimmer active>
            <Loader content="Loading..." />
          </Dimmer>
        ) : (
          ""
        )}
        <Transition animation="scale" duration={400} visible={alertvisible}>
          <Modal open={alertvisible} basic size="small">
            <Header icon="exclamation triangle" content="Are you sure ?" />
            <Modal.Content>
              <p>{this.state.alertContent}</p>
            </Modal.Content>
            <Modal.Actions>
              <Button
                basic
                color="red"
                inverted
                onClick={() => this.setState({ alertvisible: false })}
              >
                <Icon name="remove" /> No
              </Button>
              <Button color="green" inverted onClick={this.handleAlertClick}>
                <Icon name="checkmark" /> Yes
              </Button>
            </Modal.Actions>
          </Modal>
        </Transition>
        <Transition animation="scale" duration={400} visible={modalvisible}>
          <Modal open={modalvisible} centered={false}>
            <Modal.Header>
              Update Group ?
              <Button
                icon="close"
                onClick={this.handleModalClose}
                circular
                negative
                style={{
                  float: "right"
                }}
              />
            </Modal.Header>
            <Modal.Content>
              <Grid columns="equal">
                <Grid.Row>
                  <Grid.Column />
                  <Grid.Column textAlign="center">
                    <Input
                      icon="users"
                      type="text"
                      name="groupname"
                      iconPosition="left"
                      placeholder="Group Name"
                      value={this.state.groupname}
                      onChange={this.handleChange}
                      style={{ marginBottom: 15 }}
                    />
                    <TextArea
                      placeholder="Tell us more"
                      name="groupabout"
                      value={this.state.groupabout}
                      onChange={this.handleChange}
                      style={{ marginBottom: 15 }}
                      rows={4}
                    />
                    <Button
                      disabled={this.state.formloading}
                      onClick={this.handleUpdate}
                      loading={this.state.formloading}
                      secondary
                    >
                      Update Existing
                    </Button>
                    <Divider horizontal />
                  </Grid.Column>

                  <Grid.Column />
                </Grid.Row>
              </Grid>
            </Modal.Content>
          </Modal>
        </Transition>
        <Transition
          animation="scale"
          duration={400}
          visible={this.state.visible}
        >
          <Fragment>
            <h2>{group.name}</h2>
            {group.edit ? (
              <Button.Group style={{ width: "90%" }}>
                <Button
                  onClick={() => {
                    this.setState({ modalvisible: true });
                    let message = {
                      message: false,
                      header: "",
                      type: ""
                    };
                    this.props.setMessage(message);
                  }}
                >
                  Update
                </Button>
                <Button.Or style={{ color: "black" }} />
                <Button onClick={() => this.handleAlert(0)} negative>
                  Delete
                </Button>
              </Button.Group>
            ) : (
              ""
            )}
            <h5>About: </h5>
            <p style={{ width: "90%" }}>{group.about}</p>
            <h5>Created By: </h5>
            <p>{group.created_by}</p>
            {!group.edit ? (
              <Fragment>
                <Button negative onClick={() => this.handleAlert(1)}>
                  Exit group
                </Button>
              </Fragment>
            ) : (
              ""
            )}
            <br />
          </Fragment>
        </Transition>
      </Fragment>
    );
  };
}

export default Home;
