import React from "react";
import { getCookie } from "./cookie";
import { fetchAsynchronous } from "./controllers/fetch";
import {
  Loader,
  Modal,
  Transition,
  Input,
  Label,
  Button,
  Icon,
  Grid,
  Card
} from "semantic-ui-react";
import { Link, Redirect } from "react-router-dom";
import { checkInviteLink, TeamAddRemoveUser, TeamInviteUser } from "./../api";

class InviteUser extends React.Component {
  constructor(props) {
    super(props);
    let link = this.props.match.params;
    if (link.hasOwnProperty("link")) {
      link = link.link;
    } else {
      link = "";
    }
    this.state = {
      isLoggedIn: getCookie("token")[1],
      link: link,
      loading: true,
      content: "",
      response: {
        open: false,
        type: "",
        message: ""
      },
      route: false,
      visible: false
    };
  }

  componentDidMount = () => {
    this.setState({ visible: true });
    if (this.state.isLoggedIn) {
      // check the validity of the link.

      fetchAsynchronous(
        checkInviteLink + this.state.link,
        "GET",
        undefined,
        { Authorization: "Token " + getCookie("token")[0].value },
        this.checkCallback
      );
    } else {
      this.setState({ loading: false });
    }
  };

  confirm = operation => {
    this.setState({ loading: true });
    let confirm = false;
    if (operation === "yes") {
      //   Add the user to the group.
      confirm = true;
    }
    let data = {
      link: this.state.link,
      operation: "Add",
      confirm: confirm
    };
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    fetchAsynchronous(TeamAddRemoveUser, "POST", data, headers, this.callback);
  };

  callback = response => {
    let type = "#32CD32";
    if (response.error === 1) {
      type = "red";
    }
    this.setState({
      response: { open: true, message: response.message, type: type },
      route: true
    });
  };

  checkCallback = response => {
    let content = {};
    if (response.error === 1) {
      // link is invalid
      content.header = "The link is Invalid";
      content.message = "The link given is not valid.";
    } else {
      // link is valid
      content.header = "Confirmation to join ?";
      content.message =
        "Are you sure that you want to join the group? On clicking 'yes', you will be added to the group. On selecting 'No' the invitation will be rejected.";
    }

    content.error = response.error;

    this.setState({ content: content, loading: false });
  };

