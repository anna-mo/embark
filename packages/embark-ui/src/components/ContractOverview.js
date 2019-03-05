import PropTypes from "prop-types";
import React, {Component} from 'react';
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardFooter,
  Collapse,
  ListGroup,
  ListGroupItem
} from "reactstrap";
import GasStationContainer from "../containers/GasStationContainer";
import {formatContractForDisplay} from '../utils/presentation';
import FontAwesome from 'react-fontawesome';
import classnames from 'classnames';

import "./ContractOverview.css";

class ContractFunction extends Component {
  constructor(props) {
    super(props);
    this.state = {inputs: {}, optionsCollapse: false, functionCollapse: false, gasPriceCollapse: false};
  }

  static isPureCall(method) {
    return (method.mutability === 'view' || method.mutability === 'pure');
  }

  static isEvent(method) {
    return !this.isPureCall(method) && (method.type === 'event');
  }

  buttonTitle() {
    const {method} = this.props;
    if (method.name === 'constructor') {
      return 'Deploy';
    }

    return ContractFunction.isPureCall(method) ? 'call' : 'send';
  }

  inputsAsArray() {
    return this.props.method.inputs
      .map(input => this.state.inputs[input.name])
      .filter(value => value);
  }

  handleChange(e, name) {
    const newInputs = this.state.inputs;
    newInputs[name] = e.target.value;
    this.setState({inputs: newInputs});
  }

  autoSetGasPrice(e) {
    e.preventDefault();
    const newInputs = this.state.inputs;
    const currentPrice = this.gasStation.getCurrentGas();
    newInputs.gasPrice = currentPrice >= 0 ? currentPrice : 'Estimate unavailable';
    this.setState({inputs: newInputs});
  }

  handleCall(e) {
    if (e) e.preventDefault();
    this.props.postContractFunction(this.props.contractProfile.name, this.props.method.name, this.inputsAsArray(), this.state.inputs.gasPrice * 1000000000);
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !this.callDisabled()) this.handleCall();
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  callDisabled() {
    return this.inputsAsArray().length !== this.props.method.inputs.length;
  }

  toggleOptions() {
    this.setState({
      optionsCollapse: !this.state.optionsCollapse
    });
  }

  toggleGasPrice() {
    this.setState({
      gasPriceCollapse: !this.state.gasPriceCollapse
    });
  }

  toggleFunction() {
    if (!ContractFunction.isEvent(this.props.method)) {
      this.setState({
        functionCollapse: !this.state.functionCollapse
      });
    }
  }

  makeBadge(color, text) {
    const names = {
      'badge-dark': this.state.functionCollapse,
      'float-right': true,
      'p-2': true
    };
    names[`badge-${color}`] = !this.state.functionCollapse;
    return (
      <Badge color={color} className={classnames(names)}>{text}</Badge>
    );
  }

