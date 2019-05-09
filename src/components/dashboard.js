// import React from "react";
// import { NavBar } from "./elements/nav";
// import {
//   withStyles,
//   CssBaseline,
//   TextField,
//   Grid,
//   CircularProgress,
//   Card,
//   CardMedia,
//   CardActionArea,
//   Typography,
//   Fade,
//   CardContent,
//   Modal,
//   Zoom,
//   Chip,
//   Paper,
//   Button,
//   Dialog,
//   DialogTitle,
//   Fab,
//   DialogContent,
//   MenuList,
//   MenuItem,
//   ListItemText,
//   ListItemIcon,
//   Tooltip,
//   Snackbar,
//   SnackbarContent,
//   DialogActions,
//   DialogContentText,
//   CardHeader,
//   Avatar
// } from "@material-ui/core";
// import AddIcon from "@material-ui/icons/Add";
// import SendIcon from "@material-ui/icons/Send";
// import Pagination from "material-ui-flat-pagination";
// import {
//   GroupListView,
//   GroupCreateView,
//   TeamAddRemoveUser,
//   TeamInviteUser,
//   TeamUserList,
//   TeamDeleteUser,
//   paginationCount
// } from "./../api";
// import { getCookie } from "./cookie";
// import { fetchAsynchronous } from "./controllers/fetch";
// import { DMenu as Menu } from "./elements/menu";
// import image from "./../img/logo.png";
// import formload from "./../img/formload.gif";
// import CustomScroll from "react-custom-scroll";
// import GroupPost from "./grouppost";

// const loader = (
//   <div style={{ textAlign: "center" }}>
//     <img src={formload} />
//     <span style={{ color: "#1e1f21" }}>
//       <b>loading..</b>
//     </span>
//   </div>
// );

// const loading = (
//   <div style={{ textAlign: "center", marginTop: "20vh" }}>
//     <CircularProgress thickness={4} size={40} />
//   </div>
// );

// const styles = theme => ({
//   fab: {
//     position: "fixed",
//     bottom: 20,
//     right: 20,
//     zIndex: 1
//   }
// });

// class Dashboard extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       isLoggedIn: getCookie("user")[1],
//       groups: [],
//       groupSelected: {},
//       loading: true,
//       open: false,
//       buttontext: "",
//       disabled: false,
//       openDialog: false,
//       response: { message: "", open: false, type: "" },
//       group: { name: "", about: "", operation: "" },
//       alert: {
//         header: "",
//         message: "",
//         operation: ""
//       }
//     };
//   }

//   handleSnack = (message, addtimeout) => {
//     this.setState({ response: message });
//     if (addtimeout === true) {
//       setTimeout(
//         () =>
//           this.setState({
//             response: { message: "", open: false, type: "" }
//           }),
//         6000
//       );
//     }
//   };

//   componentDidMount = () => {
//     // GET Groups
//     fetchAsynchronous(
//       GroupListView,
//       "GET",
//       undefined,
//       { Authorization: "Token " + getCookie("token")[0].value },
//       this.getGroupsCallback
//     );
//   };

//   getGroupsCallback = response => {
//     if (!response.hasOwnProperty("error")) {
//       this.setState({
//         loading: false,
//         groups: response.results
//       });
//     }
//   };

//   handleClose = () => {
//     this.setState({ open: false });
//   };

//   handleSnackClose = () => {
//     let response = this.state.response;
//   };

//   handleGroupClick = obj => {
//     this.setState({ groupSelected: obj });
//   };

//   displayModal = operation => {
//     if (operation === "update") {
//       this.setState({
//         group: {
//           name: this.state.groupSelected.name,
//           about: this.state.groupSelected.about,
//           operation: "update"
//         }
//       });
//     } else if (operation === "add") {
//       this.setState({
//         group: {
//           name: "",
//           about: "",
//           operation: "add"
//         }
//       });
//     }

