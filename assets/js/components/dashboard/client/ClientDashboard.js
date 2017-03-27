'use strict';
import React from 'react';
import {Row, Col, Form, FormGroup, FormControl, Button, Alert, ControlLabel, Navbar, Table} from "react-bootstrap";
import _ from "lodash";
import  CreditAction from '../../../actions/credit';
import  BankAction from '../../../actions/bank';
// import  ClientRequestLine from './ClientRequestLine';

class ClientRequestLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clientId: this.props.currentUserId,
            bankId: '',
            bankBusinessName: '',
            sumOfCredit: 0,
            banksNames: []
        };
        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleChangeSum = this.handleChangeSum.bind(this);
        this.handleCreateCredit = this.handleCreateCredit.bind(this);
    }

    componentWillMount(){
        let that = this;
        BankAction.getAllBusinessNamesAsync({}, {})
            .then(res => {
                let banksNames = res;
                if(banksNames && banksNames.length > 0) {
                    that.setState({
                        bankId: banksNames[0].id,
                        bankBusinessName: banksNames[0].business_name,
                        banksNames: banksNames
                    });
                }else{
                    console.log("error componentWillMount 46 banksNames = null");
                }
            })
            .catch(err=>{
                console.log('45 err', err);
            });
    }

    handleChangeBank(ev) {
        let num = ev.target.value;
        let bankObj = this.state.banksNames[num];
        this.setState({
            bankBusinessName: bankObj.business_name,
            bankId: bankObj.id
        });
    }
    handleChangeSum(ev) {
        this.setState({sumOfCredit: ev.target.value});
    }
    handleCreateCredit(){
        let that = this;
        console.log("75 componentDidMount bankName:",that.state.bankBusinessName," bankId:",that.state.bankId," clientId:", that.state.clientId," sumOfCredit:", that.state.sumOfCredit-0);
        CreditAction.createAsync({'bankId':that.state.bankId, 'clientId':that.state.clientId, 'sum':that.state.sumOfCredit}, {})
            .then(()=>{
                console.log('CreditAction.createAsync 61 Ok state', that.state.bankBusinessName);
            })
            .catch(err=>{
                console.log('64 CreditAction create err', err);
            });
    }

    render(){
        let that = this;
        // console.log("106 render this.state.bankId:", this.state.bankId," this.state.bankBusinessName:",this.state.bankBusinessName);
        let num = -1;
        let banksNames = _.get(that.state, 'banksNames', []);
        return(
            <div className = "test-dash-client"  >
                <Row>
                    <Col md={6} xs={6} lg={6} sm={6}>
                        <FormGroup controlId="formControlSelect">
                            <ControlLabel>Bank</ControlLabel>
                            <FormControl componentClass="select" placeholder="Select bank"
                                         onChange={this.handleChangeBank}>
                                {
                                    banksNames.map(function(bankName){
                                        num++;
                                        return (
                                            <option
                                                key={num}
                                                value={num}>
                                                {bankName.business_name}
                                            </option>
                                        );

                                    })
                                }
                            </FormControl>
                        </FormGroup>
                    </Col>
                    <Col md={4} xs={4} lg={4} sm={4} className="second-name">
                        <FormGroup controlId="sum">
                            <ControlLabel>Sum</ControlLabel>
                            <FormControl
                                value={that.state.sumOfCredit}
                                placeholder="Input Sum Here"
                                onChange={this.handleChangeSum}>
                            </FormControl>
                        </FormGroup>
                    </Col>
                    <Col md={2} xs={2} lg={2} sm={2} >
                        <ControlLabel>Submit Request</ControlLabel>
                        <Button
                            type="submit"
                            bsStyle='primary'
                            bsSize="large"
                            onClick = {this.handleCreateCredit}>
                            REQUEST
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

class ClientCreditRequests extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clientId: this.props.currentUserId,
            clientRequests: [],
            banksNames: [],
            rend: false
        };
        this.handleCompleteRequestStates = this.handleCompleteRequestStates.bind(this);
    }

    componentWillMount(){
        let that = this;
        BankAction.getAllBusinessNamesAsync({}, {})
            .then(banksNames => {
             if(banksNames.length > 0) {
                that.setState({
                    banksNames: banksNames
                });
                 // console.log('141 banksNames:', banksNames);
                 that.handleCompleteRequestStates();
            }
        })
        .catch(err=>{
            console.log('error componentWillMount 172 banksNames', err);
        });
        CreditAction.getByClientIdAsync({'id': that.state.clientId}, {})
            .then(clientRequests => {
                if(clientRequests.length > 0){
                    that.setState({
                        clientRequests: clientRequests
                    });

                }
                // console.log("157 clientRequests:", clientRequests);
                that.handleCompleteRequestStates();
            })
            .catch(err => {
                console.log('ClientCreditRequests componentWillMount 169 err', err);
            });
    }
    handleCompleteRequestStates(){
        let that = this;
        if(this.state.clientRequests.length > 0 && this.state.banksNames.length > 0 ){
            let clientRequests = this.state.clientRequests;
            let banksNames = this.state.banksNames;
            let num = 0;
            clientRequests.map((cr)=>{
                let bankName = banksNames.filter((bn)=>{
                    return cr.bankId === bn.id;
                });
                clientRequests[num].bankBusinessName = bankName[0].business_name;
                num++;
            });
            that.setState({
                clientRequests: clientRequests,
                rend: true
            });
            // console.log("handleCompleteRequestStates", that.state.clientRequests);
        }
    }

    render(){
        let clientRequests = [];
        if(this.state.rend){
            clientRequests = this.state.clientRequests;
        }
        // console.log("194 clientRequests", clientRequests);
        return (
            <div className="test-dash-client">
                <Table striped bordered condensed hover>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Bank</th>
                            <th>Sum</th>
                            <th>Confirm</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        clientRequests.map((el)=>{
                           let confirm = (el.confirm == null) ? 'In process' : el.confirm;
                            return(
                            <tr>
                               <td>{el.requestDate}</td>
                               <td>{el.bankBusinessName}</td>
                               <td>{el.sum}</td>
                               <td>{(el.confirm == null) ? 'In process' : el.confirm}</td>
                           </tr>);
                        })
                    }
                    </tbody>
                </Table>
            </div>
        );
    }

}

class ClientDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: this.props.currentUser.Client.id
        }
    }

    render(){
        return(
            <div className = "test-dash-client"  >
                <ClientRequestLine currentUserId = {this.state.userId}/>
                <ClientCreditRequests currentUserId = {this.state.userId}/>
            </div>
        );
    }
}

// ClientDashboard.defaultProps = {
//
// };


ClientDashboard.propTypes = {
    //contains URI params
    params: React.PropTypes.object.isRequired,
    //contains all the stores
    stores: React.PropTypes.object.isRequired,
    //current logged in user or null
    currentUser: React.PropTypes.object.isRequired
};

export default ClientDashboard;
