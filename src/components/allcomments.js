import React, { Component, Fragment } from "react";
import {
  Transition,
  Modal,
  Icon,
  Loader,
  Comment,
  Button,
  Header,
  Form,
  Image
} from "semantic-ui-react";
import {
  commentList,
  paginationCount,
  months,
  commentApi,
  replyCreate,
  replyUpdate,
  commentCreate
} from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";
import { getCookie } from "./cookie";
import { Paginate as Pagination } from "./elements/pagination";
import { CustomTextArea } from "./elements/nav";

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
      pages: 0,
      pk: "",
      comment: "",
      commentDelete: false,
      commentEdit: false,
      updatecomment: "",
      recommentloading: false,
      operation: -1,
      customUpdatePK: false,
      recomment: "",
      recommentdelete: false,
      addloading: false
    };
  }

  componentDidMount = () => {
    this.setState({ visible: true, loading: true });
    // show the loading and fetch the api.
    this.fetch();
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.post !== this.props.post) {
      this.setState({ comments: [], page: 1, pages: 0 });
      this.fetch();
    }
  };

  fetch = () => {
    fetchAsynchronous(
      commentList + this.props.post.pk + "/?page=" + this.state.page,
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
            pages: Math.ceil(response.count / paginationCount)
          });
        } else {
          this.setState({
            pagination: false,
            pages: Math.ceil(response.count / paginationCount)
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
          pages: response.count,
          loading: false,
          emptyresult: false
        });
      }
    }
  };

  handlePageClick = page => {
    this.setState(
      {
        page: page,
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
    this.setState({ recommentloading: true });
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
        type: 1
      });
      this.setState({ recommentloading: false });
    } else {
      let comments = [...this.state.comments];
      let index = comments.indexOf(
        comments.find(obj => obj.pk === this.state.pk)
      );
      comments[index] = response;
      this.setState({
        commentEdit: false,
        recommentloading: false,
        updatecomment: "",
        customUpdatePK: false,
        comments: comments
      });
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
    this.setState({ recommentloading: true });
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
      this.props.setMessage({
        message: response.message,
        type: 1
      });
    } else {
      // Update the post
      let comments = [...this.state.comments];
      let obj = comments.find(obj => obj.pk === this.state.pk);
      obj.postrecomment_set.unshift(response);
      this.setState({
        comments: comments,
        recommentvisible: false,
        recomment: "",
        operation: -1,
        customUpdatePK: false
      });
    }
  };

  handleReplyUpdate = () => {
    this.setState({ recommentloading: true });
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    fetchAsynchronous(
      replyUpdate + this.state.pk + "/",
      "PATCH",
      { re_comment: this.state.recomment },
      headers,
      response => {
        if (response.hasOwnProperty("error") && response.error === 1) {
          this.props.setMessage({
            message: response.message,
            type: 1
          });
          this.setState({ recommentloading: false });
        } else {
          // get the updated index of the reply and update it in the comment.
          let comments = [...this.state.comments];
          let comment = comments.find(obj =>
            obj.postrecomment_set.find(elem => elem.pk === this.state.pk)
          );
          let reply = comment.postrecomment_set.find(
            obj => obj.pk === this.state.pk
          );
          reply.re_comment = this.state.recomment;
          this.setState({
            comments: comments,
            recomment: "",
            recommentloading: false,
            customUpdatePK: false,
            operation: -1
          });
        }
      }
    );
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

  addComment = () => {
    this.setState({ addloading: true });
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
        type: 1
      });
      this.setState({ addloading: false });
    } else {
      let comments = [...this.state.comments];
      comments.push(response);
      this.setState({
        comments: comments,
        emptyresult: false,
        addloading: false,
        comment: ""
      });
    }
  };

  render = () => {
    // Display the comments with pagination.
    return (
      <Fragment>
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
            <Comment.Group>
              <Header as="h3" dividing>
                Comments
              </Header>
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
                      <h4>No comments yet</h4>
                    </div>
                  ) : (
                    <div>
                      <Comment.Group>
                        {this.state.comments.map((obj, index) => (
                          <Comment key={index}>
                            <Comment.Content>
                              {obj.created_by_pic !== "" ? (
                                <span>
                                  {" "}
                                  <Image
                                    src={obj.created_by_pic}
                                    circular
                                    size="mini"
                                  />{" "}
                                </span>
                              ) : (
                                <Icon name="user" circular inverted />
                              )}
                              <Comment.Author as="a">{obj.user}</Comment.Author>
                              <Comment.Metadata>
                                <div>{this.formatTime(obj.created_on)}</div>
                              </Comment.Metadata>
                              <Comment.Text>
                                {this.state.commentEdit &&
                                this.state.customUpdatePK === obj.pk ? (
                                  <Fragment>
                                    <CustomTextArea
                                      changeHandler={e =>
                                        this.setState({
                                          updatecomment: e.target.value
                                        })
                                      }
                                      value={this.state.updatecomment}
                                      placeholder={"Update the comment"}
                                      loading={this.state.recommentloading}
                                      onSuccess={this.handleCommentUpdate}
                                      onCancel={() =>
                                        this.setState({
                                          updatecomment: "",
                                          recommentloading: false,
                                          commentEdit: false,
                                          customUpdatePK: false
                                        })
                                      }
                                      button="Update"
                                    />
                                  </Fragment>
                                ) : (
                                  <Fragment>{obj.comment}</Fragment>
                                )}
                              </Comment.Text>
                              <Comment.Actions>
                                {(this.state.commentEdit &&
                                  this.state.customUpdatePK === obj.pk) ||
                                (this.state.operation === 0 &&
                                  this.state.customUpdatePK === obj.pk) ? (
                                  ""
                                ) : (
                                  <Fragment>
                                    <Comment.Action
                                      onClick={() =>
                                        this.setState({
                                          pk: obj.pk,
                                          operation: 0,
                                          commentEdit: false,
                                          customUpdatePK: obj.pk,
                                          recomment: ""
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
                                              pk: obj.pk,
                                              customUpdatePK: obj.pk,
                                              operation: -1,
                                              recomment: ""
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
                                  </Fragment>
                                )}
                              </Comment.Actions>
                            </Comment.Content>
                            {this.state.operation === 0 &&
                            this.state.customUpdatePK === obj.pk ? (
                              <Fragment>
                                <CustomTextArea
                                  changeHandler={e =>
                                    this.setState({
                                      recomment: e.target.value
                                    })
                                  }
                                  value={this.state.recomment}
                                  placeholder={"Add Reply..."}
                                  loading={this.state.recommentloading}
                                  onSuccess={this.addreply}
                                  onCancel={() =>
                                    this.setState({
                                      recomment: "",
                                      recommentloading: false,
                                      operation: -1,
                                      customUpdatePK: false
                                    })
                                  }
                                  button="Add reply"
                                />
                              </Fragment>
                            ) : (
                              ""
                            )}
                            <Comment.Group>
                              {obj.postrecomment_set.map((elem, ind) => (
                                <Comment key={ind}>
                                  <Comment.Content>
                                    {elem.created_by_pic !== "" ? (
                                      <span>
                                        <Image
                                          src={elem.created_by_pic}
                                          circular
                                          size="mini"
                                        />{" "}
                                      </span>
                                    ) : (
                                      <Icon name="user" circular inverted />
                                    )}
                                    <Comment.Author as="a">
                                      {elem.user}
                                    </Comment.Author>
                                    <Comment.Metadata>
                                      <div>
                                        {this.formatTime(elem.created_on)}
                                      </div>
                                    </Comment.Metadata>
                                    {this.state.operation === 1 &&
                                    this.state.customUpdatePK === elem.pk ? (
                                      <Fragment>
                                        <CustomTextArea
                                          changeHandler={e =>
                                            this.setState({
                                              recomment: e.target.value
                                            })
                                          }
                                          value={this.state.recomment}
                                          placeholder={"Update Reply..."}
                                          loading={this.state.recommentloading}
                                          onSuccess={this.handleReplyUpdate}
                                          onCancel={() =>
                                            this.setState({
                                              recomment: "",
                                              recommentloading: false,
                                              operation: -1,
                                              customUpdatePK: false
                                            })
                                          }
                                          button="Update"
                                        />
                                      </Fragment>
                                    ) : (
                                      <Comment.Text>
                                        {elem.re_comment}
                                      </Comment.Text>
                                    )}

                                    <Comment.Actions>
                                      {this.state.operation === 1 &&
                                      this.state.customUpdatePK === elem.pk ? (
                                        ""
                                      ) : (
                                        <Fragment>
                                          {elem.edit ? (
                                            <Fragment>
                                              <Comment.Action
                                                onClick={() =>
                                                  this.setState({
                                                    pk: elem.pk,
                                                    recomment: elem.re_comment,
                                                    operation: 1,
                                                    customUpdatePK: elem.pk
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
                                        </Fragment>
                                      )}
                                    </Comment.Actions>
                                  </Comment.Content>
                                </Comment>
                              ))}
                            </Comment.Group>
                          </Comment>
                        ))}
                      </Comment.Group>
                      {this.state.pagination ? (
                        <div
                          style={{
                            marginTop: 10,
                            marginBottom: 10,

                            textAlign: "center"
                          }}
                        >
                          <Pagination
                            page={this.state.page}
                            total={this.state.pages}
                            onClick={this.handlePageClick}
                            type={"arrow"}
                          />
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  )}
                </Fragment>
              )}
              <Form reply>
                <Form.TextArea
                  id="comment_textarea"
                  placeholder="Comment here.."
                  value={this.state.comment}
                  onChange={e => this.setState({ comment: e.target.value })}
                />
                <Button
                  content="Add Comment"
                  labelPosition="left"
                  icon="edit"
                  primary
                  disabled={this.state.addloading}
                  loading={this.state.addloading}
                  onClick={this.addComment}
                />
              </Form>
            </Comment.Group>
          </div>
        </Transition>
      </Fragment>
    );
  };
}

export { CommentPagination };