//     this.setState({ open: true, buttontext: "Submit" });
//   };

//   GroupAPIRequest = () => {
//     let uri = GroupCreateView,
//       method = "POST",
//       data,
//       headers;
//     if (this.state.group.operation !== "Delete") {
//       data = {
//         name: this.state.group.name,
//         about: this.state.group.about
//       };
//       headers = {
//         Authorization: "Token " + getCookie("token")[0].value,
//         "Content-Type": "application/json"
//       };
//     } else {
//       method = "DELETE";
//       uri = GroupListView + this.state.groupSelected.pk + "/";
//       data = undefined;
//       headers = {
//         Authorization: "Token " + getCookie("token")[0].value
//       };
//       this.setState({
//         response: { message: "loading....", type: "", open: true }
//       });
//     }
//     if (this.state.group.operation === "update") {
//       uri = GroupListView + this.state.groupSelected.pk + "/";
//       method = "PATCH";
//     }
//     this.setState({ buttontext: loader, disabled: true });
//     fetchAsynchronous(uri, method, data, headers, this.handleGroupAPICallback);
//   };

//   handleGroupAPICallback = response => {
//     // Add a snackbar.
//     if (response.hasOwnProperty("error") && response.error === 1) {
//       let resp = Object.assign({}, this.state.response);
//       resp.message = response.message;
//       resp.type = "red";
//       resp.open = true;
//       this.setState({
//         response: resp,
//         buttontext: "Submit",
//         disabled: false
//       });
//     } else {
//       let group = {
//         name: "",
//         about: "",
//         operation: ""
//       };
//       let resp = {
//         message: "Successfully performed the action",
//         type: "#00dd33",
//         open: true
//       };
//       if (this.state.group.operation === "add") {
//         let groups = this.state.groups;
//         groups.unshift(response);

//         this.setState({
//           groups: groups,
//           buttontext: "submit",
//           disabled: false,
//           group: group,
//           open: false,
//           response: resp
//         });
//       } else if (this.state.group.operation === "update") {
//         let index = this.state.groups.indexOf(this.state.groupSelected);
//         let groups = this.state.groups;
//         groups[index] = response;
//         this.setState({
//           groupSelected: response,
//           groups: groups,
//           buttontext: "submit",
//           disabled: false,
//           group: group,
//           open: false,
//           response: resp
//         });
//       } else if (this.state.group.operation === "Delete") {
//         let index = this.state.groups.indexOf(this.state.groupSelected);
//         let groups = this.state.groups;
//         groups.splice(index, 1);
//         this.setState({
//           groups: groups,
//           groupSelected: {},
//           buttontext: "submit",
//           disabled: false,
//           open: false,
//           response: resp,
//           group: group
//         });
//       }
//     }

//     setTimeout(() => {
//       let resp = Object.assign({}, this.state.response);
//       resp.open = false;
//       resp.type = "";
//       resp.message = "";
//       this.setState({ response: resp });
//     }, 6000);
//   };

//   ExitGroup = () => {
//     let headers = {
//       Authorization: "Token " + getCookie("token")[0].value,
//       "Content-Type": "application/json"
//     };
//     let data = {
//       operation: "Remove",
//       team: this.state.groupSelected.pk
//     };
//     let response = {
//       message: "Loading...",
//       open: true,
//       type: ""
//     };
//     let alert = {
//       header: "",
//       message: "",
//       operation: ""
//     };
//     this.setState({ response: response, alert: alert });
//     fetchAsynchronous(
//       TeamAddRemoveUser,
//       "POST",
//       data,
//       headers,
//       this.ExitGroupCallback
//     );
//   };

//   ExitGroupCallback = response => {
//     console.log("came here for the response");
//     let resp = {
//       message: response.message,
//       open: true,
//       type: "red"
//     };
//     if (response.error === 0) {
//       resp.type = "#00dd33";
//       let index = this.state.groups.indexOf(this.state.groupSelected);
//       let groups = this.state.groups;
//       groups.splice(index, 1);
//       this.setState({ groups: groups });
//     }

