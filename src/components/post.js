import React, { Component, Fragment } from "react";
import { fetchAsynchronous, fetchFileAsynchronous } from "./controllers/fetch";
import { Scrollbars } from "react-custom-scrollbars";
import {
  PostListView,
  PostView,
  PostCreateView,
  acceptedTypes,
  imageFormats,
  months,
  postAction,
  postpaginationCount as paginationCount
} from "./../api";
import { getCookie } from "./cookie";
import {
  Loader,
  Button,
  Icon,
  Card,
  TextArea,
  Modal,
  Transition,
  Grid,
  Input,
  Form,
  Divider,
  Label,
  Header,
  Popup
} from "semantic-ui-react";
import { BaseComment } from "./comment";
import { CommentPagination } from "./allcomments";
import Pagination from "semantic-ui-react-button-pagination";
import { CopyToClipboard } from "react-copy-to-clipboard";

class BasePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      group: this.props.group,
      posts: [],
      loading: true,
      emptyData: false,
      emptyContent: "No post found as per given requirement",
      modalvisible: false,
      header: "",
      about: "",
      file: "",
      formloading: false,
      visiblecomment: false,
      showallcomments: false,
      page: 1,
      offset: 0,
      items: 0,
      pagination: false,
      searchvalue: "",
      pksearch: this.props.params
    };
  }

  onsearchEnter = (e, searchvalue) => {
    if (e.key === "Enter") {
      let uri;
      if (searchvalue != "") {
        uri =
          PostListView +
          this.state.group.pk +
          "/?name=header&search=" +
          searchvalue +
          "&page=1";
      } else {
        uri = PostListView + this.state.group.pk + "/?page=1";
      }

      this.setState({
        searchvalue: searchvalue,
        page: 1,
        items: 0,
        offset: 0,
        loading: true
      });
      this.getList(uri);
    }
  };

  resetallcomments = () => {
    this.setState({ showallcomments: false });
  };

  setPost = obj => {
    let index = this.state.posts.indexOf(
      this.state.posts.find(elem => elem.pk === obj.pk)
    );
    let posts = [...this.state.posts];
    posts[index] = obj;
    this.setState({ posts: posts });
  };

  getList = uri => {
    fetchAsynchronous(
      uri,
      "GET",
      undefined,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.fetchPostCallback
    );
  };

  componentDidMount = () => {
    let uri = PostListView + this.state.group.pk + "/";
    if (this.state.pksearch !== false) {
      uri +=
        "?name=pk&search=" + this.state.pksearch + "&page=" + this.state.page;
      this.setState({ pksearch: false });
    } else {
      uri += "?page=" + this.state.page;
    }
    this.getList(uri);
  };

  fetchPostCallback = response => {
    if (response.hasOwnProperty("results")) {
      if (this.state.page === 1 && response.results.length === 0) {
        this.setState({
          emptyData: true,
          loading: false
        });
      } else if (this.state.page === 1) {
        let length = response.results.length;

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
          posts: response.results,
          loading: false,
          emptyData: false
        });
      } else {
        this.setState({
          items: response.count,
          posts: response.results,
          loading: false,
          emptyData: false
        });
      }
    }
  };

  componentDidUpdate = (prevprops, prevState) => {
    if (prevprops.group !== this.props.group) {
      this.setState(
        {
          group: this.props.group,
          loading: true,
          page: 1,
          items: 0,
          offset: 0
        },
        () => this.getList(PostListView + this.props.group.pk + "/?page=" + 1)
      );
    }
  };

  deletePost = post => {
    let posts = [...this.state.posts];
    posts.splice(posts.indexOf(post), 1);
    this.setState({ posts: posts });
  };

  handlePostCreate = () => {
    this.setState({ formloading: true });
    this.props.setMessage({ message: false, header: "", type: 0 });

    let data = new FormData();
    data.append("team", this.state.group.pk);
    data.append("header", this.state.header);
    data.append("about", this.state.about);
    if (this.state.file !== "") {
      data.append("file", this.state.file);
    }

    fetchFileAsynchronous(
      PostCreateView,
      "POST",
      data,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.handlePostCreateCallback
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

  handlePostCreateCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      // set the snackbar
      this.props.setMessage({
        message: response.message,
        type: 1,
        header: "Error"
      });
      this.setState({ formloading: false });
    } else {
      // add post to the list of posts.
      let posts = [...this.state.posts];

      posts.unshift(response);

      this.props.setMessage({
        message: "Successfully added post to timeline",
        type: 0,
        header: "Success"
      });
      this.setState({
        posts: posts,
        modalvisible: false,
        formloading: false,
        header: "",
        about: "",
        file: "",
        emptyData: false
      });
    }
  };

  handleChange = e => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  checkForFetch = () => {
    /*
     * Checks  if search operation is performed.
     */
    let uri;
    if (this.state.searchvalue === "") {
      // User has not performed any search operaiton.
      uri = PostListView + this.state.group.pk + "/?page=" + this.state.page;
    } else {
      if (this.state.pksearch === false) {
        uri =
          PostListView +
          this.state.group.pk +
          "/?name=header&search=" +
          this.state.searchvalue +
          "&page=" +
          this.state.page;
      } else {
        uri =
          PostListView +
          this.state.group.pk +
          "/?name=pk&value=" +
          this.state.pksearch +
          "&page=" +
          this.state.page;
      }
    }
    this.getList(uri);
  };

  handlePageClick = offset => {
    this.setState(
      {
        offset: offset,
        page: Math.ceil(offset / paginationCount) + 1,
        loading: true
      },
      () => this.checkForFetch()
    );
  };

  render = () => {
    let { modalvisible } = this.state;
    return (
      <Fragment>
        <Transition animation="scale" duration={400} visible={modalvisible}>
          <Modal open={modalvisible} centered={false}>
            <Modal.Header>
              Post on Timeline
              <Icon
                name="close"
                color="red"
                onClick={() =>
                  this.setState({
                    modalvisible: false,
                    header: "",
                    about: "",
                    file: ""
                  })
                }
                style={{ float: "right", cursor: "pointer" }}
              />
            </Modal.Header>
            <Modal.Content>
              <Form>
                <Grid columns="equal">
                  <Grid.Row>
                    <Grid.Column />
                    <Grid.Column textAlign="center">
                      <Input
                        icon="edit"
                        type="text"
                        name="header"
                        iconPosition="left"
                        placeholder="Post header"
                        value={this.state.header}
                        onChange={this.handleChange}
                        style={{ marginBottom: 15 }}
                      />
                      <Form.TextArea
                        placeholder="Tell us more"
                        name="about"
                        value={this.state.about}
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
                            if (
                              acceptedTypes.indexOf(file.type) > -1 ||
                              type === "image"
                            ) {
                              this.setState({ file: file });
                            } else {
                              this.props.setMessage({
                                message:
                                  "Only image, pdf, zip files are accepted",
                                type: 1,
                                header: "Error"
                              });
                            }
                          }}
                        />
                        <label htmlFor="postfile" style={{ cursor: "pointer" }}>
                          Add image / file{" "}
                          {this.state.file != "" &&
                          this.state.file.name.length >= 20
                            ? this.state.file.name.substr(0, 19) + ".."
                            : this.state.file.name}
                        </label>
                      </div>
                      <br />
                      <Button
                        disabled={this.state.formloading}
                        onClick={this.handlePostCreate}
                        loading={this.state.formloading}
                        secondary
                      >
                        Post it
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
        <Scrollbars style={{ height: "99%", overflowX: "hidden" }}>
          {this.state.loading ? (
            <Loader active> fetching posts</Loader>
          ) : (
            <Fragment>
              <Button
                secondary
                style={{ width: "97%" }}
                onClick={() => this.setState({ modalvisible: true })}
              >
                <Icon name="add" />
                Add a new Post to Timeline
              </Button>
              {this.state.emptyData ? (
                <Fragment>
                  <div
                    style={{
                      marginTop: "calc(100px + 15vh)",
                      textAlign: "center"
                    }}
                  >
                    <h2>
                      {this.state.searchvalue === "" ||
                      this.state.pksearch === false
                        ? "No posts in group as per given requirement"
                        : "NO posts posted in the timeline"}
                    </h2>
                  </div>
                </Fragment>
              ) : (
                <Fragment>
                  {this.state.posts.map((obj, index) => (
                    <Fragment key={index}>
                      <Card style={{ width: "80%", marginLeft: 40 }}>
                        <Card.Content>
                          <Card.Header>
                            {obj.header}{" "}
                            <CopyToClipboard
                              onCopy={() => alert("url copied to clipboard")}
                              text={obj.link}
                            >
                              <div
                                style={{
                                  display: "inline",
                                  float: "right",
                                  cursor: "pointer"
                                }}
                              >
                                <Popup
                                  trigger={<Icon name="share" />}
                                  content="Share"
                                />
                              </div>
                            </CopyToClipboard>
                          </Card.Header>

                          <Card.Meta>
                            <span className="date">
                              {this.formatTime(obj.created_on)}
                            </span>
                            {obj.edit ? (
                              <div style={{ float: "right" }}>
                                <PostEdit
                                  setLoader={this.props.setLoader}
                                  post={obj}
                                  deletePost={this.deletePost}
                                  setMessage={this.props.setMessage}
                                  setPost={this.setPost}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                          </Card.Meta>
                          <br />
                          {obj.file !== null ? (
                            <Fragment>
                              {imageFormats.indexOf(
                                obj.file
                                  .split("/")
                                  [obj.file.split("/").length - 1].split(".")[1]
                              ) > -1 ? (
                                <div
                                  style={{
                                    background: "#eff0f2",
                                    textAlign: "center"
                                  }}
                                >
                                  <img
                                    src={obj.file}
                                    alt={obj.header + " image"}
                                    style={{
                                      maxWidth: "100%"
                                    }}
                                  />
                                  <br />
                                </div>
                              ) : (
                                <Fragment>
                                  <p>
                                    The contents of the file can not be
                                    displayed in the post. You can download it
                                    here
                                    <a
                                      style={{ float: "right" }}
                                      href={obj.file}
                                      download
                                    >
                                      Download
                                    </a>
                                  </p>
                                </Fragment>
                              )}
                            </Fragment>
                          ) : (
                            ""
                          )}
                          <br />
                          <Card.Description>{obj.about}</Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                          <PostAction post={obj} setPost={this.setPost} />
                          <Button
                            icon
                            style={{ float: "right" }}
                            onClick={() =>
                              this.setState({
                                visiblecomment:
                                  this.state.visiblecomment === obj.pk
                                    ? false
                                    : obj.pk
                              })
                            }
                          >
                            <Icon name="comments" />
                          </Button>
                        </Card.Content>

                        <Transition
                          duration={400}
                          visible={this.state.visiblecomment === obj.pk}
                          animation="drop"
                        >
                          <Card.Content extra>
                            <BaseComment
                              post={obj}
                              setPost={this.setPost}
                              setMessage={this.props.setMessage}
                            />
                            <Divider />
                            <div style={{ textAlign: "center", width: "100%" }}>
                              <a
                                onClick={() => {
                                  this.setState({ showallcomments: obj.pk });
                                }}
                              >
                                View all comments
                              </a>
                              {this.state.showallcomments === obj.pk ? (
                                <Fragment>
                                  <CommentPagination
                                    setMessage={this.props.setMessage}
                                    post={this.state.showallcomments}
                                    setPost={this.setPost}
                                    setAllComment={val =>
                                      this.setState({ showallcomments: val })
                                    }
                                  />
                                </Fragment>
                              ) : (
                                <Fragment />
                              )}
                            </div>
                          </Card.Content>
                        </Transition>
                      </Card>
                    </Fragment>
                  ))}
                  <br />
                  {this.state.pagination === true ? (
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
                  <br />
                </Fragment>
              )}
            </Fragment>
          )}
        </Scrollbars>
      </Fragment>
    );
  };
}

class PostEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      header: "",
      about: "",
      file: false,
      visible: false,
      loading: false,
      alert: false
    };
  }

  handleModalClose = () => {
    this.setState({
      visible: false,
      loading: false,
      file: false
    });
  };

  handleChange = e => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  HandleFormSubmit = () => {
    this.setState({ loading: true });

    if (this.state.file === false) {
      let data = {
        header: this.state.header,
        about: this.state.about
      };
      let headers = {
        Authorization: "Token " + getCookie("token")[0].value,
        "Content-Type": "application/json"
      };

      fetchAsynchronous(
        PostView + this.props.post.pk + "/",
        "PATCH",
        data,
        headers,
        this.handlePostUpdateAPICallback
      );
    } else {
      let data = new FormData();
      data.append("header", this.state.header);
      data.append("about", this.state.about);
      if (this.state.file !== "") {
        data.append("file", this.state.file);
      }
      fetchFileAsynchronous(
        PostView + this.props.post.pk + "/",
        "PATCH",
        data,
        { Authorization: "Token " + getCookie("token")[0].value },
        this.handlePostUpdateAPICallback
      );
    }
  };

  handlePostUpdateAPICallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({ loading: false });
      this.props.setMessage({
        message: response.message,
        type: 1,
        header: "Error"
      });
    } else {
      this.setState({
        loading: false,
        visible: false
      });

      this.props.setPost(response);
      this.props.setMessage({
        message: "Successfully updated the post",
        type: 0,
        header: "Success"
      });
    }
  };

  handleUpdate = () => {
    this.setState({
      visible: true,
      header: this.props.post.header,
      about: this.props.post.about,
      file: false
    });
  };

  handleAlertClick = () => {
    this.props.setLoader(true);
    this.props.setMessage({ message: false, type: 1, header: "" });
    this.setState({ alert: false });
    fetchAsynchronous(
      PostView + this.props.post.pk + "/",
      "DELETE",
      undefined,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.deleteCallback
    );
  };

  deleteCallback = response => {
    this.props.setLoader(false);
    this.props.deletePost(this.props.post);
    this.props.setMessage({
      message: response.message,
      type: response.error === 1 ? 1 : 0,
      header: response.error === 1 ? "Error" : "Success"
    });
  };

  render = () => {
    let { visible, alert } = this.state;
    let { post } = this.props;
    return (
      <Fragment>
        <Transition animation="scale" duration={400} visible={visible}>
          <Modal open={visible} centered={false}>
            <Modal.Header>
              Update Post {post.header}
              <Icon
                name="close"
                color="red"
                onClick={this.handleModalClose}
                style={{ float: "right", cursor: "pointer" }}
              />
            </Modal.Header>
            <Modal.Content>
              <Form>
                <Grid columns="equal">
                  <Grid.Row>
                    <Grid.Column />
                    <Grid.Column textAlign="center">
                      <Input
                        icon="edit"
                        type="text"
                        name="header"
                        iconPosition="left"
                        placeholder="Post header"
                        value={this.state.header}
                        onChange={this.handleChange}
                        style={{ marginBottom: 15 }}
                      />
                      <TextArea
                        placeholder="Tell us more"
                        name="about"
                        value={this.state.about}
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
                            if (
                              acceptedTypes.indexOf(file.type) > -1 ||
                              type === "image"
                            ) {
                              this.setState({ file: file });
                            } else {
                              this.props.setMessage({
                                message:
                                  "Only image, pdf, zip files are accepted",
                                type: 1,
                                header: "Error"
                              });
                            }
                          }}
                        />
                        <label htmlFor="postfile" style={{ cursor: "pointer" }}>
                          Update image / file{" "}
                          {this.state.file != "" &&
                          this.state.file.name.length >= 20
                            ? this.state.file.name.substr(0, 19) + ".."
                            : this.state.file.name}
                        </label>
                      </div>
                      <br />
                      <Button
                        disabled={this.state.loading}
                        onClick={this.HandleFormSubmit}
                        loading={this.state.loading}
                        secondary
                      >
                        Update
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
        <Transition animation="scale" duration={400} visible={alert}>
          <Modal open={alert} basic size="small">
            <Header icon="exclamation triangle" content="Are you sure ?" />
            <Modal.Content>
              <p>
                This action is invertible. On deleting the post no other person
                could be able to see it
              </p>
            </Modal.Content>
            <Modal.Actions>
              <Button
                basic
                color="red"
                inverted
                onClick={() => this.setState({ alert: false })}
              >
                <Icon name="remove" /> No
              </Button>
              <Button color="green" inverted onClick={this.handleAlertClick}>
                <Icon name="checkmark" /> Yes
              </Button>
            </Modal.Actions>
          </Modal>
        </Transition>
        <span
          style={{
            cursor: "pointer",
            color: "#4286f4"
          }}
          onClick={this.handleUpdate}
        >
          Update
        </span>{" "}
        <span
          style={{
            cursor: "pointer",
            color: "#f7342a"
          }}
          onClick={() => this.setState({ alert: true })}
        >
          Delete
        </span>
      </Fragment>
    );
  };
}

