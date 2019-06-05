import React from "react";
import {
  Icon,
  Loader,
  Button,
  Transition,
  Modal,
  Card,
  Grid,
  Image
} from "semantic-ui-react";
import { imageFormats, months } from "./../api";
import { CommentPagination } from "./allcomments";
import { Scrollbars } from "react-custom-scrollbars";

export default class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      loading: false,
      modalvisible: false,
      loadingmodal: false
    };
  }

  getType = ind => {
    console.log(this.props.items);
    console.log(ind);
    let obj = this.props.items[ind];
    if (
      imageFormats.indexOf(
        obj.file.split("/")[obj.file.split("/").length - 1].split(".")[1]
      ) > -1
    ) {
      return true;
    } else {
      return false;
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

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.items !== prevProps.items) {
      this.setState({ index: 0 });
    }
  };

  getName = fullname => {
    let name = fullname.split("/")[1];
    if (name.length > 20) {
      name = name.slice(0, 17) + "..";
    }
    return name;
  };

  render = () => {
    return (
      <div
        style={{
          width: "100%",
          minHeight: 100,
          background: "#f4f8ff",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Transition
          duration={400}
          visible={this.state.modalvisible}
          animation="scale"
        >
          <div>
            <div className="cross_icon_slider">
              <Icon
                name="remove"
                onClick={() => this.setState({ modalvisible: false })}
              />
            </div>
            <Modal open={this.state.modalvisible} basic size="fullscreen">
              <Modal.Content>
                <Grid style={{ minHeight: "90vh" }}>
                  <Grid.Row>
                    <Grid.Column width={2} style={{ padding: 0 }} />
                    <Grid.Column width={9} style={{ padding: 0 }}>
                      <div
                        style={{
                          background: "#000",
                          width: "100%",
                          height: "100%"
                        }}
                      >
                        <div className="modal_header">
                          <h3>{this.props.post.header}</h3>
                        </div>

                        {this.state.loadingmodal ? (
                          <Loader
                            active={this.state.loadingmodal}
                            state={{
                              position: "absolute",
                              left: "50%",
                              top: "50%"
                            }}
                          />
                        ) : (
                          ""
                        )}

                        <Icon
                          name="angle left"
                          size="big"
                          className="left_arrow_modal"
                          onClick={() => {
                            if (this.props.items.length !== 1) {
                              if (this.state.index > 0) {
                                this.setState({
                                  index: this.state.index - 1,
                                  loadingmodal: this.getType(
                                    this.state.index - 1
                                  )
                                });
                              } else {
                                this.setState({
                                  index: this.props.items.length - 1,
                                  loadingmodal: this.getType(
                                    this.props.items.length - 1
                                  )
                                });
                              }
                            }
                          }}
                        />

                        <Icon
                          name="angle right"
                          size="big"
                          className="right_arrow_modal"
                          onClick={() => {
                            if (this.props.items.length !== 1) {
                              if (
                                this.state.index <
                                this.props.items.length - 1
                              ) {
                                this.setState({
                                  index: this.state.index + 1,
                                  loadingmodal: this.getType(
                                    this.state.index + 1
                                  )
                                });
                              } else {
                                this.setState({
                                  index: 0,
                                  loadingmodal: this.getType(0)
                                });
                              }
                            }
                          }}
                        />
                        {this.getType(this.state.index) ? (
                          <div
                            style={{
                              textAlign: "center",
                              height: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center"
                            }}
                          >
                            <img
                              src={this.props.items[this.state.index].file}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100%"
                              }}
                              onLoad={() => {
                                console.log("loaded the image onclick");
                                this.setState({ loadingmodal: false });
                              }}
                              onError={() =>
                                this.setState({ loadingmodal: false })
                              }
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              justifyContent: "center",
                              flexDirection: "column",
                              textAlign: "center"
                            }}
                          >
                            <b>
                              The contents of the file{" "}
                              <span style={{ color: "blue" }}>
                                {this.getName(
                                  this.props.items[this.state.index].name
                                )}
                              </span>{" "}
                              can not displayed
                            </b>{" "}
                            <br />
                            <br />
                            <br />
                            <a
                              href={this.props.items[this.state.index].file}
                              download
                              target="_blank"
                            >
                              <Button>download</Button>
                            </a>
                          </div>
                        )}
                      </div>
                    </Grid.Column>
                    <Grid.Column
                      width={5}
                      style={{ padding: 0, width: "100%" }}
                    >
                      <Card
                        style={{ color: "#000", height: "100%", width: "100%" }}
                      >
                        <Card.Header>
                          <table style={{ marginLeft: 20 }}>
                            <tbody>
                              <tr style={{ padding: 0 }}>
                                <td rowSpan={4} style={{ padding: 0 }}>
                                  {this.props.post.created_by_pic !== "" ? (
                                    <Image
                                      style={{ height: 55, width: 55 }}
                                      circular
                                      src={this.props.post.created_by_pic}
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
                                    <a href="#">{this.props.post.created_by}</a>
                                  </div>
                                </td>
                                <td />
                              </tr>
                              <tr>
                                <td style={{ paddingLeft: 0 }}>
                                  <Card.Meta>
                                    <p>
                                      {this.formatTime(
                                        this.props.post.created_on
                                      )}
                                    </p>
                                  </Card.Meta>
                                </td>
                              </tr>
                              <tr>
                                <td />
                              </tr>
                            </tbody>
                          </table>
                        </Card.Header>
                        <Card.Content>
                          <Scrollbars
                            autoHide
                            autoHideTimeout={1000}
                            autoHeight
                            autoHeightMax={"70vh"}
                          >
                            <CommentPagination
                              post={
                                this.props.items.length === 1
                                  ? this.props.post
                                  : this.props.items[this.state.index]
                              }
                              setPost={() => {}}
                              setMessage={this.props.setMessage}
                              post_type={this.props.items.length === 1 ? 0 : 1}
                            />
                          </Scrollbars>
                        </Card.Content>
                      </Card>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Modal.Content>
            </Modal>
          </div>
        </Transition>
        <div className="slider_index">
          {this.state.index + 1} of {this.props.items.length}
        </div>

        <Icon
          name="angle double left"
          className="left_arrow"
          onClick={() => {
            if (this.props.items.length !== 1) {
              if (this.state.index > 0) {
                this.setState({
                  index: this.state.index - 1,
                  loading: this.getType(this.state.index - 1)
                });
              } else {
                this.setState({
                  index: this.props.items.length - 1,
                  loading: this.getType(this.props.items.length - 1)
                });
              }
            }
          }}
        />

        <Icon
          name="angle double right"
          className="right_arrow"
          onClick={() => {
            if (this.props.items.length !== 1) {
              if (this.state.index < this.props.items.length - 1) {
                this.setState({
                  index: this.state.index + 1,
                  loading: this.getType(this.state.index + 1)
                });
              } else {
                this.setState({ index: 0, loading: this.getType(0) });
              }
            }
          }}
        />

        <Loader
          active={this.state.loading}
          state={{ position: "absolute", left: "50%", top: "50%" }}
        />
        {this.getType(this.state.index) ? (
          <div style={{ textAlign: "center" }}>
            <img
              onClick={() =>
                this.setState({ modalvisible: true, loadingmodal: true })
              }
              src={this.props.items[this.state.index].file}
              style={{ maxWidth: "100%", cursor: "pointer" }}
              onLoad={() => this.setState({ loading: false })}
              onError={() => this.setState({ loading: false })}
            />
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              marginTop: 30,
              marginBottom: 30,
              textAlign: "center"
            }}
          >
            <div
              className="slider_more"
              onClick={() =>
                this.setState({ modalvisible: true, loadingmodal: true })
              }
            >
              More
            </div>
            <b>
              The contents of the file{" "}
              <span style={{ color: "blue" }}>
                {this.getName(this.props.items[this.state.index].name)}
              </span>{" "}
              can not displayed
            </b>{" "}
            <br />
            <br />
            <a
              href={this.props.items[this.state.index].file}
              download
              target="_blank"
            >
              <Button>download</Button>
            </a>
          </div>
        )}
      </div>
    );
  };
}