//     this.setState({ response: resp });

//     setTimeout(() => {
//       let resp = Object.assign({}, this.state.response);
//       resp.open = false;
//       resp.type = "";
//       resp.message = "";
//       this.setState({ response: resp });
//     }, 6000);
//   };

//   render() {
//     if (!this.state.isLoggedIn) {
//       return <h1>Authentication needed to proceed</h1>;
//     }

//     let { classes } = this.props;
//     return (
//       <React.Fragment>
//         <CssBaseline />

//         <NavBar value={0} />

//         <Dialog
//           open={this.state.openDialog}
//           onClose={() => {
//             this.setState({ openDialog: false });
//           }}
//           aria-labelledby="alert"
//           aria-describedby="alert"
//         >
//           <DialogTitle id="alert">{this.state.alert.header}</DialogTitle>
//           <DialogContent>
//             <DialogContentText id="alert">
//               {this.state.alert.message}
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button
//               onClick={() => this.setState({ openDialog: false })}
//               color="primary"
//             >
//               Disagree
//             </Button>
//             <Button
//               onClick={() => {
//                 this.setState(
//                   {
//                     openDialog: false,
//                     group: {
//                       operation: this.state.alert.operation,
//                       name: "",
//                       about: ""
//                     }
//                   },
//                   () => {
//                     if (this.state.alert.operation === "Exit") {
//                       this.ExitGroup();
//                     } else {
//                       this.GroupAPIRequest();
//                     }
//                   }
//                 );
//               }}
//               color="primary"
//               autoFocus
//             >
//               Agree
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Snackbar
//           anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//           open={this.state.response.open}
//           onClose={this.handleSnackClose}
//         >
//           <SnackbarContent
//             style={{ background: this.state.response.type }}
//             message={<span>{this.state.response.message}</span>}
//           />
//         </Snackbar>
//         <Modal
//           aria-labelledby="Group"
//           aria-describedby="Group"
//           open={this.state.open}
//           onClose={this.handleClose}
//           disableAutoFocus={true}
//           style={{
//             marginLeft: "25vw",
//             marginRight: "25vw",
//             outline: "none",
//             marginTop: "20vh"
//           }}
//         >
//           <Paper>
//             <div style={{ textAlign: "center" }}>
//               <h3>Group</h3>
//             </div>
//             <Grid container spacing={24}>
//               <Grid item md={3} />
//               <Grid item md={6}>
//                 <TextField
//                   label="Group name"
//                   value={this.state.group.name}
//                   onChange={e => {
//                     let group = Object.assign({}, this.state.group);
//                     group.name = e.target.value;
//                     this.setState({ group: group });
//                   }}
//                   fullWidth
//                   variant="outlined"
//                 />
//               </Grid>
//               <Grid item md={3} />
//               <Grid item md={3} />
//               <Grid item md={6}>
//                 <TextField
//                   label="About the group"
//                   multiline
//                   rowsMax="4"
//                   fullWidth
//                   value={this.state.group.about}
//                   onChange={e => {
//                     let group = Object.assign({}, this.state.group);
//                     group.about = e.target.value;
//                     this.setState({ group: group });
//                   }}
//                   variant="outlined"
//                 />
//               </Grid>
//               <Grid item md={3} />
//             </Grid>
//             <div style={{ textAlign: "center" }}>
//               <Button
//                 onClick={this.GroupAPIRequest}
//                 variant="contained"
//                 color="primary"
//                 style={{ marginTop: 20, marginBottom: 20, width: "20vw" }}
//                 disabled={this.state.disabled}
//               >
//                 {this.state.buttontext}
//               </Button>
//             </div>
//           </Paper>
//         </Modal>
//         <Fab
//           color="primary"
//           aria-label="Add"
//           onClick={() => this.displayModal("add")}
//           className={classes.fab}
//         >
//           <Tooltip title="Add Group">
//             <AddIcon />
//           </Tooltip>
//         </Fab>
//         {this.state.loading ? (
//           loading
//         ) : (
//           <div style={{ marginTop: "calc(30px + 3vw)" }}>
//             <Grid container spacing={0}>
//               <Grid item md={3}>
//                 <div style={{ marginLeft: 20 }}>
//                   <p style={{ color: "#1e4789" }}>
//                     <b>Groups</b>
//                   </p>

