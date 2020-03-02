import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Tabs,
  Tab
} from '@material-ui/core';

import {
  GET_FEES,
  FEES_UPDATED
} from '../../constants'

import Swap from "../swap";
import ErrorSnackbar from '../errorSnackbar';
import CreateAccount from '../createAccount';

import Store from "../../stores";
const dispatcher = Store.dispatcher;
const emitter = Store.emitter;
const store = Store.store;

const styles = theme => ({
  root: {
    minHeight: '450px'
  },
  tabs: {
    marginTop: '24px',
    marginBottom: '24px'
  }
});

class Controller extends Component {
  state = {
    tabValue: 0,
    issueOpen: false,
    createOpen: false,
    error: '',
    errorOpen: false
  };

  // componentWillMount() {
  //   emitter.on(FEES_UPDATED, this.feesUpdated);
  //   dispatcher.dispatch({type: GET_FEES, content: {} })
  // };
  //
  // componentWillUnmount() {
  //   emitter.removeListener(FEES_UPDATED, this.feesUpdated);
  // };

  // feesUpdated = () => {
  //   const fees = store.getStore('fees');
  //
  //   let issueFee = fees.filter((fee) => {
  //     return fee.msg_type === 'issueMsg'
  //   }).map((fee) => {
  //     return fee.fee/100000000
  //   })[0];
  //
  //   this.setState({
  //     fees,
  //     issueFee: issueFee
  //   })
  // };

  handleChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  onCreateAccount = (event) => {
    this.setState({ createOpen: true })
  };

  onCreateAccountBack = (event) => {
    this.setState({ createOpen: false })
  };

  render() {
    const { classes } = this.props;
    const {
      issueOpen,
      createOpen,
      errorOpen
    } = this.state;

    return (
      <div className={ classes.root }>
        { (!issueOpen && !createOpen) && this.renderTabs() }
        { issueOpen && this.renderIssue() }
        { createOpen && this.renderCreateAccount() }
        { errorOpen && this.renderError() }
      </div>
    )
  };

  renderError = () => {
    return (
      <ErrorSnackbar error={ this.state.error } handleClose={ this.handleErrorClose } open={ this.state.errorOpen }  />
    )
  };

  handleErrorClose = () => {
    this.setState({ errorOpen: false, error: null })
  };

  showError = (error) => {
    this.setState({ errorOpen: true, error: error })
  };

  renderCreateAccount = () => {
    return(
      <CreateAccount onBack={ this.onCreateAccountBack }  showError={ this.showError } />
    )
  };

  renderTabs = () => {
    const { classes } = this.props;
    const {
      tabValue
    } = this.state;

    return (
      <React.Fragment>
        <Tabs value={tabValue} onChange={this.handleChange} className={ classes.tabs } variant="fullWidth" indicatorColor="primary" textColor="inherit">
          <Tab label="Swap" />
        </Tabs>
        {tabValue === 0 && <Swap onIssue={ this.onIssue } showError={ this.showError } onCreateAccount={ this.onCreateAccount } />}
      </React.Fragment>
    )
  };
}

Controller.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Controller);
