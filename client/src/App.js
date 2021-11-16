import React, { Component } from "react";
import ElectionContract from "./contracts/Election.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    candidates: [],
    winner: null,
    voteCount: null,
    votedAccounts: [],
    currentAccount: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ElectionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ElectionContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      console.log({
        methods: instance.methods,
      });

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;
    const candidatesCount = await contract.methods.candidatesCount().call();
    console.log(candidatesCount);

    const candidates = await contract.methods.getCandidates().call();
    console.log(candidates);
    if (!this.state.currentAccount) {
      this.setState({
        candidates,
        currentAccount: accounts[0],
      });
    } else {
      this.setState({ candidates });
    }
  };

  seedCandidates = async () => {
    const { accounts, contract } = this.state;
    try {
      await contract.methods.addCandidate("Ron").send({ from: accounts[0] });
      await contract.methods.addCandidate("Jon").send({ from: accounts[0] });
      await contract.methods.addCandidate("Kon").send({ from: accounts[0] });
    } catch (error) {
      console.log(error);
    }

    const candidates = await contract.methods.getCandidates().call();
    console.log(candidates);
    this.setState({ candidates });
  };

  getWinner = async () => {
    const { accounts, contract } = this.state;
    const winner = await contract.methods.winner().call();
    console.log(winner);
    this.setState({ winner });
  };

  vote = async (candidate) => {
    const { accounts, contract } = this.state;

    // get random account from accounts
    // const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
    try {
      await contract.methods
        .vote(candidate.id)
        .send({ from: this.state.currentAccount });

      // get total vote count
      const voteCount = await contract.methods
        .totalVotesFor(candidate.id)
        .call();

      // add voted account to voted candidates

      const votedAccounts = [
        ...this.state.votedAccounts,
        this.state.currentAccount,
      ];

      const candidates = await contract.methods.getCandidates().call();
      this.setState({ candidates, votedAccounts });
    } catch (error) {
      alert("account has already voted");
    }
  };

  selectAccount = (event) => {
    this.setState({ currentAccount: event.target.value });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    if (!this.state.candidates.length) {
      return (
        <div className="App">
          <h3>No Candidates Found</h3>
          <button onClick={this.seedCandidates}>Load Candidates</button>
        </div>
      );
    }
    return (
      <div className="App">
        {this.state.candidates.length === 0 && (
          <button onClick={this.seedCandidates}>Load Candidates</button>
        )}

        <h3>Vote From Account</h3>

        <select value={this.state.currentAccount} onChange={this.selectAccount}>
          {this.state.accounts.map((account) => {
            // check if account has already voted
            const voted = this.state.votedAccounts.includes(account);
            if (voted) {
              return null;
            }
            return (
              <option key={account} value={account}>
                {account}
              </option>
            );
          })}
        </select>

        <h3>Candidates</h3>
        {this.state.candidates.map((candidate, index) => {
          
          return (
            <div key={index}>
              <h3>{candidate.name}</h3>
              <p>{candidate.votes ? candidate.votes : 0} votes</p>
              <button onClick={() => this.vote(candidate)}>Vote</button>
            </div>
          );
        })}

        <h3>Winner</h3>
        {!this.state.winner && (
          <button onClick={() => this.getWinner()}>Get Winner</button>
        )}

        {this.state.winner && <h1>Winner is: {this.state.winner}</h1>}

        <h3>Voted Accounts</h3>
        {this.state.votedAccounts.map((account, index) => {
          return <p key={index}>{account}</p>;
        })}
      </div>
    );
  }
}

export default App;
