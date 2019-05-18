const {expect} = require('chai')
const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')
const {abi, bytecode} = require('./sol/build/MegaWallet')
const template = require('./sol/contracts/payloadTemplate')
const easySolc = require('./sol/easy-solc')
const badCode = require('./sol/contracts/shouldFailTemplate')

const deployWallet = addrs => new web3.eth.Contract(abi)
    .deploy({
        data: bytecode,
        arguments: [addrs, 6]
    }).send({from: addrs[0], gas: 4700000})

const payloadFromTemplate = code => easySolc('Payload', template.replace('PUT_CODE_HERE', code)).bytecode

let contract, accounts
before(async () => {
    accounts = await web3.eth.getAccounts()
    contract = await deployWallet(accounts.slice(1))
})

describe('MegaWallet Tests', () => {
    it('Should have deployed the contract', () => {
        console.log(contract._address)
        expect(contract._address).exist
    })

    it('Should check the status of a payload vote', async () => {
        const payload = payloadFromTemplate(`emit TestEvent(60);`)
        await web3.eth.sendTransaction({from: accounts[1], data: payload, gas: 250000, to: contract._address})
        const votes = await contract.methods.getPayloadStatus(payload).call()
        expect(votes).to.eql('1')
    })

    it('Should only execute once a signature threshold is reached', async () => {
        const payload = payloadFromTemplate(`emit TestEvent(50);`)
        for (let acct of accounts.slice(1, 6)) await web3.eth.sendTransaction({from: acct, data: payload, gas: 250000, to: contract._address})
        let votes = await contract.methods.getPayloadStatus(payload).call()
        expect(votes).to.eql('5')
        await web3.eth.sendTransaction({from: accounts[7], data: payload, gas: 250000, to: contract._address})
        votes = await contract.methods.getPayloadStatus(payload).call()
        expect(votes).to.eql('0')
    })

    it('Should disallow voting for non-owners', async () => {
        try {
            const payload = payloadFromTemplate(`emit TestEvent(40);`)
            await web3.eth.sendTransaction({from: accounts[0], data: payload, gas: 250000, to: contract._address})
            throw new Error('Should have thrown')
        } catch (e) {}
    })

    it('Should blacklist sstore', async () => {
        const payload = easySolc('Payload', badCode).bytecode
        try {
            await web3.eth.sendTransaction({from: accounts[1], data: payload, gas: 250000, to: contract._address})
            throw new Error('Should have thrown')
        } catch (e) {}
    })
})