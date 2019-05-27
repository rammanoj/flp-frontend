import React, { Component, Fragment } from "react";
import { fetchAsynchronous, fetchFileAsynchronous } from "./controllers/fetch";
import {
  PostListView,
  PostView,
  PostCreateView,
  acceptedTypes,
  imageFormats,
  months,
  postAction,
  paginationCount
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
  Image,
  Dropdown
} from "semantic-ui-react";
import { CommentPagination } from "./allcomments";
import { Paginate as Pagination } from "./elements/pagination";
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
      pages: 0,
      pagination: false,
      searchvalue: "",
      pksearch: false,
      tags: [],
      tag: ""
    };
  }

  onsearchEnter = (e, searchvalue) => {
    if (e.key === "Enter") {
      let uri;
      if (searchvalue !== "") {
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
        pages: 0,
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
    if (this.props.pksearch !== false) {
      uri +=
        "?name=pk&search=" + this.props.pksearch + "&page=" + this.state.page;
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
            pages: Math.ceil(response.count / paginationCount)
          });
        } else {
          this.setState({
            pagination: false,
            pages: 0
          });
        }
        this.setState({
          posts: response.results,
          loading: false,
          emptyData: false
        });
      } else {
        this.setState({
          pages: Math.ceil(response.count / paginationCount),
          posts: response.results,
          loading: false,
          emptyData: false
        });
      }
    }
  };

  componentDidUpdate = (prevprops, prevState) => {
    if (
      this.props.pksearch !== prevprops.pksearch &&
      this.props.pksearch !== false
    ) {
      this.setState(
        {
          group: this.props.group,
          loading: true,
          page: 1,
          pages: 0,
          posts: []
        },
        () =>
          this.getList(
            PostListView +
              this.state.group.pk +
              "/?name=pk&search=" +
              this.props.pksearch +
              "&page=1"
          )
      );
    } else if (
      prevprops.renderpost !== this.props.renderpost ||
      prevprops.group !== this.props.group
    ) {
      this.setState(
        {
          group: this.props.group,
          loading: true,
          page: 1,
          pages: 0,
          posts: []
        },
        () => this.getList(PostListView + this.state.group.pk + "/?page=1")
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
    let data = new FormData();
    data.append("group", this.state.group.pk);
    data.append("header", this.state.header);
    data.append("about", this.state.about);
    for (let i in this.state.tags) {
      data.append("tags[]", this.state.tags[i]);
    }
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
        type: 1
      });
      this.setState({ formloading: false });
    } else {
      // add post to the list of posts.
      let posts = [...this.state.posts];
      posts.unshift(response);

      this.props.setMessage({
        message: "Successfully added post to timeline",
        type: 0
      });
      this.setState({
        posts: posts,
        modalvisible: false,
        formloading: false,
        header: "",
        about: "",
        file: "",
        emptyData: false,
        tags: [],
        tag: ""
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

  handlePageClick = page => {
    this.setState(
      {
        page: page,
        loading: true
      },
      () => this.checkForFetch()
    );
  };

  render = () => {
    let { modalvisible } = this.state;
    return (
      <Fragment>
        <Button
          secondary
          className="add_post_button"
          onClick={() => this.setState({ modalvisible: true })}
        >
          <Icon name="add" />
          Add new Post
        </Button>

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
                    file: "",
                    tags: [],
                    tag: ""
                  })
                }
                style={{ float: "right", cursor: "pointer" }}
              />
            </Modal.Header>
            <Modal.Content>
              <Form id="newpost">
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
                                type: 1
                              });
                            }
                          }}
                        />
                        <label htmlFor="postfile" style={{ cursor: "pointer" }}>
                          Add image / file{" "}
                          {this.state.file !== "" &&
                          this.state.file.name.length >= 20
                            ? this.state.file.name.substr(0, 19) + ".."
                            : this.state.file.name}
                        </label>
                      </div>
                      <br />
                      <b>Note: Press 'Enter' after entering each username</b>
                      <br />
                      {this.state.tags.map((tag, index) => (
                        <Label style={{ marginBottom: 1 }} key={index}>
                          {tag}{" "}
                          <Icon
                            name="close icon"
                            size="small"
                            onClick={() => {
                              let tags = [...this.state.tags];
                              tags.splice(index, 1);
                              this.setState({ tags: tags });
                            }}
                          />
                        </Label>
                      ))}
                      <br />
                      <Input
                        icon="tag"
                        iconPosition="left"
                        placeholder="Tag any user for the post ..... ?"
                        value={this.state.tag}
                        type="text"
                        onChange={e => this.setState({ tag: e.target.value })}
                        onKeyPress={e => {
                          if (e.key === "Enter") {
                            if (this.state.tag !== "") {
                              let tags = [...this.state.tags];
                              tags.push(this.state.tag);
                              this.setState({ tags: tags, tag: "" });
                            }
                          }
                        }}
                        style={{ width: "100%" }}
                      />

                      <Divider horizontal />
                    </Grid.Column>

                    <Grid.Column />
                  </Grid.Row>
                </Grid>
              </Form>
              <div style={{ textAlign: "center" }}>
                <Button
                  className="post_create_button"
                  disabled={this.state.formloading}
                  onClick={this.handlePostCreate}
                  loading={this.state.formloading}
                  secondary
                >
                  Post it
                </Button>
              </div>
            </Modal.Content>
          </Modal>
        </Transition>
        {this.state.loading ? (
          <Loader active> fetching posts</Loader>
        ) : (
          <Fragment>
            {this.state.emptyData ? (
              <Fragment>
                <div
                  style={{
                    paddingTop: "calc(100px + 15vh)",
                    textAlign: "center"
                  }}
                >
                  <h2>
                    {this.state.searchvalue !== "" ||
                    this.state.pksearch !== false
                      ? "No posts in group as per given requirement"
                      : "No posts posted in the timeline"}
                  </h2>
                </div>
              </Fragment>
            ) : (
              <Fragment>
                {this.state.posts.map((obj, index) => (
                  <Fragment key={index}>
                    <Card style={{ width: "80%", marginLeft: 55 }}>
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
                                alt=""
                                style={{
                                  maxWidth: "100%"
                                }}
                              />

                              <br />
                            </div>
                          ) : (
                            <Fragment>
                              <p style={{ marginLeft: 5, marginTop: 5 }}>
                                <b>
                                  The contents of the file can not be displayed
                                  in the post.
                                  <a href={obj.file} download>
                                    You can download it here
                                  </a>
                                </b>
                              </p>
                            </Fragment>
                          )}
                        </Fragment>
                      ) : (
                        ""
                      )}
                      {obj.file !== null ? (
                        <div>
                          {obj.edit ? (
                            <div id="more">
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
                        </div>
                      ) : (
                        ""
                      )}
                      <Card.Content>
                        <table>
                          <tbody>
                            <tr style={{ padding: 0 }}>
                              <td rowSpan={4} style={{ padding: 0 }}>
                                {obj.created_by_pic !== "" ? (
                                  <Image
                                    style={{ height: 55, width: 55 }}
                                    circular
                                    src={obj.created_by_pic}
                                  />
                                ) : (
                                  <Icon name="user" size="large" />
                                )}
                              </td>
                            </tr>
                            <tr style={{ padding: 0 }}>
                              <td>
                                <div
                                  style={{
                                    fontSize: 15
                                  }}
                                >
                                  <a href="#">{obj.created_by}</a>
                                </div>
                              </td>
                              <td>
                                {obj.file === null ? (
                                  <Fragment>
                                    {obj.edit ? (
                                      <div id="more">
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
                                  </Fragment>
                                ) : (
                                  ""
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingLeft: 0 }}>
                                <Card.Meta>
                                  <p>{this.formatTime(obj.created_on)}</p>
                                </Card.Meta>
                              </td>
                            </tr>
                            <tr>
                              <td />
                            </tr>
                          </tbody>
                        </table>

                        <Card.Meta />

                        {obj.posttaggeduser_set.length !== 0 ? (
                          <Fragment>
                            {obj.posttaggeduser_set.map((tag, index) => (
                              <Fragment key={index}>
                                <a href="#">
                                  <b>{tag.user}</b>
                                </a>
                                {index !== obj.posttaggeduser_set.length - 1
                                  ? ", "
                                  : " "}
                              </Fragment>
                            ))}
                            tagged in this post.
                          </Fragment>
                        ) : (
                          ""
                        )}
                      </Card.Content>
                      <Card.Content extra>
                        <Card.Description>
                          <h3>{obj.header}</h3>
                          <p>{obj.about}</p>
                          {obj.like > 0 ? (
                            <Fragment>
                              {obj.action === "like" ? (
                                <b>
                                  You{" "}
                                  {obj.like - 1 > 0 ? (
                                    <span>
                                      and{" "}
                                      {obj.like - 1 > 1 ? (
                                        <span>
                                          {obj.like - 1} other persons like
                                          this.
                                        </span>
                                      ) : (
                                        <span>1 other person like this.</span>
                                      )}
                                    </span>
                                  ) : (
                                    <span>like this</span>
                                  )}
                                </b>
                              ) : (
                                <Fragment>
                                  {obj.like > 1 ? (
                                    <b>{obj.like} persons like this post.</b>
                                  ) : (
                                    <b>1 person like this post</b>
                                  )}
                                </Fragment>
                              )}
                            </Fragment>
                          ) : (
                            ""
                          )}
                        </Card.Description>
                      </Card.Content>
                      <Card.Content extra>
                        <Grid columns={3}>
                          <Grid.Row style={{ textAlign: "center" }}>
                            <Grid.Column>
                              <PostAction post={obj} setPost={this.setPost} />
                            </Grid.Column>
                            <Grid.Column>
                              <Icon
                                name="comment outline"
                                size="big"
                                style={{ color: "#35b18a", cursor: "pointer" }}
                                onClick={() =>
                                  this.setState({
                                    visiblecomment:
                                      this.state.visiblecomment === obj.pk
                                        ? false
                                        : obj.pk
                                  })
                                }
                              />
                            </Grid.Column>
                            <Grid.Column>
                              <div style={{ color: "#35b18a" }}>
                                <CopyToClipboard
                                  onCopy={() =>
                                    alert("url copied to clipboard")
                                  }
                                  text={obj.link}
                                >
                                  <Icon
                                    style={{ cursor: "pointer" }}
                                    name="share"
                                    size="big"
                                  />
                                </CopyToClipboard>
                              </div>
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                      </Card.Content>

                      {this.state.visiblecomment === obj.pk ? (
                        <Transition
                          duration={400}
                          visible={this.state.visiblecomment === obj.pk}
                          animation="drop"
                        >
                          <Card.Content extra>
                            <CommentPagination
                              post={obj}
                              setPost={this.setPost}
                              setMessage={this.props.setMessage}
                            />
                          </Card.Content>
                        </Transition>
                      ) : (
                        ""
                      )}
                    </Card>
                  </Fragment>
                ))}
                <br />
              </Fragment>
            )}
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
                  page={this.state.page}
                  total={this.state.pages}
                  onClick={this.handlePageClick}
                  type={"number"}
                />
              </div>
            ) : (
              ""
            )}
          </Fragment>
        )}
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
      alert: false,
      tags: [],
      tag: ""
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

  checkEqual = (arr1, arr2) => {
    let ind = false;
    for (let i in arr1) {
      if (arr1[i] !== arr2[i].user) {
        ind = true;
        break;
      }
    }
    if (ind === true) {
      return arr1;
    } else {
      return [];
    }
  };

  HandleFormSubmit = () => {
    this.setState({ loading: true });
    let tag = [];
    if (this.state.tags.length !== this.props.posttaggeduser_set) {
      tag = this.state.tags;
    } else {
      tag = this.checkEqual(this.state.tags, this.props.posttaggeduser_set);
    }

    if (this.state.file === false) {
      let data = {
        header: this.state.header,
        about: this.state.about
      };

      if (tag.length !== 0) {
        data["tags"] = tag;
      }
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
      if (tag.length !== 0) {
        for (let i in tag) {
          data.append("tags[]", tag[i]);
        }
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
        type: 1
      });
    } else {
      this.setState({
        loading: false,
        visible: false
      });

      this.props.setPost(response);
      this.props.setMessage({
        message: "Successfully updated the post",
        type: 0
      });
    }
  };

  handleUpdate = () => {
    let tags = [];
    let taggeduser = this.props.post.posttaggeduser_set;
    for (let i in taggeduser) {
      tags.push(taggeduser[i].user);
    }
    this.setState({
      visible: true,
      header: this.props.post.header,
      about: this.props.post.about,
      file: false,
      tags: tags
    });
  };

  handleAlertClick = () => {
    this.props.setLoader(true);
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
      type: response.error === 1 ? 1 : 0
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
              <Form id="postupdate_form">
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
                                type: 1
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
                      <b>Note: Press 'Enter' after entering each username</b>
                      <br />
                      {this.state.tags.map((tag, index) => (
                        <Label style={{ marginBottom: 1 }} key={index}>
                          {tag}{" "}
                          <Icon
                            name="close"
                            size="small"
                            onClick={() => {
                              let tags = [...this.state.tags];
                              tags.splice(index, 1);
                              this.setState({ tags: tags });
                            }}
                          />
                        </Label>
                      ))}
                      <br />
                      <Input
                        icon="tag"
                        iconPosition="left"
                        placeholder="Tag any user for the post ..... ?"
                        value={this.state.tag}
                        type="text"
                        onChange={e => this.setState({ tag: e.target.value })}
                        onKeyPress={e => {
                          if (e.key === "Enter") {
                            let tags = [...this.state.tags];
                            tags.push(this.state.tag);
                            this.setState({ tags: tags, tag: "" });
                          }
                        }}
                        style={{ width: "100%" }}
                      />

                      <Divider horizontal />
                    </Grid.Column>

                    <Grid.Column />
                  </Grid.Row>
                </Grid>
              </Form>
              <div style={{ textAlign: "center" }}>
                <Button
                  disabled={this.state.loading}
                  onClick={this.HandleFormSubmit}
                  loading={this.state.loading}
                  secondary
                  className="postupdate_button"
                >
                  Update
                </Button>
              </div>
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
        <Dropdown
          icon={
            <span id="background">
              <Icon name="ellipsis horizontal" id="morevert" />
            </span>
          }
          direction="left"
          onClick={() => this.setState({ icon: "user" })}
          onClose={() => this.setState({ icon: "user outline" })}
        >
          <Dropdown.Menu>
            <Dropdown.Item onClick={this.handleUpdate}>
              <div style={{ color: "#28abe2" }}>
                <Icon name="edit outline" />
                <b>Update</b>
              </div>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => this.setState({ alert: true })}>
              <div style={{ color: "#e8293c" }}>
                <Icon name="trash alternate outline" />
                Delete
              </div>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Fragment>
    );
  };
}

class PostAction extends Component {
  isLike = () => this.props.post.action === "like";

  isUnLike = () => this.props.post.action === "unlike";

  updateAction = action => {
    let post = Object.assign({}, this.props.post);
    if (post.action === "like") {
      post["like"] -= 1;
      post.action = "";
      action = "";
    } else {
      post["like"] += 1;
      post.action = "like";
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
      () => {}
    );

    this.props.setPost(post);
  };

  render = () => {
    return (
      <div>
        {this.isLike() ? (
          <Icon
            name="heart"
            style={{ color: "#fc2f2f", cursor: "pointer" }}
            size="big"
            onClick={() => this.updateAction("")}
          />
        ) : (
          <Icon
            name="heart outline"
            size="big"
            onClick={() => this.updateAction("like")}
            style={{ cursor: "pointer" }}
          />
        )}
      </div>
    );
  };
}

export { BasePost };
