// import React from "react";
// import { getCookie } from "./cookie";
// import {
//   withStyles,
//   CircularProgress,
//   Typography,
//   Grid,
//   TextField,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogActions,
//   Card,
//   CardHeader,
//   Avatar,
//   CardContent,
//   Zoom
// } from "@material-ui/core";
// import { DMenu as Menu } from "./elements/menu";
// import { fetchFileAsynchronous, fetchAsynchronous } from "./controllers/fetch";
// import {
//   PostCreateView,
//   PostListView,
//   PostView,
//   paginationCount,
//   imageFormats,
//   acceptedTypes,
//   months
// } from "./../api";
// import formload from "./../img/formload.gif";

// const loader = (
//   <div style={{ textAlign: "center" }}>
//     <img src={formload} />
//   </div>
// );

// const style = theme => ({
//   input: {
//     width: "70%",
//     padding: 5
//   },
//   avatar: {
//     backgroundColor: "rgb(66, 134, 244)"
//   }
// });

// class GroupPost extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       isLoggedIn: getCookie("token")[1],
//       loading: true,
//       group: this.props.group,
//       page: 1,
//       posts: [],
//       postSelected: {},
//       modal: false,
//       search: "",
//       buttontext: "",
//       disabled: false,
//       post: {
//         header: "",
//         about: "",
//         file: ""
//       },
//       pagination: false,
//       operation: "",
//       emptyResult: false
//     };
//   }

//   componentDidUpdate = prevprops => {
//     if (this.props.group != prevprops.group) {
//       this.setState({ group: this.props.group, loading: true }, () =>
//         this.fetch()
//       );
//     }
//   };

//   handleSelect = () => {
//     document.getElementById("fileopen").click();
//   };

//   fetch = () => {
//     fetchAsynchronous(
//       PostListView + this.state.group.pk + "/?page=" + this.state.page,
//       "GET",
//       undefined,
//       { Authorization: "Token " + getCookie("token")[0].value },
//       this.callback
//     );
//   };

//   callback = response => {
//     if (response.hasOwnProperty("results")) {
//       if (response.results.length === 0) {
//         this.setState({ loading: false, posts: [], emptyResult: true });
//       } else {
//         this.setState({ loading: false, posts: response.results });
//       }
//     } else {
//       this.setState({ loading: false, emptyResult: true });
//     }
//   };

//   makePost = () => {
//     let data = new FormData();
//     data.append("team", this.state.group.pk);
//     data.append("header", this.state.post.header);
//     data.append("about", this.state.post.about);
//     data.append("file", this.state.post.file);

//     this.setState({ disabled: true, buttontext: loader });
//     fetchFileAsynchronous(
//       PostCreateView,
//       "POST",
//       data,
//       { Authorization: "Token " + getCookie("token")[0].value },
//       this.makePostCallback
//     );
//   };

//   makePostCallback = response => {
//     let snackbar;
//     if (response.error === 1) {
//       this.setState({ disabled: false, buttontext: "post" });
//       snackbar = {
//         message: response.message,
//         type: "red",
//         open: true
//       };
//     } else {
//       let posts = this.state.posts;
//       posts.unshift(response);
//       this.setState({ disabled: false, buttontext: "", modal: false });
//       snackbar = {
//         message: "Successfully posted in the group",
//         type: "#41f471",
//         open: true,
//         posts: posts
//       };
//     }
//     this.props.handleSnack(snackbar, true);
//   };

//   formatTime = date => {
//     date = new Date(date);
//     return (
//       date.getHours() +
//       ":" +
//       date.getMinutes() +
//       " " +
//       months[date.getMonth()] +
//       ", " +
//       date.getFullYear()
//     );
//   };

//   HandleMenuClick = (key, value) => {
//     if (key === "Update") {
//       let obj = this.state.posts[value];
//       this.setState({
//         postSelected: obj,
//         modal: true,
//         post: { header: obj.header, about: obj.about, file: "" }
//       });
//     } else if (key === "Delete") {
//     }
//   };

//   render = () => {
//     let { classes } = this.props;
//     if (!this.state.isLoggedIn) {
//       return "";
//     }

//     return (
//       <React.Fragment>
//         {Object.entries(this.state.group).length === 0 ? (
//           <React.Fragment>
//             <div style={{ marginTop: "10vh", textAlign: "center" }}>
//               <Typography variant="h5">
//                 Select the group to display the posts.
//               </Typography>
//             </div>
//           </React.Fragment>
//         ) : (
//           <React.Fragment>
//             {this.state.loading ? (
//               <div style={{ textAlign: "center", marginTop: "20vh" }}>
//                 <CircularProgress />
//               </div>
//             ) : (
//               <React.Fragment>
//                 <Dialog
//                   maxWidth="sm"
//                   fullWidth={true}
//                   open={this.state.modal}
//                   aria-labelledby="post"
//                   aria-describedby="post"
//                 >
//                   <DialogTitle id="post">Post New Stuff</DialogTitle>