//                   <Paper
//                     style={{
//                       width: "80%",
//                       overflowX: "auto",
//                       maxHeight: "25vh"
//                     }}
//                   >
//                     <MenuList>
//                       {this.state.groups.map((obj, index) => (
//                         <MenuItem
//                           key={index}
//                           style={
//                             this.state.groupSelected !== {} &&
//                             this.state.groupSelected.pk === obj.pk
//                               ? {
//                                   color: "white",
//                                   backgroundColor: "#4286f4",
//                                   paddingLeft: "5vw"
//                                 }
//                               : {
//                                   color: "black",
//                                   backgroundColor: "white",
//                                   paddingLeft: "5vw"
//                                 }
//                           }
//                           onClick={() => this.handleGroupClick(obj)}
//                         >
//                           {obj.name}
//                         </MenuItem>
//                       ))}
//                     </MenuList>
//                   </Paper>
//                   {this.state.groupSelected.hasOwnProperty("pk") ? (
//                     <Fade in={true}>
//                       <React.Fragment>
//                         <br />
//                         {this.state.groupSelected.edit ? (
//                           <React.Fragment>
//                             <Tooltip title="Update Group">
//                               <Button
//                                 color="primary"
//                                 onClick={() => this.displayModal("update")}
//                               >
//                                 Update
//                               </Button>
//                             </Tooltip>
//                             <Tooltip title="Delete Group">
//                               <Button
//                                 style={{ color: "red" }}
//                                 onClick={() => {
//                                   let header =
//                                     "Are you sure to perform this operaiton ?";
//                                   let message =
//                                     "This operation will delete all the users from the group. All the \
//                                   data regrading the posts will also be lost. The operation can not \
//                                   be inverted back";
//                                   this.setState({
//                                     openDialog: true,
//                                     alert: {
//                                       header: header,
//                                       message: message,
//                                       operation: "Delete"
//                                     }
//                                   });
//                                 }}
//                               >
//                                 Delete
//                               </Button>
//                             </Tooltip>
//                           </React.Fragment>
//                         ) : (
//                           <Tooltip title="Exit Group">
//                             <Button
//                               style={{ color: "red" }}
//                               onClick={() => {
//                                 let header =
//                                   "Are you sure to perform this operaiton ?";
//                                 let message =
//                                   "You will be exited from the group, you can no longer access the content shared \
//                                   in the group.";
//                                 this.setState({
//                                   openDialog: true,
//                                   alert: {
//                                     header: header,
//                                     message: message,
//                                     operation: "Exit"
//                                   }
//                                 });
//                               }}
//                             >
//                               Exit
//                             </Button>
//                           </Tooltip>
//                         )}
//                         <br />
//                         <p style={{ color: "#1e4789" }}>
//                           <b>Info:</b>
//                         </p>
//                         <Paper
//                           style={{
//                             maxHeight: "40vh",
//                             overflowX: "auto",
//                             marginRight: "5vw"
//                           }}
//                         >
//                           <div style={{ marginLeft: 10, marginBottom: 10 }}>
//                             <b>About:</b>
//                             <br />
//                             <div style={{ marginRight: "5vw" }}>
//                               {this.state.groupSelected.about}
//                             </div>
//                             <br />
//                             <b>Created by:</b>{" "}
//                             {this.state.groupSelected.created_by}
//                           </div>
//                         </Paper>
//                       </React.Fragment>
//                     </Fade>
//                   ) : (
//                     ""
//                   )}
//                 </div>
//               </Grid>
//               <Grid item md={6}>
//                 <GroupPost
//                   group={this.state.groupSelected}
//                   handleSnack={this.handleSnack}
//                 />
//               </Grid>
//               <Grid item md={3}>
//                 <PeopleComponent
//                   group={this.state.groupSelected}
//                   handleSnack={this.handleSnack}
//                 />
//               </Grid>
//             </Grid>
//           </div>
//         )}
//       </React.Fragment>
//     );
//   }
// }