  render() {
    return (
      <Card className="contract-function-container">
        <CardHeader
          className={classnames({
            collapsable: !ContractFunction.isEvent(this.props.method),
            'border-bottom-0': !this.state.functionCollapse,
            'rounded': !this.state.functionCollapse
          })}
          onClick={() => this.toggleFunction()}>
          <CardTitle>
            {ContractFunction.isPureCall(this.props.method) &&
             this.makeBadge('success', 'call')
            }
            {!(ContractFunction.isPureCall(this.props.method) ||
               ContractFunction.isEvent(this.props.method)) &&
             this.makeBadge('warning', 'send')
            }
            {ContractFunction.isEvent(this.props.method) &&
             this.makeBadge('light', 'event')
            }
            {`${this.props.method.name}` +
             `(${this.props.method.inputs.map(i => i.name).join(', ')})`}
          </CardTitle>
        </CardHeader>
        {!ContractFunction.isEvent(this.props.method) &&
        <Collapse isOpen={this.state.functionCollapse} className="relative">
          <CardBody>
            <Form inline onSubmit={(e) => this.handleSubmit(e)}>
              {this.props.method.inputs.map(input => (
                <FormGroup key={input.name}>
                  <Label for={input.name} className="mr-2 font-weight-bold">{input.name}</Label>
                  <Input name={input.name} id={input.name} placeholder={input.type}
                         onChange={(e) => this.handleChange(e, input.name)}
                         onKeyPress={(e) => this.handleKeyPress(e)}/>
                </FormGroup>
              ))}
            </Form>
            {!ContractFunction.isPureCall(this.props.method) &&
            <Col xs={12} className="mt-3">
              <Row>
                <strong className="collapsable" onClick={() => this.toggleOptions()}>
                  <FontAwesome name={this.state.optionsCollapse ? 'caret-down' : 'caret-right'} className="mr-2"/>
                  Advanced Options
                </strong>
              </Row>
              <Row>
                <Collapse isOpen={this.state.optionsCollapse} className="pl-3">
                  <Form inline className="gas-price-form" onSubmit={(e) => this.handleSubmit(e)}>
                    <FormGroup key="gasPrice">
                      <Label for="gasPrice" className="mr-2">Gas Price (in GWei)(optional)</Label>
                      <Input name="gasPrice" id="gasPrice" placeholder="uint256"
                             value={this.state.inputs.gasPrice || ''}
                             onChange={(e) => this.handleChange(e, 'gasPrice')}
                             onKeyPress={(e) => this.handleKeyPress(e)}/>
                      <Button onClick={(e) => this.autoSetGasPrice(e)}
                              title="Automatically set the gas price to what is currently in the estimator (default: safe low)">
                        Auto-set
                      </Button>
                    </FormGroup>
                  </Form>
                  <p className="collapsable mb-2" onClick={() => this.toggleGasPrice()}>
                    <FontAwesome name={this.state.gasPriceCollapse ? 'caret-down' : 'caret-right'} className="mr-2"/>
                    Gas price estimator
                  </p>
                  <Collapse isOpen={this.state.gasPriceCollapse}>
                    <GasStationContainer ref={instance => {
                      if (instance) this.gasStation = instance.getWrappedInstance();
                    }}/>
                  </Collapse>
                </Collapse>
              </Row>
            </Col>
            }
            <Button className="btn-sm contract-function-button float-right" color="primary" disabled={this.callDisabled()}
                    onClick={(e) => this.handleCall(e)}>
              {this.buttonTitle()}
            </Button>
            <div className="clearfix"/>
          </CardBody>
          {this.props.contractFunctions && this.props.contractFunctions.length > 0 && <CardFooter>
            <ListGroup>
              {this.props.contractFunctions.map(contractFunction => (
                <ListGroupItem key={contractFunction.result}>
                  {contractFunction.inputs.length > 0 && <p>Input(s): {contractFunction.inputs.join(', ')}</p>}
                  <strong>Result: {JSON.stringify(contractFunction.result)}</strong>
                </ListGroupItem>
              ))}
            </ListGroup>
          </CardFooter>}
        </Collapse>}

      </Card>
    );
  }
}

ContractFunction.propTypes = {
  contractProfile: PropTypes.object,
  method: PropTypes.object,
  contractFunctions: PropTypes.arrayOf(PropTypes.object),
  postContractFunction: PropTypes.func
};

const filterContractFunctions = (contractFunctions, contractName, method) => {
  return contractFunctions.filter((contractFunction) => (
    contractFunction.contractName === contractName && contractFunction.method === method
  ));
};

const ContractOverview = (props) => {
  const {contractProfile, contract} = props;
  const contractDisplay = formatContractForDisplay(contract);
  if (!contractDisplay) {
    return '';
  }

  return (
    <div>
      {(contractDisplay.state === 'Deployed') && <div>Deployed at {contractDisplay.address}</div>}
      {(contractDisplay.state !== 'Deployed') && <div>{contractDisplay.address}</div>}
      <br/>
      {contractProfile.methods
        .filter((method) => {
          return props.onlyConstructor ? method.type === 'constructor' : method.type !== 'constructor';
        })
        .map(method => <ContractFunction key={method.name}
                                         method={method}
                                         contractFunctions={filterContractFunctions(props.contractFunctions, contractProfile.name, method.name)}
                                         contractProfile={contractProfile}
                                         postContractFunction={props.postContractFunction}/>)}
    </div>
  );
};

ContractOverview.propTypes = {
  contract: PropTypes.object,
  onlyConstructor: PropTypes.bool,
  contractProfile: PropTypes.object,
  contractFunctions: PropTypes.arrayOf(PropTypes.object),
  postContractFunction: PropTypes.func
};

ContractOverview.defaultProps = {
  onlyConstructor: false
};

export default ContractOverview;
