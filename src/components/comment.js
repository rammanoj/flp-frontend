import React, { Component, Fragment } from "react";
import {
  Comment,
  Header,
  Form,
  Button,
  Icon,
  Transition,
  Modal,
  Grid,
  Divider,
  TextArea
} from "semantic-ui-react";
import {
  months,
  commentCreate,
  commentApi,
  replyCreate,
  replyUpdate
} from "./../api";
import { getCookie } from "./cookie";
import { fetchAsynchronous } from "./controllers/fetch";

class BaseComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: "",
      loading: false,
      pk: "",
      commentDelete: false,
      commentEdit: false,
      updatecomment: "",
      updateloading: false,
      recommentvisible: false,
      recomment: "",
      recommentloading: false,
      operation: 0,
      recommentdelete: false
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.comments !== this.props.comments) {
      this.setState({ comments: this.props.comments });
    }

    if (prevProps.visible !== this.props.visible) {
      this.setState({ visible: this.props.visible });
    }
  };

  formatTime = date => {
    date = new Date(date);
    return (
      date.getHours() +
      ":" +
      date.getMinutes() +
      " " +
      months[date.getMonth()] +
      "  " +
      date.getDate() +
      ", " +
      date.getFullYear()
    );
  };

  addComment = () => {
    this.setState({ loading: true });
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    let data = { comment: this.state.comment };
    fetchAsynchronous(
      commentCreate + this.props.post.pk + "/",
      "POST",
      data,
      headers,
      this.addCommentCallback
    );
  };

  addCommentCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.props.setMessage({
        message: response.message,
        type: 1,
        header: "Error"
      });
      this.setState({ loading: false });
    } else {
      let post = Object.assign({}, this.props.post);
      post.comments.push(response);
      this.setState({ comment: "", loading: false });
      this.props.setPost(post);
    }
  };

  handleCommentUpdate = () => {
    this.setState({ updateloading: true });
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    let data = { comment: this.state.updatecomment };
    fetchAsynchronous(
      commentApi + this.state.pk + "/",
      "PATCH",
      data,
      headers,
      this.updateCommentCallback
    );
  };

  updateCommentCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.props.setMessage({
        message: response.message,
        type: 1,
        header: "Error"
      });
      this.setState({ updateloading: false });
    } else {
      let post = Object.assign({}, this.props.post);
      let index = post.comments.indexOf(
        post.comments.find(obj => obj.pk === this.state.pk)
      );
      post.comments[index] = response;
      this.setState({
        commentEdit: false,
        updateloading: false,
        updatecomment: ""
      });
      this.props.setPost(post);
    }
  };

  handleCommentDelete = () => {
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    fetchAsynchronous(
      commentApi + this.state.pk + "/",
      "DELETE",
      undefined,
      headers,
      () => {}
    );
    let post = Object.assign({}, this.props.post);
    let index = post.comments.indexOf(
      post.comments.find(obj => obj.pk === this.state.pk)
    );
    post.comments.splice(index, 1);

    // Close the alert and update the post
    this.props.setPost(post);
    this.setState({ commentDelete: false });
  };

  addreply = () => {
    this.setState({ reommentloading: true });
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    fetchAsynchronous(
      replyCreate + this.state.pk + "/",

      "POST",
      { re_comment: this.state.recomment },
      headers,
      this.handleAddReply
    );
  };

  handleAddReply = response => {
    this.setState({ recommentloading: false });
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setMessage({ message: response.message, type: 1, header: "Error" });
    } else {
      // Update the post
      this.setState({ recommentvisible: false, recomment: "" });
      let post = Object.assign({}, this.props.post);
      let obj = post.comments.find(obj => obj.pk === this.state.pk);
      obj.postrecomment_set.push(response);
      this.props.setPost(post);
    }
  };

  handleReplyUpdate = () => {
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    fetchAsynchronous(
      replyUpdate + this.state.pk + "/",
      "PATCH",
      { re_comment: this.state.recomment },
      headers,
      () => {}
    );

    // get the updated index of the reply and update it in the comment.
    let post = Object.assign({}, this.props.post);

    let comment = post.comments.find(obj =>
      obj.postrecomment_set.find(elem => elem.pk === this.state.pk)
    );
    let reply = comment.postrecomment_set.find(obj => obj.pk === this.state.pk);
    reply.re_comment = this.state.recomment;
    this.props.setPost(post);
    this.setState({
      recomment: "",
      recommentloading: false,
      recommentvisible: false
    });
  };

  handleReplyDelete = () => {
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    fetchAsynchronous(
      replyUpdate + this.state.pk + "/",
      "DELETE",
      { re_comment: this.state.recomment },
      headers,
      () => {}
    );

    let post = Object.assign({}, this.props.post);

    let comment = post.comments.find(obj =>
      obj.postrecomment_set.find(elem => elem.pk === this.state.pk)
    );
    let reply = comment.postrecomment_set.indexOf(
      comment.postrecomment_set.find(obj => obj.pk === this.state.pk)
    );
    comment.postrecomment_set.splice(reply, 1);
    this.props.setPost(post);
    this.setState({
      recommentdelete: false
    });
  };

  render = () => {
    // Did not use common modal to all the operations.
    // Better to implement a common modal and implement all the functions in it.
    return (
      <Fragment>
        {/* Modal to update comment */}
        <Transition
          animation="scale"
          duration={400}
          visible={this.state.commentEdit}
        >
          <Modal
            open={this.state.commentEdit}
            centered={false}
            style={{ width: "50%" }}
          >
            <Modal.Header>
              Update Comment ?
              <Button
                icon="close"
                onClick={() =>
                  this.setState({
                    updatecomment: "",
                    updateloading: false,
                    commentEdit: false
                  })
                }
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
                    <TextArea
                      placeholder="Update comment.."
                      value={this.state.updatecomment}
                      onChange={e =>
                        this.setState({ updatecomment: e.target.value })
                      }
                      style={{ marginBottom: 15 }}
                      rows={4}
                    />
                    <Button
                      disabled={this.state.updateloading}
                      onClick={this.handleCommentUpdate}
                      loading={this.state.updateloading}
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

        {/* Modal to give a reply to the comment */}
        <Transition
          animation="scale"
          duration={400}
          visible={this.state.recommentvisible}
        >
          <Modal
            open={this.state.recommentvisible}
            centered={false}
            style={{ width: "50%" }}
          >
            <Modal.Header>
              {this.state.operation === 0 ? "Add Reply ?" : "Update Reply ?"}
              <Button
                icon="close"
                onClick={() =>
                  this.setState({
                    recomment: "",
                    recommentloading: false,
                    recommentvisible: false
                  })
                }
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
                    <TextArea
                      placeholder="Add a reply ?.."
                      value={this.state.recomment}
                      onChange={e =>
                        this.setState({ recomment: e.target.value })
                      }
                      style={{ marginBottom: 15 }}
                      rows={4}
                    />
                    <Button
                      disabled={this.state.recommentloading}
                      onClick={
                        this.state.operation === 0
                          ? this.addreply
                          : this.handleReplyUpdate
                      }
                      loading={this.state.recommentloading}
                      secondary
                    >
                      {this.state.operation === 0
                        ? "Add reply !"
                        : "Update reply"}
                    </Button>
                    <Divider horizontal />
                  </Grid.Column>

                  <Grid.Column />
                </Grid.Row>
              </Grid>
            </Modal.Content>
          </Modal>
        </Transition>

        {/* Alert brefore deleting the comment */}
        <Transition
          animation="scale"
          duration={400}
          visible={this.state.commentDelete}
        >
          <Modal open={this.state.commentDelete} basic size="small">
            <Header
              icon="exclamation triangle"
              content="Are you sure to delete comment ?"
            />
            <Modal.Actions>
              <Button
                basic
                color="red"
                inverted
                onClick={() => this.setState({ commentDelete: false })}
              >
                <Icon name="remove" /> No
              </Button>
              <Button color="green" inverted onClick={this.handleCommentDelete}>
                <Icon name="checkmark" /> Yes
              </Button>
            </Modal.Actions>
          </Modal>
        </Transition>

        {/* Alert brefore deleting the reply */}
        <Transition
          animation="scale"
          duration={400}
          visible={this.state.recommentdelete}
        >
          <Modal open={this.state.recommentdelete} basic size="small">
            <Header
              icon="exclamation triangle"
              content="Are you sure to delete the reply ?"
            />
            <Modal.Actions>
              <Button
                basic
                color="red"
                inverted
                onClick={() => this.setState({ recommentdelete: false })}
              >
                <Icon name="remove" /> No
              </Button>
              <Button color="green" inverted onClick={this.handleReplyDelete}>
                <Icon name="checkmark" /> Yes
              </Button>
            </Modal.Actions>
          </Modal>
        </Transition>
        <div style={{ width: "100%" }}>
          <Comment.Group>
            <Header as="h3" dividing>
              Comments
            </Header>

            {this.props.post.comments.map((obj, index) => (
              <Comment key={index}>
                <Comment.Content>
                  <Icon name="user" circular inverted />
                  <Comment.Author as="a">{obj.user}</Comment.Author>
                  <Comment.Metadata>
                    <div>{this.formatTime(obj.created_on)}</div>
                  </Comment.Metadata>
                  <Comment.Text>{obj.comment}</Comment.Text>
                  <Comment.Actions>
                    <Comment.Action
                      onClick={() =>
                        this.setState({
                          recommentvisible: true,
                          pk: obj.pk,
                          operation: 0
                        })
                      }
                    >
                      Reply
                    </Comment.Action>
                    {obj.edit ? (
                      <Fragment>
                        <Comment.Action
                          onClick={() =>
                            this.setState({
                              commentEdit: true,
                              updatecomment: obj.comment,
                              pk: obj.pk
                            })
                          }
                        >
                          Edit
                        </Comment.Action>
                        <Comment.Action
                          onClick={() =>
                            this.setState({ commentDelete: true, pk: obj.pk })
                          }
                        >
                          Delete
                        </Comment.Action>
                      </Fragment>
                    ) : (
                      ""
                    )}
                  </Comment.Actions>
                </Comment.Content>
                <Comment.Group>
                  {obj.postrecomment_set.map((elem, ind) => (
                    <Comment key={ind}>
                      <Comment.Content>
                        <Icon name="user" circular inverted />
                        <Comment.Author as="a">{elem.user}</Comment.Author>
                        <Comment.Metadata>
                          <div>{this.formatTime(elem.created_on)}</div>
                        </Comment.Metadata>
                        <Comment.Text>{elem.re_comment}</Comment.Text>
                        <Comment.Actions>
                          {elem.edit ? (
                            <Fragment>
                              <Comment.Action
                                onClick={() =>
                                  this.setState({
                                    recommentvisible: true,
                                    pk: elem.pk,
                                    recomment: elem.re_comment,
                                    operation: 1
                                  })
                                }
                              >
                                Edit
                              </Comment.Action>
                              <Comment.Action
                                onClick={() =>
                                  this.setState({
                                    recommentdelete: true,
                                    pk: elem.pk
                                  })
                                }
                              >
                                Delete
                              </Comment.Action>
                            </Fragment>
                          ) : (
                            ""
                          )}
                        </Comment.Actions>
                      </Comment.Content>
                    </Comment>
                  ))}
                </Comment.Group>
              </Comment>
            ))}

            {this.props.post.comments.length === 0 ? (
              <h3>No Comment yet!</h3>
            ) : (
              ""
            )}

            <Form reply>
              <Form.TextArea
                placeholder="Comment here.."
                value={this.state.comment}
                onChange={e => this.setState({ comment: e.target.value })}
              />
              <Button
                content="Add Comment"
                labelPosition="left"
                icon="edit"
                primary
                disabled={this.state.loading}
                loading={this.state.loading}
                onClick={this.addComment}
              />
            </Form>
          </Comment.Group>
        </div>
      </Fragment>
    );
  };
}

export { BaseComment };