//                   <div style={{ textAlign: "center" }}>
//                     <TextField
//                       label="Header"
//                       style={{}}
//                       value={this.state.post.header}
//                       onChange={e => {
//                         let post = this.state.post;
//                         post.header = e.target.value;
//                         this.setState({ post: post });
//                       }}
//                       variant="outlined"
//                     />
//                   </div>
//                   <br />
//                   <div style={{ textAlign: "center" }}>
//                     <TextField
//                       style={{ width: "60%", overflowX: "hidden" }}
//                       label="Anything about the post"
//                       multiline
//                       rowsMax="4"
//                       value={this.state.post.about}
//                       onChange={e => {
//                         let post = this.state.post;
//                         post.about = e.target.value;
//                         this.setState({ post: post });
//                       }}
//                       margin="normal"
//                       variant="outlined"
//                     />
//                   </div>
//                   <div style={{ textAlign: "center" }}>
//                     <input
//                       style={{ display: "none" }}
//                       id="postfile"
//                       type="file"
//                       onChange={e => {
//                         let post = Object.assign({}, this.state.post);
//                         post.file = e.target.files[0];
//                         let type = post.file.type.split("/")[0];
//                         if (
//                           acceptedTypes.indexOf(post.file.type) > -1 ||
//                           type === "image"
//                         ) {
//                           this.setState({ post: post });
//                         } else {
//                           let accept = {
//                             message: "Only image, pdf, zip files are accepted",
//                             type: "red",
//                             open: true
//                           };
//                           this.props.handleSnack(accept, true);
//                         }
//                       }}
//                     />
//                     <label htmlFor="postfile">
//                       <Button component="span" style={{ color: "#4286f4" }}>
//                         Add image / file
//                       </Button>
//                       {this.state.post.file != "" &&
//                       this.state.post.file.name.length >= 20
//                         ? this.state.post.file.name.substr(0, 19) + ".."
//                         : this.state.post.file.name}
//                     </label>
//                   </div>

//                   <DialogActions>
//                     <Button
//                       onClick={this.makePost}
//                       style={{ color: "#4286f4" }}
//                       disabled={this.state.disabled}
//                     >
//                       {this.state.buttontext}
//                     </Button>
//                     <Button
//                       onClick={() => {
//                         this.setState({ modal: false });
//                       }}
//                       style={{ color: "red" }}
//                     >
//                       Cancel
//                     </Button>
//                   </DialogActions>
//                 </Dialog>
//                 <Grid container spacing={16}>
//                   <Grid item md={8}>
//                     <Button
//                       style={{
//                         width: "100%",
//                         color: "#4286f4",
//                         marginTop: "2vh",
//                         borderColor: "#4286f4"
//                       }}
//                       variant="outlined"
//                       onClick={() =>
//                         this.setState({ modal: true, buttontext: "Post" })
//                       }
//                     >
//                       Add a New Post ?
//                     </Button>
//                   </Grid>
//                   <Grid item md={4}>
//                     <TextField
//                       name="search"
//                       value={this.state.search}
//                       label="Search by post"
//                       onChange={e => {
//                         this.setState({ search: e.target.value });
//                       }}
//                       onKeyPress={() => this.searchKeyPress}
//                     />
//                   </Grid>
//                 </Grid>
//                 <div style={{ marginTop: "4vh" }} />
//                 <Grid container spacing={0}>
//                   {this.state.emptyResult ? (
//                     <Typography>No posts currently</Typography>
//                   ) : (
//                     <React.Fragment>
//                       {this.state.posts.map((obj, index) => (
//                         <React.Fragment key={index}>
//                           <Grid item md={2} />
//                           <Grid item md={8}>
//                             <Zoom in={true} timeout={1000}>
//                               <Card>
//                                 <CardHeader
//                                   avatar={
//                                     <Avatar className={classes.avatar}>
//                                       {obj.header[0].toUpperCase()}
//                                     </Avatar>
//                                   }
//                                   action={
//                                     obj.edit ? (
//                                       <Menu
//                                         label={"posts"}
//                                         body={["Update", "Delete"]}
//                                         id={index}
//                                         HandleMenuClick={this.HandleMenuClick}
//                                         iconType="more"
//                                       />
//                                     ) : (
//                                       ""
//                                     )
//                                   }
//                                   title={
//                                     obj.header.length > 25
//                                       ? obj.header.substr(0, 23) + ".."
//                                       : obj.header
//                                   }
//                                   subheader={this.formatTime(obj.created_on)}
//                                 />

//                                 <CardContent>
//                                   {imageFormats.indexOf(
//                                     obj.file
//                                       .split("/")
//                                       [obj.file.split("/").length - 1].split(
//                                         "."
//                                       )[1]
//                                   ) > -1 ? (
//                                     <React.Fragment>
//                                       <img
//                                         src={obj.file}
//                                         alt={obj.header + " image"}
//                                         style={{
//                                           width: "100%",
//                                           height: "300px"
//                                         }}
//                                       />
//                                       <br />
//                                       <a
//                                         href={obj.file}
//                                         download={
//                                           obj.file.split("/")[
//                                             obj.file.split("/").length - 1
//                                           ]
//                                         }
//                                         style={{
//                                           textDecoration: "none",
//                                           color: "#4286f4",
//                                           float: "right"
//                                         }}
//                                       >
//                                         Download Image
//                                       </a>
//                                       <br />
//                                     </React.Fragment>
//                                   ) : (
//                                     <React.Fragment>
//                                       <Typography variant="subheading">
//                                         The contents of the file can not be
//                                         displayed.
//                                         <a
//                                           href={obj.file}
//                                           style={{
//                                             textDecoration: "none",
//                                             color: "#4286f4"
//                                           }}
//                                           download
//                                         >
//                                           Download file
//                                         </a>
//                                       </Typography>
//                                       <br />
//                                     </React.Fragment>
//                                   )}
//                                   <Typography component="p">
//                                     {obj.about}
//                                   </Typography>
//                                 </CardContent>
//                               </Card>
//                             </Zoom>
//                             <br />
//                           </Grid>
//                           <Grid item md={2} />
//                         </React.Fragment>
//                       ))}
//                     </React.Fragment>
//                   )}
//                 </Grid>
//               </React.Fragment>
//             )}
//           </React.Fragment>
//         )}
//       </React.Fragment>
//     );
//   };
// }

// export default withStyles(style)(GroupPost);