class PostAction extends Component {
  isLike = () => this.props.post.action === "like";

  isUnLike = () => this.props.post.action === "unlike";

  updateAction = action => {
    let post = Object.assign({}, this.props.post);
    if (post.action === action) {
      post[action] -= 1;
      post.action = "";
      action = "";
    } else {
      post[action] += 1;
      post.action = action;
    }
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    fetchAsynchronous(
      postAction + this.props.post.pk + "/",
      "POST",
      { action: action },
      headers,
      undefined
    );

    this.props.setPost(post);
  };

  render = () => {
    return (
      <Fragment>
        <Button as="div" labelPosition="right">
          <Button
            icon
            disabled={this.isUnLike()}
            onClick={() => this.updateAction("like")}
          >
            <Icon name={this.isLike() ? "thumbs up" : "thumbs up outline"} />
            Like
          </Button>
          <Label as="a" basic pointing="left">
            {this.props.post.like}
          </Label>
        </Button>
        <Button as="div" labelPosition="right">
          <Button
            icon
            disabled={this.isLike()}
            onClick={() => this.updateAction("unlike")}
          >
            <Icon
              name={this.isUnLike() ? "thumbs down" : "thumbs down outline"}
            />
            DisLike
          </Button>
          <Label as="a" basic pointing="left">
            {this.props.post.unlike}
          </Label>
        </Button>
      </Fragment>
    );
  };
}

export { BasePost };
