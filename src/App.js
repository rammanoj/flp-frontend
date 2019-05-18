import React, { Component } from "react";
import "./App.css";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import { Login, Register, ForgotPassword, Logout } from "./components/Auth";
import { Profile } from "./components/profile";
import NotFound from "./components/404";
import InviteUser from "./components/invite";
import Home from "./components/home";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          {/* The below route display login, for unAuthenticated user Orelse it display Home */}
          <Route exact path="/" component={Login} />
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
          {/* Invite User */}
          <Route exact path="/team/invite/:link" component={InviteUser} />
          {/* Home page */}
          <Route
            exact
            path="/home"
            render={props => {
              return <Home {...props} />;
            }}
          />
          {/* Post link */}
          <Route
            exact
            path="/group/:group/:subgroup/post/:post"
            component={Home}
          />
          {/* 404 Handler */}
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
