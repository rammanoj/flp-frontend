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
  Header,
  Form,
  Sidebar,
  Image,
  Dropdown
} from "semantic-ui-react";
import { Redirect } from "react-router-dom";
import { getCookie } from "./cookie";
import { NavBar, MessageDisplay } from "./elements/nav";
import {
  GroupListView,
  GroupCreateView,
  TeamAddRemoveUser,
  subGroupCreate,
  subGroupUpdate,
  maxUploadSize
} from "./../api";
import { fetchAsynchronous, fetchFileAsynchronous } from "./controllers/fetch";
import { Scrollbars } from "react-custom-scrollbars";
import { BasePost } from "./post";
import UserList from "./team";
import { Invite } from "./invite";
import Notify from "./notifications";

var hoverselect = false,
  hoversub = false;

class Home extends Component {
  constructor(props) {
    super(props);
    let params = this.props.match.params;
    if (Object.entries(params).length === 0) {
      params = false;
    }
    this.state = {
      isLoggedIn: getCookie("token")[1],
      loading: true,
      groups: [],
      groupSelected: {},
      active: false,
      activeItem: false,
      groupname: "",
      groupabout: "",
      grouppic: "",
      visible: false,
      subgroup: {},
      formloading: false,
      renderpost: false,
      message: {
        message: "",
        trigger: false,
        type: ""
      },
      params: params,
      loader: false,
      notFound: false,
      pksearch: false,
      change: false,
      redirect: false,
      hover: false,
      displayl: window.innerWidth < 800 ? true : false,
      displayr: window.innerWidth < 800 ? true : false,
      alertvisible: false,
      alertAction: -1,
      alertContent: "",
      modalvisible: false,
      operation_pk: -1,
      update: false
    };

    this.child = React.createRef();
  }

  handleSearch = (e, value) => {
    this.child.current.onsearchEnter(e, value);
  };

  setMessage = message => {
    message["trigger"] = true;
    this.setState({ message: message, update: !this.state.update });
    console.log("came here to set the date");
  };

  isempty = arg => {
    if (arg instanceof Object) {
      return Object.entries(arg).length === 0;
    }
    return true;
  };

  setLoader = value => {
    this.setState({ loader: value });
  };

  set = obj => {
    console.log(obj);
    this.setState(obj);
  };