// class PeopleComponent extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       isLoggedIn: getCookie("token")[1],
//       invite: "",
//       invitelist: [],
//       openinvite: false
//     };
//   }

//   InviteUsers = () => {
//     let data = {
//       team: this.props.group.pk,
//       email: this.state.invitelist
//     };
//     let headers = {
//       Authorization: "Token " + getCookie("token")[0].value,
//       "Content-Type": "application/json"
//     };
//     let resp = {
//       message: "Loading..",
//       open: true,
//       type: ""
//     };
//     this.setState({ openinvite: false });
//     this.props.handleSnack(resp);
//     fetchAsynchronous(
//       TeamInviteUser,
//       "POST",
//       data,
//       headers,
//       this.InviteUsersHandler
//     );
//   };

//   InviteUsersHandler = response => {
//     let resp = {
//       message: "Sucecessfully send Invite mails",
//       open: true,
//       type: "#00dd33"
//     };
//     if (response.error === 1) {
//       resp = {
//         message: response.message,
//         open: true,
//         type: "red"
//       };
//     } else {
//       this.setState({
//         invitelist: [],
//         invite: ""
//       });
//     }
//     this.props.handleSnack(resp, true);
//   };

//   render = () => {
//     if (!this.state.isLoggedIn) {
//       return <h1>Authentication Needed</h1>;
//     }

//     if (Object.entries(this.props.group).length === 0) {
//       return "";
//     }
//     return (
//       <Fade in={true}>
//         <React.Fragment>
//           <CssBaseline />

//           <Dialog
//             maxWidth="sm"
//             fullWidth={true}
//             open={this.state.openinvite}
//             onClose={() => {
//               this.setState({ openinvite: false });
//             }}
//             aria-labelledby="invite"
//             aria-describedby="invite"
//           >
//             <DialogTitle id="invite">Invite New Member to Team</DialogTitle>
//             <DialogContent>
//               {this.state.invitelist.map((obj, index) => (
//                 <Chip
//                   key={index}
//                   label={obj.length > 20 ? obj.substr(0, 20) + ".." : obj}
//                   onDelete={() => {
//                     let list = this.state.invitelist;
//                     list.splice(index, 1);
//                     this.setState({ invitelist: list });
//                   }}
//                   color="primary"
//                   variant="outlined"
//                 />
//               ))}

//               <br />
//               <br />
//               <TextField
//                 label="Emails of users"
//                 value={this.state.invite}
//                 helperText="Press Enter after entering each email, 20 people can be invited once (at a max)"
//                 onChange={e => {
//                   this.setState({ invite: e.target.value });
//                 }}
//                 onKeyPress={e => {
//                   if (e.key === "Enter") {
//                     let invite = this.state.invite;
//                     if (invite !== "") {
//                       let list = this.state.invitelist;
//                       if (list.length <= 20) {
//                         list.push(invite);
//                         invite = "";
//                         this.setState({ invite: "", invitelist: list });
//                       }
//                     }
//                   }
//                 }}
//                 fullWidth
//                 variant="outlined"
//               />
//             </DialogContent>

//             <DialogActions>
//               <Button onClick={this.InviteUsers} color="primary">
//                 Invite
//               </Button>
//             </DialogActions>
//           </Dialog>

