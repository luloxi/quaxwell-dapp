const express = require("express");
const app = express();
const { ethers } = require("ethers");
const {
  GovernorContractABI,
  governorContractAddress,
  CurrentChain,
  ChainList,
} = require("../interface/constants");

/* Replace with an automatic solution */
let currentChain = ChainList[CurrentChain["default"]];
const GovernorContractAddress = governorContractAddress[currentChain][0];
const provider = ethers.getDefaultProvider("http://localhost:8545");

const contract = new ethers.Contract(
  GovernorContractAddress,
  GovernorContractABI,
  provider
);

app.get("/proposalThreshold", async (req, res) => {
  try {
    const proposalThreshold = await contract.proposalThreshold();
    // Convert BigInt to string before sending as JSON
    res.json(proposalThreshold.toString());
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(3001, () => {
  console.log("Server listening on http://localhost:3001");
});