  render = () => {
    let { content } = this.state;

    if (this.state.route) {
      return (
        <React.Fragment>
          <Redirect to="/home" />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {this.state.loading ? (
          <Loader active>Checking Link...</Loader>
        ) : (
          <div style={{ marginTop: "25vh" }}>
            <Grid>
              <Grid.Row>
                <Grid.Column width={4} />
                <Grid.Column width={8}>
                  {!this.state.isLoggedIn ? (
                    <Transition visible={true} duration={400} animation="scale">
                      <Card style={{ width: "100%" }}>
                        <Card.Content>
                          <Card.Header>Authentication needed</Card.Header>
                          <Card.Description>
                            You need be logged in, to accept the invitation to
                            the team. Click the invite link again after logging
                            in.
                          </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                          <div style={{ float: "right" }}>
                            <Link to="/login">
                              <Button size="small">Login and Continue</Button>
                            </Link>
                          </div>
                        </Card.Content>
                      </Card>
                    </Transition>
                  ) : (
                    <Transition visible={true} duration={400} animation="scale">
                      <Card style={{ width: "100%", padding: 10 }}>
                        <Card.Content>
                          <Card.Header style={{ textAlign: "center" }}>
                            {content.header}
                          </Card.Header>
                        </Card.Content>
                        <Card.Description style={{ textAlign: "center" }}>
                          {content.message}
                        </Card.Description>
                        {content.error !== 1 ? (
                          <Card.Content extra>
                            <div style={{ float: "right" }}>
                              <Button
                                size="small"
                                onClick={() => this.confirm("no")}
                                stlye={{ color: "red" }}
                              >
                                No
                              </Button>
                              <Button
                                size="small"
                                onClick={() => this.confirm("yes")}
                                style={{ color: "#32CD32" }}
                              >
                                Yes
                              </Button>
                            </div>
                          </Card.Content>
                        ) : (
                          ""
                        )}
                      </Card>
                    </Transition>
                  )}
                </Grid.Column>
                <Grid.Column width={4} />
              </Grid.Row>
            </Grid>
          </div>
        )}
      </React.Fragment>
    );
  };
}

class Invite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      email: "",
      emails: [],
      loading: false
    };
  }

  api = () => {
    let data = {
      team: this.props.group.pk,
      email: this.state.emails
    };
    this.props.setMessage({
      message: false,
      header: "",
      type: 0
    });
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    this.setState({ loading: true });
    fetchAsynchronous(
      TeamInviteUser,
      "POST",
      data,
      headers,
      this.InviteUsersHandler
    );
  };

  InviteUsersHandler = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.props.setMessage({
        message: response.message,
        header: "Error",
        type: 1
      });
      this.setState({ loading: false });
    } else {
      this.setState({ loading: false, emails: [], email: "", visible: false });
      this.props.setMessage({
        message: "Successfully sent Invite mails",
        header: "Success",
        type: 0
      });
    }
  };

  render = () => {
    return (
      <React.Fragment>
        <br />
        <Button
          style={{ width: "95%" }}
          secondary
          onClick={() => this.setState({ visible: true })}
        >
          <Icon name="user plus" />
          Invite users
        </Button>
        <Transition
          visible={this.state.visible}
          duration={400}
          animation="scale"
        >
          <Modal
            open={this.state.visible}
            style={{ width: "50%" }}
            centered={false}
          >
            <Modal.Header>
              Invite new members
              <Icon
                name="close"
                color="red"
                style={{ float: "right", cursor: "pointer" }}
                onClick={() => this.setState({ visible: false })}
              />
            </Modal.Header>
            <Modal.Content>
              <Grid style={{ width: "100%" }}>
                <Grid.Row>
                  <Grid.Column width={4} />
                  <Grid.Column width={8}>
                    <br />
                    {this.state.emails.map((email, index) => (
                      <Label style={{ marginBottom: 1 }} key={index}>
                        {email}{" "}
                        <Icon
                          name="close icon"
                          size="small"
                          onClick={() => {
                            let emails = [...this.state.emails];
                            emails.splice(index, 1);
                            this.setState({ emails: emails });
                          }}
                        />
                      </Label>
                    ))}

                    <br />
                    <br />
                    <Input
                      icon="mail"
                      iconPosition="left"
                      placeholder="Enter emails..."
                      value={this.state.email}
                      type="text"
                      onChange={e => this.setState({ email: e.target.value })}
                      onKeyPress={e => {
                        if (e.key === "Enter") {
                          if (this.state.emails.length <= 20) {
                            let emails = [...this.state.emails];
                            emails.push(this.state.email);
                            this.setState({ emails: emails, email: "" });
                          }
                        }
                      }}
                      style={{ width: "100%" }}
                    />
                  </Grid.Column>
                  <Grid.Column width={4} />
                </Grid.Row>
              </Grid>
              <br />

              <b>
                <ol>
                  <li>
                    On entering an email hit enter, so that the email will be
                    considered for invite process.
                  </li>
                  <li>
                    At a max of 20 members can be invited at a max of one
                    attempt.
                  </li>
                </ol>
              </b>
              <br />
              <div style={{ textAlign: "center" }}>
                <Button
                  secondary
                  onClick={() => this.api()}
                  loading={this.state.loading}
                >
                  Send Invitations
                </Button>
              </div>
            </Modal.Content>
          </Modal>
        </Transition>
      </React.Fragment>
    );
  };
}

export default InviteUser;
export { Invite };