//           <Card style={{ marginRight: 20, marginLeft: 20 }}>
//             <div style={{ textAlign: "center" }}>
//               <CardHeader subheader="Recent Activity" />
//             </div>
//             <CardContent>
//               some content related to the card is displayed here. some content
//               related to the card is displayed here. some content related to the
//               card is displayed here.
//             </CardContent>
//           </Card>

//           <div>
//             <br />
//             <Button
//               style={{
//                 marginLeft: "2vw",
//                 width: "87%",
//                 textAlign: "center"
//               }}
//               onClick={() => this.setState({ openinvite: true })}
//             >
//               Invite Team members
//             </Button>
//           </div>

//           <GroupUsers
//             group={this.props.group}
//             handleSnack={this.props.handleSnack}
//           />
//         </React.Fragment>
//       </Fade>
//     );
//   };
// }

// class GroupUsers extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       isLoggedIn: getCookie("token")[1],
//       loading: true,
//       error: false,
//       users: [],
//       obj: { username: "", email: "", pk: "" },
//       modal: false,
//       page: 1,
//       delete: false,
//       pagination: false,
//       offset: 0,
//       items: 0
//     };
//   }

//   componentDidMount = () => {
//     if (this.state.isLoggedIn) {
//       this.fetch();
//     }
//   };

//   fetch = () => {
//     this.setState({
//       loading: true
//     });
//     fetchAsynchronous(
//       TeamUserList + this.props.group.pk + "/?page=" + this.state.page,
//       "GET",
//       undefined,
//       {
//         Authorization: "Token " + getCookie("token")[0].value
//       },
//       this.callback
//     );
//   };

//   componentDidUpdate = prevProps => {
//     if (prevProps.group != this.props.group) {
//       this.setState({ loading: true, page: 1 });
//       this.fetch();
//     }
//   };

//   DeleteUsers = () => {
//     fetchAsynchronous(
//       TeamDeleteUser + this.props.group.pk + "/" + this.state.obj.pk + "/",
//       "DELETE",
//       undefined,
//       {
//         Authorization: "Token " + getCookie("token")[0].value
//       },
//       this.deleteUserCallback
//     );
//     let resp = {
//       message: "Loading...",
//       open: true,
//       type: ""
//     };
//     this.setState({ modal: false, delete: false });
//     this.props.handleSnack(resp, false);
//   };

//   deleteUserCallback = response => {
//     if (response.error === 1) {
//       this.props.handleSnack(
//         { message: response.message, open: true, type: "red" },
//         true
//       );
//     } else {
//       // Display the success message
//       this.props.handleSnack(
//         { message: response.message, open: true, type: "#32CD32" },
//         true
//       );
//       // Delete User from the list
//       let index = this.state.users.indexOf(this.state.obj);
//       let users = this.state.users;
//       users.splice(index, 1);
//       this.setState({
//         obj: {},
//         users: users
//       });
//     }
//   };

//   callback = response => {
//     if (response.hasOwnProperty("results")) {
//       this.setState({
//         users: response.results,
//         loading: false,
//         items: response.count,
//         pagination: response.results.length < response.count ? true : false
//       });
//     } else {
//       this.setState({
//         error: "Some error occured in fetching the details",
//         loading: false,
//         items: 0,
//         pagination: response.results.length < response.count ? true : false
//       });
//     }
//   };

//   handleClick = obj => {
//     let user = { username: obj.username, email: obj.email, pk: obj.pk };
//     this.setState({ obj: user }, () => {
//       this.setState({ modal: true });
//     });
//   };

//   handlePageClick = offset => {
//     this.setState({ offset: offset, page: Math.ceil(offset / 15) + 1 }, () =>
//       this.fetch()
//     );
//   };

