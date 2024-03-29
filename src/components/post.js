import React, { Component, Fragment } from "react";
import { fetchAsynchronous, fetchFileAsynchronous } from "./controllers/fetch";
import {
  PostListView,
  PostView,
  PostCreateView,
  acceptedTypes,
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
  Dropdown,
  Table
} from "semantic-ui-react";
import Slider from "./slider";
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
      tag: "",
      files: [],
      status: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
      ind: -1
    };
  }

  set = obj => {
    this.setState(obj);
  };

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
    let length = this.state.files.length;

    let data = new FormData();
    data.append("header", this.state.header);
    data.append("about", this.state.about);
    data.append("group", this.state.group.pk);

    if (length > 1) {
      data.append("number", 0);
    } else {
      data.append("number", 2);
      for (let i in this.state.tags) {
        data.append("tags[]", this.state.tags[i]);
      }
    }

    if (length >= 1) {
      data.append("file", this.state.files[0]);
      let status = [...this.state.status];
      status[this.state.ind + 1] = (
        <span style={{ color: "#41bbf4" }}>uploading...</span>
      );
      this.setState({ status: status });
    }

    fetchFileAsynchronous(
      PostCreateView,
      "POST",
      data,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.handlePostCreateCallback
    );
  };

  handlePostCreateCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      // set the snackbar
      this.props.setMessage({
        message: response.message,
        type: 1
      });
      let status = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
      this.setState({ formloading: false, ind: -1, status: status });
    } else {
      let length = this.state.files.length;
      if (
        length === 0 ||
        length === 1 ||
        this.state.ind + 1 === this.state.files.length
      ) {
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
          files: [],
          status: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
          ind: -1,
          emptyData: false,
          tags: [],
          tag: ""
        });
      } else {
        this.setState(
          {
            formloading: false,
            ind: this.state.ind + 1
          },
          () => {
            this.PostCreateAddFile(response.message);
          }
        );
      }
    }

    // add post to the list of posts.
  };

  PostCreateAddFile = pk => {
    let data = new FormData();
    data.append("file", this.state.files[this.state.ind + 1]);
    data.append("post", pk);
    if (this.state.ind + 1 === this.state.files.length) {
      data.append("number", 2);
      for (let i in this.state.tags) {
        data.append("tags[]", this.state.tags[i]);
      }
    } else {
      data.append("number", 1);
    }

    let status = [...this.state.status];
    status[this.state.ind + 1] = (
      <span style={{ color: "#41bbf4" }}>uploading...</span>
    );
    if (this.state.ind > -1) {
      status[this.state.ind] = (
        <span style={{ color: "#42f49e" }}>Uploaded</span>
      );
    }
    this.setState({ status: status });

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
                    files: [],
                    status: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
                    tags: [],
                    ind: -1,
                    tag: ""
                  })
                }
                style={{ float: "right", cursor: "pointer" }}
              />
            </Modal.Header>
            <Modal.Content>
              <Form id="newpost">
                <Grid>
                  <Grid.Row>
                    <Grid.Column computer={5} mobile={1} tablet={3} />
                    <Grid.Column
                      computer={6}
                      mobile={14}
                      tablet={10}
                      textAlign="center"
                    >
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
                        id="post_create_textarea"
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
                              if (file.size <= 26214400) {
                                if (this.state.files.length < 8) {
                                  let files = [...this.state.files];
                                  files.push(file);
                                  this.setState({ files: files });
                                } else {
                                  this.props.setMessage({
                                    message:
                                      "A post can have at a max of 8 files",
                                    type: 1
                                  });
                                }
                              } else {
                                this.props.setMessage({
                                  message: "Max file size is 25mb",
                                  type: 1
                                });
                              }
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
                        </label>
                        {this.state.files.length !== 0 ? (
                          <Fragment>
                            <Table>
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>Remove</Table.HeaderCell>
                                  <Table.HeaderCell>File</Table.HeaderCell>
                                  <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {this.state.files.map((file, index) => (
                                  <Table.Row>
                                    <Table.Cell>
                                      <Icon
                                        name="minus circle"
                                        onClick={() => {
                                          let files = [...this.state.files];
                                          files.splice(index, 1);
                                          this.setState({ files: files });
                                        }}
                                      />
                                    </Table.Cell>
                                    <Table.Cell>
                                      {file.name.length >= 20
                                        ? file.name.substr(0, 19) + ".."
                                        : file.name}
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                      {this.state.status[index]}
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table>
                          </Fragment>
                        ) : (
                          ""
                        )}
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

                    <Grid.Column computer={5} mobile={1} tablet={3} />
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
                    <Card style={{ width: "86%", marginLeft: "6%" }}>
                      {obj.postfile_set.length !== 0 ? (
                        <Fragment>
                          <Slider
                            items={obj.postfile_set}
                            post={obj}
                            set={this.set}
                            setMessage={this.props.setMessage}
                          />
                        </Fragment>
                      ) : (
                        ""
                      )}
                      {obj.postfile_set.length !== 0 ? (
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
                                {obj.postfile_set.length === 0 ? (
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
                              post_type={0}
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
    let status = [];
    for (let i in this.props.post.postfile_set) {
      status.push(
        <span style={{ color: "#42f4c5", textAlign: "center" }}>saved!</span>
      );
    }
    this.state = {
      header: "",
      about: "",
      visible: false,
      loading: false,
      alert: false,
      tags: [],
      files: this.props.post.postfile_set,
      status: status,
      ind: -1,
      tag: "",
      remove_file: [],
      add_file: []
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.props.post.postfile_set !== this.state.files &&
      this.state.visible === false
    ) {
      let status = [];
      for (let i in this.props.post.postfile_set) {
        status.push(
          <span style={{ color: "#42f4c5", textAlign: "center" }}>saved!</span>
        );
      }
      this.setState({
        files: this.props.post.postfile_set,
        status: status,
        add_file: []
      });
    }
  };

  handleModalClose = () => {
    let status = [];
    for (let i in this.props.post.postfile_set) {
      status.push(
        <span style={{ textAlign: "center", color: "#42f4c5" }}>saved!</span>
      );
    }
    this.setState({
      visible: false,
      loading: false,
      files: [],
      ind: -1,
      add_file: [],
      remove_file: [],
      status: []
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
    let tag;
    if (this.state.tags.length !== this.props.posttaggeduser_set) {
      tag = this.state.tags;
    } else {
      tag = this.checkEqual(this.state.tags, this.props.posttaggeduser_set);
    }

    let data = new FormData();
    data.append("header", this.state.header);
    data.append("about", this.state.about);

    if (tag.length !== 0) {
      for (let i in tag) {
        data.append("tags[]", tag[i]);
      }
    } else {
      data.append("tags[]", "");
    }
    let rv = "";
    for (let i in this.state.remove_file) {
      rv += this.state.remove_file[i] + ",";
    }
    rv = rv.slice(0, rv.length - 1);
    if (rv !== "") {
      data.append("remove_file", rv);
    }
    if (this.state.add_file.length === 1) {
      data.append("file", this.state.add_file[0]);
      data.append("number", 0);
      let status = [...this.state.status];
      console.log(this.state.files.length + this.state.ind + 1);
      status[this.state.files.length + this.state.ind + 1] = (
        <span style={{ color: "#41bbf4" }}>uploading...</span>
      );
      this.setState({ status: status });
    } else if (this.state.add_file.length > 1) {
      data.append("number", 1);
      let status = [...this.state.status];
      console.log(this.state.files.length + this.state.ind + 1);
      status[this.state.files.length + this.state.ind + 1] = (
        <span style={{ color: "#41bbf4" }}>uploading...</span>
      );
      this.setState({ status: status });
      data.append("file", this.state.add_file[0]);
    } else {
      data.append("number", 0);
    }

    fetchFileAsynchronous(
      PostView + this.props.post.pk + "/",
      "PATCH",
      data,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.handlePostUpdateAPICallback
    );
  };

  handlePostUpdateAPICallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.props.setMessage({
        message: response.message,
        type: 1
      });
      let status = [...this.state.status];
      status[status.indexOf("uploading..")] = "-";
      this.setState({ status: status, loading: false });
    } else {
      let length = this.state.add_file.length;
      if (
        length === 0 ||
        length === 1 ||
        this.state.ind + 1 === this.state.add_file.length - 1
      ) {
        this.handleModalClose();

        this.props.setPost(response);
        this.props.setMessage({
          message: "Successfully updated the post",
          type: 0
        });
      } else {
        this.setState(
          {
            loading: false,
            ind: this.state.ind + 1
          },
          () => this.PostUpdate(response.message)
        );
      }
    }
  };

  PostUpdate = pk => {
    let data = new FormData();
    data.append("file", this.state.add_file[this.state.ind + 1]);
    console.log(this.state.ind);
    console.log(this.state.add_file.length);
    console.log(this.state.add_file[this.state.ind + 1]);
    if (this.state.ind + 1 === this.state.add_file.length - 1) {
      data.append("number", 2);
    } else {
      data.append("number", 1);
    }

    let status = [...this.state.status];
    status[this.state.files.length + this.state.ind + 1] = (
      <span style={{ color: "#41bbf4" }}>uploading...</span>
    );
    if (this.state.ind > -1) {
      status[this.state.files.length + this.state.ind] = (
        <span style={{ color: "#42f49e" }}>Uploaded</span>
      );
    }
    this.setState({ status: status });

    fetchFileAsynchronous(
      PostView + pk + "/",
      "PATCH",
      data,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.handlePostUpdateAPICallback
    );
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
                <Grid>
                  <Grid.Row>
                    <Grid.Column computer={5} mobile={1} tablet={3} />
                    <Grid.Column
                      textAlign="center"
                      computer={6}
                      mobile={14}
                      tablet={10}
                    >
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
                              if (file.size <= 26214400) {
                                if (
                                  this.state.files.length +
                                    this.state.add_file.length <
                                  8
                                ) {
                                  let files = [...this.state.add_file];
                                  files.push(file);
                                  let status = [...this.state.status];
                                  status.push(
                                    <span style={{ textAlign: "center" }}>
                                      -
                                    </span>
                                  );
                                  this.setState({
                                    add_file: files,
                                    status: status
                                  });
                                } else {
                                  this.props.setMessage({
                                    message:
                                      "A post can have at a max of 8 files",
                                    type: 1
                                  });
                                }
                              } else {
                                this.props.setMessage({
                                  message: "Max file size is 25mb",
                                  type: 1
                                });
                              }
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
                        </label>

                        {this.state.add_file.length !== 0 ||
                        this.state.files.length !== 0 ? (
                          <Fragment>
                            <Table>
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>Remove</Table.HeaderCell>
                                  <Table.HeaderCell>File</Table.HeaderCell>
                                  <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {this.state.files.map((file, index) => (
                                  <Table.Row key={index}>
                                    <Table.Cell>
                                      <Icon
                                        name="minus circle"
                                        onClick={() => {
                                          let files = [...this.state.files];
                                          files.splice(index, 1);
                                          let remove_file = [
                                            ...this.state.remove_file
                                          ];
                                          let status = [...this.state.status];
                                          status.splice(index, 1);
                                          remove_file.push(file.pk);
                                          this.setState({
                                            files: files,
                                            remove_file: remove_file,
                                            status: status
                                          });
                                        }}
                                      />
                                    </Table.Cell>
                                    <Table.Cell>
                                      {file.name.split("/")[1].length >= 20
                                        ? file.name
                                            .split("/")[1]
                                            .substr(0, 19) + ".."
                                        : file.name.split("/")[1]}
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                      {this.state.status[index]}
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                                {this.state.add_file.map((file, index) => (
                                  <Table.Row key={index}>
                                    <Table.Cell>
                                      <Icon
                                        name="minus circle"
                                        onClick={() => {
                                          let files = [...this.state.add_file];
                                          files.splice(index, 1);
                                          let status = [...this.state.status];
                                          status.splice(
                                            this.state.files.length +
                                              this.state.add_file.length -
                                              1,
                                            1
                                          );
                                          this.setState({
                                            add_file: files,
                                            status: status
                                          });
                                        }}
                                      />
                                    </Table.Cell>
                                    <Table.Cell>
                                      {file.name.length >= 20
                                        ? file.name.substr(0, 19) + ".."
                                        : file.name}
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                      {
                                        this.state.status[
                                          this.state.files.length + index
                                        ]
                                      }
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table>
                          </Fragment>
                        ) : (
                          ""
                        )}
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

                    <Grid.Column computer={5} mobile={1} tablet={3} />
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
