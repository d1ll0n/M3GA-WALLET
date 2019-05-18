import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

import {createWallet} from '../../actions/wallet';

function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
}

const styles = theme => ({
    modal: {
        top: '2%',
        left: '2%',
        width: '96%'
    },
    paper: {
      position: 'absolute',
      width: '80%',
      outline: 'none',
      backgroundColor: 'lightgrey',
      paddingLeft: '20%'
    },
    input: {
        width: '60%',
    }
  });
  

class WalletMaker extends Component {
    state = {
        addresses: [],
        inputValue: ''
    }

    handleChange = (e) => {
        this.setState({ inputValue: e.target.value })
    }

    handleKeyDown = (e) => {
        if (e.charCode == 13) {
            const newAddress = this.state.inputValue;
            const addresses = [...this.state.addresses, newAddress];
            this.setState({ addresses, inputValue: '' })
        }
    }

    removeAddress = (i) => {
        let addresses = [];
        addresses = addresses.concat(this.state.addresses.slice(0, i)).concat(this.state.addresses.slice(i+1)).map(a => a.trim())
        this.setState({ addresses })
    }

    componentWillUpdate = (nextProps) => nextProps.wallet && this.props.changePage()

    renderList = () => <List>
        <ListItem key={0}>
            <ListItemText primary={this.props.account}/>
        </ListItem>

        {this.state.addresses.map(
            (address, i) =>
            <ListItem key={i+1}>
                <ListItemText primary={address}/>
                <ListItemSecondaryAction>
                <IconButton aria-label="Delete" onClick={() => this.removeAddress(i)}>
                    <DeleteIcon />
                </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
            )}
    </List>

    handleSubmit = async () => {
        const {account, createWallet} = this.props;
        const addresses = [...this.state.addresses, account].map(a => a.trim());
        createWallet(addresses);
    }

    renderLoading = () => <CircularProgress color="secondary" />

    render() {
        const {classes, changePage, isLoading, wallet} = this.props;    
        return <Modal className={classes.modal} open={true}>
            {
                isLoading
                ? this.renderLoading()
                : <div style={getModalStyle()} className={classes.paper}>
                    <h1>Enter Wallet Owners</h1>
                    <TextField
                        placeholder="0xf00C291eAEeA1Ac17ef115F5942C4e2ebFC75a52"
                        className={classes.input} 
                        value={this.state.inputValue} 
                        onChange={this.handleChange} 
                        onKeyPress={this.handleKeyDown} />
                    {this.renderList()}
                    <Button className={classes.input} onClick={() => this.handleSubmit()}>Create!</Button>
                </div>
            }            
        </Modal>
    }
}

const mapStateToProps = ({ web3, wallet }) => ({
    account: web3.accounts[0],
    isLoading: wallet.createPending,
    wallet: wallet.wallet
})

const mapDispatchToProps = dispatch => bindActionCreators({
    createWallet,
    changePage: () => push('/')
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(WalletMaker))