//   render = () => {
//     let content;
//     if (!this.state.isLoggedIn) {
//       content = "No users";
//     } else {
//       content = (
//         <React.Fragment>
//           {this.state.loading ? (
//             <div style={{ textAlign: "center", marginTop: "4vh" }}>
//               <CircularProgress />
//             </div>
//           ) : this.state.error === true ? (
//             <div style={{ textAlign: "center", marginTop: "4vw" }}>
//               {this.state.error}
//             </div>
//           ) : (
//             <div>
//               <Grid spacing={8} container>
//                 {this.state.users.map((obj, index) => (
//                   <Grid
//                     item
//                     md={2}
//                     key={index}
//                     onClick={() => this.handleClick(obj)}
//                   >
//                     <Tooltip title={obj.username}>
//                       <div style={{ cursor: "pointer" }}>
//                         <div style={{ textAlign: "center" }}>
//                           <Avatar>{obj.username[0].toUpperCase()}</Avatar>
//                         </div>
//                         <span style={{ fontSize: 10 }}>
//                           {obj.username.length > 6
//                             ? obj.username.substr(0, 4) + ".."
//                             : obj.username}
//                         </span>
//                       </div>
//                     </Tooltip>
//                   </Grid>
//                 ))}
//               </Grid>
//             </div>
//           )}
//         </React.Fragment>
//       );
//     }

//     return (
//       <React.Fragment>
//         <Dialog
//           maxWidth="sm"
//           fullWidth={true}
//           open={this.state.modal}
//           onClose={() => {
//             this.setState({ modal: false });
//           }}
//           aria-labelledby="user"
//           aria-describedby="user"
//         >
//           <DialogTitle id="user">
//             Group Member {this.state.obj.username}
//           </DialogTitle>
//           <DialogContent>
//             email:{" "}
//             <Typography style={{ display: "inline" }} color="textSecondary">
//               {this.state.obj.email}
//             </Typography>
//           </DialogContent>

//           <DialogActions>
//             {this.props.group.edit ? (
//               <Button
//                 onClick={() => this.setState({ delete: true })}
//                 style={{ color: "red" }}
//               >
//                 Delete User from group
//               </Button>
//             ) : (
//               ""
//             )}
//             <Button
//               onClick={() => {
//                 this.setState({ modal: false });
//               }}
//               color="primary"
//             >
//               Cancel
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Dialog
//           maxWidth="sm"
//           fullWidth={true}
//           open={this.state.delete}
//           aria-labelledby="alert"
//           aria-describedby="alert"
//         >
//           <DialogTitle id="alert">
//             Are you sure to perform the action ?
//           </DialogTitle>
//           <DialogContent>
//             This action removes the specified user from the list of group
//             members. Are you sure to perform the action ?
//           </DialogContent>

//           <DialogActions>
//             <Button onClick={this.DeleteUsers} style={{ color: "red" }}>
//               Yes
//             </Button>
//             <Button
//               onClick={() => {
//                 this.setState({ delete: false });
//               }}
//               color="primary"
//             >
//               No
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Card
//           style={{
//             marginRight: 20,
//             marginLeft: 20,
//             marginTop: 10,
//             overflow: "auto",
//             maxHeight: "40vh",
//             padding: 10
//           }}
//         >
//           <div style={{ textAlign: "center" }}>
//             <CardHeader subheader="Team members" />
//             <div style={{ padding: 10 }}>{content}</div>
//           </div>

//           <br />
//           {this.state.pagination === true ? (
//             <div
//               style={{
//                 marginTop: 30,
//                 marginBottom: 20,

//                 textAlign: "center"
//               }}
//             >
//               <Pagination
//                 limit={paginationCount}
//                 offset={this.state.offset}
//                 total={this.state.items}
//                 onClick={(e, offset) => this.handlePageClick(offset)}
//               />
//             </div>
//           ) : (
//             <div>
//               <br />
//             </div>
//           )}
//         </Card>
//       </React.Fragment>
//     );
//   };
// }

// export default withStyles(styles)(Dashboard);
