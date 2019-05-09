import React, { Component, Fragment } from "react";
import {
  Transition,
  Modal,
  Icon,
  Loader,
  Comment,
  Grid,
  Button,
  TextArea,
  Header,
  Divider
} from "semantic-ui-react";
import {
  commentList,
  paginationCount,
  months,
  commentApi,
  replyCreate,
  replyUpdate
} from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";
import { getCookie } from "./cookie";
import Pagination from "semantic-ui-react-button-pagination";
import Scrollbars from "react-custom-scrollbars";

class CommentPagination extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      pagination: false,
      loading: false,
      comments: [],
      page: 1,
      emptyresult: false,
      pagination: false,
      offset: 0,
      items: 0,
      pk: "",
      comment: "",
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

  componentDidMount = () => {
    this.setState({ visible: true, loading: true });
    // show the loading and fetch the api.
    this.fetch();
  };

  fetch = () => {
    fetchAsynchronous(
      commentList + this.props.post + "/?page=" + this.state.page,
      "GET",
      undefined,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.fetchCallback
    );
  };

  fetchCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      alert("Invalid page");
      this.setState({ loading: false });
    } else {
      if (this.state.page === 1 && response.results.length === 0) {
        this.setState({
          emptyresult: true,
          loading: false
        });
      } else if (this.state.page === 1) {
        let comments = response.results,
          length = response.results.length;

        if (length < response.count) {
          this.setState({
            pagination: true,
            items: response.count
          });
        } else {
          this.setState({
            pagination: false,
            items: 0
          });
        }
        this.setState({
          comments: comments,
          loading: false,
          emptyresult: false
        });
      } else {
        this.setState({
          comments: response.results,
          items: response.count,
          loading: false,
          emptyresult: false
        });
      }
    }
  };

  handlePageClick = offset => {
    this.setState(
      {
        offset: offset,
        page: Math.ceil(offset / paginationCount) + 1,
        loading: true
      },
      () => this.fetch()
    );
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
      let comments = [...this.state.comments];
      let index = comments.indexOf(
        comments.find(obj => obj.pk === this.state.pk)
      );
      comments[index] = response;
      this.setState({
        commentEdit: false,
        updateloading: false,
        updatecomment: ""
      });
      this.setState({ comments: comments });
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
    let comments = [...this.state.comments];
    let index = comments.indexOf(
      comments.find(obj => obj.pk === this.state.pk)
    );
    comments.splice(index, 1);
    this.setState({ commentDelete: false, comments: comments });
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
      let comments = [...this.state.comments];
      let obj = comments.find(obj => obj.pk === this.state.pk);
      obj.postrecomment_set.push(response);
      this.setState({ comments: comments });
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
    let comments = [...this.state.comments];

    let comment = comments.find(obj =>
      obj.postrecomment_set.find(elem => elem.pk === this.state.pk)
    );
    let reply = comment.postrecomment_set.find(obj => obj.pk === this.state.pk);
    reply.re_comment = this.state.recomment;
    this.setState({
      comments: comments,
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

    let comments = [...this.state.comments];

    let comment = comments.find(obj =>
      obj.postrecomment_set.find(elem => elem.pk === this.state.pk)
    );
    let reply = comment.postrecomment_set.indexOf(
      comment.postrecomment_set.find(obj => obj.pk === this.state.pk)
    );
    comment.postrecomment_set.splice(reply, 1);
    this.setState({
      comments: comments,
      recommentdelete: false
    });
  };

  render = () => {
    // Display the comments with pagination.
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
        <Transition
          duration={400}
          visible={this.state.visible}
          animation="scale"
        >
          <div>
            <Modal
              open={this.state.visible}
              centered={false}
              onClose={() => {
                this.setState({ visible: false });
                this.props.setAllComment(false);
              }}
            >
              <Modal.Header>Comments</Modal.Header>
              <Modal.Content>
                {this.state.loading ? (
                  <Loader
                    active
                    className="workaround"
                    size="medium"
                    inline="centered"
                  >
                    getting comments..
                  </Loader>
                ) : (
                  <Fragment>
                    {this.state.emptyresult ? (
                      <div style={{ textAlign: "center" }}>
                        <h4>There are no comments yet</h4>
                      </div>
                    ) : (
                      <div>
                        <Scrollbars style={{ height: "45vh" }}>
                          <Comment.Group>
                            {this.state.comments.map((obj, index) => (
                              <Comment key={index}>
                                <Comment.Content>
                                  <Icon name="user" circular inverted />
                                  <Comment.Author as="a">
                                    {obj.user}
                                  </Comment.Author>
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
                                            this.setState({
                                              commentDelete: true,
                                              pk: obj.pk
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
                                <Comment.Group>
                                  {obj.postrecomment_set.map((elem, ind) => (
                                    <Comment key={ind}>
                                      <Comment.Content>
                                        <Icon name="user" circular inverted />
                                        <Comment.Author as="a">
                                          {elem.user}
                                        </Comment.Author>
                                        <Comment.Metadata>
                                          <div>
                                            {this.formatTime(elem.created_on)}
                                          </div>
                                        </Comment.Metadata>
                                        <Comment.Text>
                                          {elem.re_comment}
                                        </Comment.Text>
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
                          </Comment.Group>
                        </Scrollbars>
                        {this.state.pagination ? (
                          <div
                            style={{
                              marginTop: 30,
                              marginBottom: 20,

                              textAlign: "center"
                            }}
                          >
                            <Pagination
                              limit={paginationCount}
                              offset={this.state.offset}
                              total={this.state.items}
                              onClick={(e, props, offset) =>
                                this.handlePageClick(offset)
                              }
                            />
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    )}
                  </Fragment>
                )}
              </Modal.Content>
            </Modal>
          </div>
        </Transition>
      </Fragment>
    );
  };
}

export { CommentPagination };
