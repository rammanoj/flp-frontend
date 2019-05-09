import React from "react";
import { Input } from "./input";
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  withStyles
} from "@material-ui/core/";

const Style = () => ({
  button: {
    fontFamily: "Courier",
    fontSize: "15px",
    width: "calc(40px + 15vw)",
    backgroundColor: "#1e1f21",
    color: "white",
    "&:hover": {
      color: "white",
      backgroundColor: "#1e1f21"
    }
  }
});

class UFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  addInputs = () => {
    let { props: p } = this,
      inputs = [];
    for (let i in p.inputs) {
      if (p.inputs[i].type === "select") {
        let options = [];
        for (let j in p.inputs[i].options) {
          options.push(<option key={j}>{p.inputs[i].options[j]}</option>);
        }
        inputs.push(
          <li key={i}>
            <label htmlFor={p.inputs[i].id} className={p.inputs[i].labelClass}>
              {p.inputs[i].labels}
            </label>
            <Input
              onChange={p.inputs[i].handle}
              id={p.inputs[i].id}
              as="select"
              name={p.inputs[i].name}
            >
              {options}
            </Input>
          </li>
        );
      } else if (p.inputs[i].type === "checkbox") {
        inputs.push(
          <li key={i}>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={p.inputs[i].handle}
                  color="primary"
                  checked={p.inputs[i].value}
                  name={p.inputs[i].name}
                  id={p.inputs[i].name}
                />
              }
              label={p.inputs[i].labels}
            />
          </li>
        );
      } else {
        inputs.push(
          <li key={i}>
            <TextField
              id={p.inputs[i].name}
              label={p.inputs[i].labels}
              className=""
              onChange={p.inputs[i].handle}
              value={p.inputs[i].value}
              name={p.inputs[i].name}
              helperText={p.validators[i]}
              fullWidth
              type={p.inputs[i].type}
            />
          </li>
        );
      }
    }
    return inputs;
  };

  render = () => {
    let { classes } = this.props;
    let inputs = this.addInputs(),
      button;
    if (this.props.disabled === true) {
      button = (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled
          onClick={this.props.onClick}
          className={classes.button}
        >
          {this.props.button}
        </Button>
      );
    } else {
      button = (
        <Button
          type="submit"
          variant="contained"
          onClick={this.props.onClick}
          className={classes.button}
        >
          {this.props.button}
        </Button>
      );
    }

    button = <div style={{ textAlign: "center" }}>{button}</div>;
    return (
      <div>
        <div
          style={{
            color: this.props.messageClass,
            paddingBottom: 1,
            paddingLeft: 60,
            fontStyle: "bold"
          }}
        >
          <p>{this.props.message !== "" ? this.props.message : ""}</p>
        </div>
        <form className={this.props.formClass}>
          <ul>
            {inputs}
            <li>{button}</li>
          </ul>
        </form>
      </div>
    );
  };
}

const UForm = withStyles(Style)(UFormComponent);
export { UForm };
