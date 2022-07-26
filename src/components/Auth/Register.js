import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Grid, Form, Segment, Button, Header, Message, Icon } from "semantic-ui-react";
import md5 from 'md5';

import * as ROUTES from '../../constants/routes';
import api from '../../utils/api';
import { getUserInfo } from '../../utils/storage';
import { LOGIN } from '../../constants/routes';
import endpoints from '../../constants/api_endpoints';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false,
  };

  isFormEmpty = ({ username, email, password, passwordConfirmation}) => {
    return !username.length || !email.length || !password.length || !passwordConfirmation.length;
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: 'Fill in all fields!' };
      this.setState({ errors: errors.concat(error) });

      return false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: 'Password is invalid' };
      this.setState({ errors: errors.concat(error) });

      return false;
    } else {
      return true;
    }
  };

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true});

      api.post(endpoints.user.create, {
        name: this.state.username, 
        email: this.state.email, 
        password: this.state.password,
        profile_image: `http://gravatar.com/avatar/${md5(this.state.email)}?d=identicon`
      }).then(response => {
        this.setState({ loading: false });
        this.props.history.push(ROUTES.LOGIN);
      })
      .catch(err => {
        this.setState({
          errors: this.state.errors.concat(err),
          loading: false
        });
      });
    }
  };

  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.response.data.result}</p>)

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : '';
  };

  render() {
    const { username, email, password, passwordConfirmation, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange" />
            Register for DevChat
          </Header>

          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input fluid name="username" icon="user" iconPosition="left" value={username}
                  placeholder="Username" onChange={this.handleChange} type="text"
                  className={this.handleInputError(errors, 'username')} />

              <Form.Input fluid name="email" icon="mail" iconPosition="left" value={email}
                  placeholder="Email address" onChange={this.handleChange} type="email"
                  className={this.handleInputError(errors, 'email')} />

              <Form.Input fluid name="password" icon="lock" iconPosition="left" value={password}
                  placeholder="Passwod" onChange={this.handleChange} type="password"
                  className={this.handleInputError(errors, 'password')} />

              <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left" value={passwordConfirmation}
                  placeholder="Passwod Confirmation" onChange={this.handleChange} type="password"
                  className={this.handleInputError(errors, 'password')} />

              <Button disabled={loading} className={loading ? 'loading' : ''}
                  color="orange" fluid size="large">
                    Submit
                  </Button>
            </Segment>
          </Form>

          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}

          <Message>Already a user? <Link to={LOGIN}>Login</Link></Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Register;