  componentDidUpdate = (prevprops, prestate) => {
    if (this.state.redirect !== false) {
      this.setState({ redirect: false });
    }

    if (
      this.props.match.params !== prevprops.match.params &&
      Object.entries(this.props.match.params).length !== 0
    ) {
      let temp = this.props.match.params;
      let obj = this.state.groups.find(obj => obj.pk === parseInt(temp.group));
      if (obj === undefined) {
        this.setState({ notFound: true });
      } else {
        let subgroup = obj.subgroup_set.find(
          elem => elem.pk === parseInt(temp.subgroup)
        );
        if (subgroup === undefined) {
          this.setState({ notFound: true });
        } else {
          this.setState({
            groupSelected: obj,
            activeItem: obj.pk,
            active: false,
            subgroup: subgroup,
            params: this.props.match.params,
            pksearch: parseInt(this.props.match.params.post)
          });
        }
      }
    }
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
      window.addEventListener("resize", this.updateSize);
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
              obj => obj.pk === parseInt(this.state.params.group)
            );
            if (obj === undefined) {
              this.setState({ notFound: true });
            } else {
              let subgroup = obj.subgroup_set.find(
                elem => elem.pk === parseInt(this.state.params.subgroup)
              );
              if (subgroup === undefined) {
                this.setState({ notFound: true });
              } else {
                this.setState({
                  groupSelected: obj,
                  activeItem: obj.pk,
                  active: false,
                  subgroup: subgroup,
                  pksearch: parseInt(this.state.params.post)
                });
              }
            }
          }
        }
      );
    }
  };

  handleGroupSelect = obj => {
    this.setState({
      groupSelected: obj,
      activeItem: obj.pk,
      active: false,
      subgroup: {},
      pksearch: false,
      change: !this.state.change,
      redirect: this.props.location.pathname !== "/home" ? "/home" : false
    });
  };

  handleChange = e => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  HandleFormSubmit = () => {
    let data = new FormData();
    data.append("name", this.state.groupname);
    data.append("about", this.state.groupabout);
    if (this.state.grouppic != "") {
      data.append("pic", this.state.grouppic);
    }
    this.setState({
      formloading: true
    });
    fetchFileAsynchronous(
      GroupCreateView,
      "POST",
      data,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.handleGroupAPICallback
    );
  };

  handleModalClose = () => {
    this.setState({
      visible: false,
      groupname: "",
      groupabout: "",
      formloading: false,
      grouppic: "",
      modalvisible: false
    });
  };

  handleGroupAPICallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({
        message: { message: response.message, type: 1, trigger: true },
        update: !this.state.update,
        formloading: false
      });
    } else {
      let groups = this.state.groups;
      groups.unshift(response);
      this.setState({
        message: {
          message: "Successfully added the group",
          type: 0,
          trigger: true
        },
        update: !this.state.update,
        formloading: false,
        visible: false,
        groups: groups,
        groupname: "",
        groupabout: "",
        grouppic: ""
      });
    }
  };

  handleUpdate = () => {
    let data = new FormData();
    data.append("name", this.state.groupname);
    data.append("about", this.state.groupabout);

    if (this.state.grouppic != "") {
      data.append("pic", this.state.grouppic);
    }

    this.setState({ formloading: true });
    fetchFileAsynchronous(
      GroupListView + this.state.operation_pk + "/",
      "PATCH",
      data,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.handleUpdateResponse
    );
  };

  handleUpdateResponse = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({
        formloading: false
      });
      this.setMessage({
        message: response.message,
        type: 1
      });
    } else {
      this.updateGroup(response);
      this.setState({
        formloading: false,
        modalvisible: false,
        groupname: "",
        groupabout: "",
        grouppic: "",
        operation_pk: -1
      });
      this.setMessage({
        message: "Successfully Updated the group",
        type: 0
      });
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
    this.setLoader(true);
    if (this.state.alertAction === 0) {
      fetchAsynchronous(
        GroupListView + this.state.operation_pk + "/",
        "DELETE",
        undefined,
        headers,
        this.handleAlertResponse
      );
    } else {
      let data = {
        operation: "Remove",
        team: this.state.operation_pk
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
    this.setMessage({
      message: response.message,
      type: response.error === 0 ? 0 : 1
    });
    this.setLoader(false);
    let index = this.state.groups.indexOf(
      this.state.groups.find(obj => obj.pk === this.state.operation_pk)
    );
    let groups = [...this.state.groups];
    groups.splice(index, 1);
    this.setState({ groups: groups, groupSelected: {}, operation_pk: -1 });
  };

  updateGroup = obj => {
    let index = this.state.groups.indexOf(
      this.state.groups.find(obj => obj.pk === this.state.operation_pk)
    );
    let groups = [...this.state.groups];
    groups[index] = obj;
    this.setState({ groups: groups, groupSelected: obj });
  };

  updateSize = () => {
    // Decide if sidebars hide/not
    let width = window.outerWidth;
    if (width < 800) {
      this.setState({ displayl: true, displayr: true });
    } else {
      this.setState({ displayr: false, displayl: false });
    }
  };

  render() {
    let {
      groupSelected: group,
      active,
      activeItem,
      visible,
      subgroup,
      alertvisible,
      modalvisible
    } = this.state;
    if (!this.state.isLoggedIn) {
      return <Redirect to="/login" />;
    }

    if (this.state.notFound) {
      return <Redirect to="/404" />;
    }

    if (this.state.redirect !== false) {
      return <Redirect to={this.state.redirect} />;
    }

    document.body.style.backgroundColor = "#ffffff";

    return (
      <div>
        <MessageDisplay
          message={this.state.message.message}
          type={this.state.message.type}
          update={this.state.update}
          trigger={this.state.message.trigger}
        />
        {this.state.loading ? (
          <div>
            <Dimmer active inverted>
              <Loader size="medium">Fetching Groups..</Loader>
            </Dimmer>
          </div>
        ) : (
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
                  <Button
                    color="green"
                    inverted
                    onClick={this.handleAlertClick}
                  >
                    <Icon name="checkmark" /> Yes
                  </Button>
                </Modal.Actions>
              </Modal>
            </Transition>

            <Transition animation="scale" duration={400} visible={modalvisible}>
              <Modal open={modalvisible} centered={false}>
                <Modal.Header>
                  Update Group ?
                  <Icon
                    name="close"
                    style={{ float: "right", cursor: "pointer", color: "red" }}
                    onClick={this.handleModalClose}
                  />
                </Modal.Header>
                <Modal.Content>
                  <Form id="groupupdate">
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
                            style={{ marginBottom: 15, width: "100%" }}
                          />
                          <TextArea
                            placeholder="Tell us more"
                            name="groupabout"
                            value={this.state.groupabout}
                            onChange={this.handleChange}
                            style={{ marginBottom: 15 }}
                            rows={4}
                          />

                          <div style={{ textAlign: "center" }}>
                            <input
                              style={{ display: "none" }}
                              type="file"
                              id="postfile"
                              onChange={e => {
                                let file = e.target.files[0];
                                let type = file.type.split("/")[0];
                                if (type === "image") {
                                  if (file.size > maxUploadSize) {
                                    this.setMessage({
                                      message: "Max Image size is 2MB",
                                      type: 1
                                    });
                                  } else {
                                    this.setState({ grouppic: file });
                                  }
                                } else {
                                  this.setMessage({
                                    message: "Only image files are accepted",
                                    type: 1
                                  });
                                }
                              }}
                            />
                            <label
                              htmlFor="postfile"
                              style={{ cursor: "pointer" }}
                            >
                              Update Pic{" "}
                              {this.state.grouppic !== "" &&
                              this.state.grouppic.name.length >= 20
                                ? this.state.grouppic.name.substr(0, 19) + ".."
                                : this.state.grouppic.name}
                            </label>
                          </div>
                          <br />
                          <Button
                            disabled={this.state.formloading}
                            onClick={this.handleUpdate}
                            loading={this.state.formloading}
                            secondary
                            className="updateexist"
                          >
                            Update Existing
                          </Button>

                          <Divider horizontal />
                        </Grid.Column>

                        <Grid.Column />
                      </Grid.Row>
                    </Grid>
                  </Form>
                </Modal.Content>
              </Modal>
            </Transition>

            <NavBar
              display={window.innerWidth < 800}
              set={this.set}
              displayl={this.state.displayl}
              displayr={this.state.displayr}
              active={1}
              search={!this.isempty(group)}
              func={this.handleSearch}
              group={this.state.groupSelected}
              subgroup={this.state.subgroup}
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
                  <Icon
                    name="close"
                    style={{ float: "right", color: "red", cursor: "pointer" }}
                    onClick={this.handleModalClose}
                  />
                </Modal.Header>
                <Modal.Content>
                  <Form id="groupcreate">
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
                            value={this.state.gorupname}
                            onChange={this.handleChange}
                            style={{ marginBottom: 15, width: "100%" }}
                          />
                          <TextArea
                            placeholder="Tell us more"
                            name="groupabout"
                            value={this.state.groupabout}
                            onChange={this.handleChange}
                            style={{ marginBottom: 15 }}
                            rows={4}
                          />
                          <div style={{ textAlign: "center" }}>
                            <input
                              style={{ display: "none" }}
                              type="file"
                              id="postfile"
                              onChange={e => {
                                let file = e.target.files[0];
                                let type = file.type.split("/")[0];
                                if (type === "image") {
                                  if (file.size > maxUploadSize) {
                                    this.setMessage({
                                      message: "Max Image size is 2MB",
                                      type: 1
                                    });
                                  } else {
                                    this.setState({ grouppic: file });
                                  }
                                } else {
                                  this.setMessage({
                                    message: "Only image files are accepted",
                                    type: 1
                                  });
                                }
                              }}
                            />
                            <label
                              htmlFor="postfile"
                              style={{ cursor: "pointer" }}
                            >
                              Add image / file{" "}
                              {this.state.grouppic !== "" &&
                              this.state.grouppic.name.length >= 20
                                ? this.state.grouppic.name.substr(0, 19) + ".."
                                : this.state.grouppic.name}
                            </label>
                          </div>
                          <br />
                          <Button
                            disabled={this.state.formloading}
                            onClick={this.HandleFormSubmit}
                            loading={this.state.formloading}
                            secondary
                            className="addnew"
                          >
                            Add new
                          </Button>
                          <Divider horizontal />
                        </Grid.Column>

                        <Grid.Column />
                      </Grid.Row>
                    </Grid>
                  </Form>
                </Modal.Content>
              </Modal>
            </Transition>
            <Sidebar className="sidebar_compon" visible={!this.state.displayl}>
              <div style={{ marginTop: 20, marginLeft: 20 }}>
                {this.state.groups.length === 0 ? (
                  <Fragment>
                    <div style={{ textAlign: "center" }}>
                      <b>No groups currently</b>
                    </div>

                    <div id="addgroup">
                      <Button
                        style={{ marginLeft: 5, marginTop: 10 }}
                        onClick={() =>
                          this.setState({
                            visible: true
                          })
                        }
                      >
                        <div className="button_icon">
                          <Icon style={{ zIndex: 10 }} name="add" />
                        </div>
                        Add new Group
                      </Button>
                    </div>
                  </Fragment>
                ) : (
                  <Menu vertical style={{ width: "100%" }} text>
                    <Scrollbars
                      autoHide
                      autoHideTimeout={1000}
                      autoHeight
                      autoHeightMax={"70vh"}
                    >
                      {this.state.groups.map((obj, index) => (
                        <Fragment key={index}>
                          <Menu.Item
                            className={
                              activeItem === obj.pk
                                ? "menu_item_select"
                                : "menu_item_compon"
                            }
                            onMouseEnter={() =>
                              this.setState({ hover: obj.pk })
                            }
                            onMouseLeave={() => this.setState({ hover: false })}
                            key={index}
                            name={obj.name}
                            active={activeItem === obj.pk}
                            style={
                              activeItem === obj.pk
                                ? { background: "#ffffff" }
                                : {}
                            }
                            onClick={() => {
                              if (hoverselect) {
                                hoverselect = false;
                              } else {
                                this.handleGroupSelect(obj);
                              }
                            }}
                          >
                            <Image
                              src={obj.pic}
                              style={{ height: 35, width: 35 }}
                              avatar
                            />
                            <b>{obj.name}</b>
                            {this.state.hover === obj.pk ? (
                              <Dropdown
                                style={{ float: "right", marginTop: 10 }}
                                icon={
                                  <Icon
                                    name="cog"
                                    onClick={() => {
                                      hoverselect = true;
                                    }}
                                  />
                                }
                                direction="left"
                              >
                                <Dropdown.Menu>
                                  {obj.edit ? (
                                    <Fragment>
                                      <Dropdown.Item
                                        onClick={() =>
                                          this.setState({
                                            operation_pk: obj.pk,
                                            modalvisible: true,
                                            groupname: obj.name,
                                            groupabout: obj.about
                                          })
                                        }
                                      >
                                        <div style={{ color: "#28abe2" }}>
                                          <Icon name="edit outline" />
                                          <b>Update</b>
                                        </div>
                                      </Dropdown.Item>
                                      <Dropdown.Divider />
                                      <Dropdown.Item
                                        onClick={() => {
                                          this.setState({
                                            operation_pk: obj.pk
                                          });
                                          this.handleAlert(0);
                                        }}
                                      >
                                        <div style={{ color: "#e8293c" }}>
                                          <Icon name="trash alternate outline" />
                                          Delete
                                        </div>
                                      </Dropdown.Item>
                                    </Fragment>
                                  ) : (
                                    <Dropdown.Item
                                      onClick={() => {
                                        this.setState({ operation_pk: obj.pk });
                                        this.handleAlert(1);
                                      }}
                                    >
                                      <div style={{ color: "#e8293c" }}>
                                        <Icon name="trash alternate outline" />
                                        Exit
                                      </div>
                                    </Dropdown.Item>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            ) : (
                              ""
                            )}
                          </Menu.Item>
                          {activeItem === obj.pk ? (
                            <GroupSelected
                              group={group}
                              uri={this.props.location.pathname}
                              params={this.state.pksearch}
                              renderpost={this.state.renderpost}
                              subgroup={subgroup}
                              set={this.set}
                              change={this.state.change}
                              setLoader={this.setLoader}
                              setMessage={this.setMessage}
                            />
                          ) : (
                            ""
                          )}
                          {index === this.state.groups.length - 1 &&
                          activeItem !== obj.pk ? (
                            <Fragment>
                              <br />
                              <br />
                              <br />
                            </Fragment>
                          ) : (
                            ""
                          )}
                        </Fragment>
                      ))}
                    </Scrollbars>
                    <div id="addgroup">
                      <Button
                        onClick={() =>
                          this.setState({
                            visible: true
                          })
                        }
                      >
                        <div className="button_icon">
                          <Icon style={{ zIndex: 10 }} name="add" />
                        </div>
                        Add new Group
                      </Button>
                    </div>
                  </Menu>
                )}
              </div>
            </Sidebar>
            <div
              className="main_home_page"
              style={
                !this.state.displayl
                  ? { width: "56vw", marginLeft: "22vw" }
                  : {}
              }
            >
              {this.isempty(group) ? (
                <div
                  style={{
                    paddingTop: "calc(100px + 15vh)",
                    textAlign: "center",
                    overflow: "hidden"
                  }}
                >
                  <h2>Select a Group to Continue</h2>
                  <Grid columns="equal">
                    <Grid.Row>
                      <Grid.Column />
                      <Grid.Column>
                        <Divider
                          horizontal
                          style={{ width: "10vw", marginLeft: 35 }}
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
                <Fragment>
                  {this.isempty(subgroup) ? (
                    <Fragment>
                      <div
                        style={{
                          paddingTop: "calc(100px + 15vh)",
                          textAlign: "center"
                        }}
                      >
                        <h2>Select a SubGroup to display the posts</h2>
                      </div>
                    </Fragment>
                  ) : (
                    <div style={{ marginTop: 100 }}>
                      <BasePost
                        ref={this.child}
                        renderpost={this.state.renderpost}
                        setLoader={this.setLoader}
                        group={this.state.subgroup}
                        setMessage={this.setMessage}
                        pksearch={this.state.pksearch}
                      />
                    </div>
                  )}
                </Fragment>
              )}
            </div>
            <Sidebar
              className="sidebar_compon"
              direction="right"
              visible={!this.state.displayr}
            >
              {!this.isempty(group) ? (
                <Fragment>
                  <Notify group={group} set={this.set} />
                  <UserList group={group} />
                  <Invite group={group} setMessage={this.setMessage} />
                </Fragment>
              ) : (
                ""
              )}
            </Sidebar>
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
      alertAction: 0,
      alertMessage: "",
      alertvisible: false,
      activeItem:
        Object.entries(this.props.subgroup).length !== 0
          ? this.props.subgroup.pk
          : false,
      name: "",
      subgroupdel: false,
      subgroupupdate: false,
      hover: -1,
      operation_pk: -1
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.props.group !== prevProps.group ||
      prevProps.change != this.props.change
    ) {
      console.log("came in");
      this.setState({
        group: this.props.group
      });
    }

    if (this.props.subgroup !== prevProps.subgroup) {
      console.log("came here for cons");
      console.log(this.props.subgroup);
      this.setState({ activeItem: this.props.subgroup.pk });
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

  handleSubGroupSelect = obj => {
    let elem = {
      subgroup: obj,
      pksearch: false,
      renderpost: !this.props.renderpost,
      redirect: this.props.uri !== "/home" ? "/home" : false
    };
    this.setState({
      activeItem: obj.pk
    });
    this.props.set(elem);
  };

  handleSubGroupCreate = () => {
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };

    this.setState({
      formloading: true
    });
    fetchAsynchronous(
      subGroupCreate + this.state.operation_pk + "/",
      "POST",
      { name: this.state.name },
      headers,
      response => {
        if (response.hasOwnProperty("error") && response.error === 1) {
          this.props.setMessage({
            message: response.message,
            type: 1
          });
          this.setState({ formloading: false });
        } else {
          let group = Object.assign({}, this.state.group);
          this.setState({
            name: "",
            operation: -1,
            operation_pk: -1,
            formloading: false,
            subgroupupdate: false
          });
          group.subgroup_set.unshift(response);
          this.props.set({ groupSelected: group });

          this.props.setMessage({
            message: "Successfully created a new subgroup",
            type: 0
          });
        }
      }
    );
  };

  handleSubgroupDelete = () => {
    this.setState({ subgroupdel: false });
    this.props.setLoader(true);
    fetchAsynchronous(
      subGroupUpdate + this.state.operation_pk + "/",
      "DELETE",
      undefined,
      { Authorization: "Token " + getCookie("token")[0].value },
      response => {
        this.props.setMessage({
          message: response.message,
          type: response.error === 0 ? 0 : 1
        });
        this.props.setLoader(false);
        let group = Object.assign({}, this.state.group);
        let index = group.subgroup_set.indexOf(
          group.subgroup_set.find(obj => obj.pk === this.state.operation_pk)
        );
        group.subgroup_set.splice(index, 1);
        this.props.set({
          groupSelected: group,
          subgroup: {},
          pksearch: false,
          operation_pk: -1
        });
      }
    );
  };

  handleSubgroupUpdate = () => {
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };

    this.setState({
      formloading: true
    });
    fetchAsynchronous(
      subGroupUpdate + this.state.operation_pk + "/",
      "PATCH",
      { name: this.state.name },
      headers,
      response => {
        if (response.hasOwnProperty("error") && response.error === 1) {
          this.props.setMessage({
            message: response.message,
            type: 1
          });
          this.setState({ formloading: false });
        } else {
          let group = Object.assign({}, this.state.group);
          this.setState({
            name: "",
            operation: -1,
            operation_pk: -1,
            formloading: false,
            subgroupupdate: false
          });
          let index = group.subgroup_set.indexOf(
            group.subgroup_set.find(obj => obj.pk === response.pk)
          );
          group.subgroup_set[index] = response;
          this.props.set({ groupSelected: group });

          this.props.setMessage({
            message: "Successfully updated the name of subgroup",
            type: 0
          });
        }
      }
    );
  };

  render = () => {
    let { group, active } = this.state;

    return (
      <Fragment>
        <Transition
          animation="scale"
          duration={400}
          visible={this.state.subgroupdel}
        >
          <Modal open={this.state.subgroupdel} basic size="small">
            <Header icon="exclamation triangle" content="Are you sure ?" />
            <Modal.Content>
              <p>
                On deleting the subgroup all the posts in the subgroup will be
                lost. This action is invertible!!
              </p>
            </Modal.Content>
            <Modal.Actions>
              <Button
                basic
                color="red"
                inverted
                onClick={() => this.setState({ subgroupdel: false })}
              >
                <Icon name="remove" /> No
              </Button>
              <Button
                color="green"
                inverted
                onClick={this.handleSubgroupDelete}
              >
                <Icon name="checkmark" /> Yes
              </Button>
            </Modal.Actions>
          </Modal>
        </Transition>
        <Transition
          animation="scale"
          duration={400}
          visible={this.state.subgroupupdate}
        >
          <Modal open={this.state.subgroupupdate} centered={false}>
            <Modal.Header>
              {this.state.operation === 0
                ? "Add new SubGroup"
                : "Update Subgroup"}
              <Icon
                name="close"
                onClick={() => {
                  this.setState({
                    subgroupupdate: false,
                    operation: -1,
                    name: "",
                    formloading: false
                  });
                }}
                style={{ float: "right", color: "red", cursor: "pointer" }}
              />
            </Modal.Header>
            <Modal.Content>
              <Form id="subgroup_create_form">
                <Grid columns="equal">
                  <Grid.Row>
                    <Grid.Column />
                    <Grid.Column textAlign="center">
                      <Input
                        icon="users"
                        type="text"
                        name="name"
                        iconPosition="left"
                        placeholder="Subgroup Name"
                        value={this.state.name}
                        onChange={this.handleChange}
                        style={{ marginBottom: 15 }}
                      />
                      <Button
                        disabled={this.state.formloading}
                        onClick={
                          this.state.operation === 0
                            ? this.handleSubGroupCreate
                            : this.handleSubgroupUpdate
                        }
                        secondary
                        loading={this.state.formloading}
                        className="addnewsub"
                      >
                        {this.state.operation === 0
                          ? "Create Subgroup"
                          : "Update Subgroup"}
                      </Button>
                      <Divider horizontal />
                    </Grid.Column>

                    <Grid.Column />
                  </Grid.Row>
                </Grid>
              </Form>
            </Modal.Content>
          </Modal>
        </Transition>
        <Fragment>
          <div id="subgroups">
            <Menu vertical style={{ width: "100%" }} text>
              <React.Fragment>
                {group.subgroup_set.map((obj, index) => (
                  <Menu.Item
                    key={index}
                    style={{ marginLeft: "3vw", color: "#8f939b" }}
                    name={obj.name}
                    active={this.state.activeItem === obj.pk}
                    onMouseLeave={() => this.setState({ hover: false })}
                    onMouseEnter={() => this.setState({ hover: obj.pk })}
                    className="subgroup_items"
                    onClick={() => {
                      if (hoversub) {
                        hoversub = false;
                      } else {
                        console.log("Came to the function call");
                        this.handleSubGroupSelect(obj);
                      }
                    }}
                  >
                    {obj.pk === this.state.activeItem ? (
                      <Icon name="angle double right" />
                    ) : (
                      ""
                    )}
                    # <b>{obj.name}</b>
                    {this.state.hover === obj.pk ? (
                      <Dropdown
                        style={{ float: "right" }}
                        icon={
                          <Icon
                            name="cog"
                            onClick={() => {
                              hoversub = true;
                            }}
                          />
                        }
                        direction="left"
                      >
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => {
                              this.setState({
                                formloading: false,
                                operation: 1,
                                subgroupupdate: true,
                                name: obj.name,
                                operation_pk: obj.pk
                              });
                            }}
                          >
                            <div style={{ color: "#28abe2" }}>
                              <Icon name="edit outline" />
                              <b>Update</b>
                            </div>
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={() =>
                              this.setState({
                                subgroupdel: true,
                                operation_pk: obj.pk
                              })
                            }
                          >
                            <div style={{ color: "#e8293c" }}>
                              <Icon name="trash alternate outline" />
                              Delete
                            </div>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : (
                      ""
                    )}
                  </Menu.Item>
                ))}
              </React.Fragment>
            </Menu>
            <div id="addsubgroup">
              <Button
                style={{ marginLeft: "1vw" }}
                onClick={() => {
                  this.setState({
                    subgroupupdate: true,
                    name: "",
                    formloading: false,
                    operation: 0,
                    operation_pk: this.state.group.pk
                  });
                }}
              >
                <div className="button_icon">
                  <Icon style={{ zIndex: 10 }} name="add" />
                </div>
                Add new SubGroup
              </Button>
            </div>
            <h5 style={{ color: "#35b18a" }}>Group: </h5>
            <p style={{ width: "90%", fontFamily: "Courier" }}>{group.about}</p>
            <h5 style={{ color: "#35b18a" }}>Created By: </h5>
            <a href="#">{group.created_by}</a>
          </div>
        </Fragment>
      </Fragment>
    );
  };
}

export default Home;
