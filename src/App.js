import React, { Component } from "react";
import "./App.css";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import { Login, Register, ForgotPassword, Logout } from "./components/Auth";
import Dashboard from "./components/dashboard";
import { Profile } from "./components/profile";
import NotFound from "./components/404";
// import InviteUser from "./components/invite";
import Home from "./components/home";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          {/* Rgistration Router */}
          <Route exact path="/signup" component={Register} />
          {/* Login Router */}
          <Route exact path="/login" component={Login} />
          {/* Forgot Password Send Verification */}
          <Route exact path="/forgotpassword" component={ForgotPassword} />
          {/* User Profile page */}
          <Route exact path="/profile" component={Profile} />
          {/* Logout the user */}
          <Route exact path="/logout" component={Logout} />
          {/* Home page */}
          {/* <Route exact path="/dashboard" component={Dashboard} /> */}
          {/* Invite User */}
          {/* <Route exact path="/team/invite/:link" component={InviteUser} /> */}
          {/* Home page */}
          <Route exact path="/home" component={Home} />
          {/* 404 Handler */}
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
