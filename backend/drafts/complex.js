const express = require("express");
const app = express();
const { ethers } = require("ethers");
const {
  GovernorContractABI,
  governorContractAddress,
  CurrentChain,
  ChainList,
} = require("../../interface/constants");

// To be updated with an Ethereum node URL for production
const provider = ethers.getDefaultProvider("http://localhost:8545");

/* Replace with an automatic solution */
let currentChain = ChainList[CurrentChain["default"]];
const GovernorContractAddress = governorContractAddress[currentChain][0];

async function fetchProposals(/* onlyActive */) {
  // This should be an argument when calling the Express server
  const onlyActive = true;
  try {
    const governorContract = new ethers.Contract(
      GovernorContractAddress,
      GovernorContractABI,
      provider
    );

    // This could be read from the smart contract to be more dynamic
    const blockNumber = await provider.getBlockNumber();
    // const votingPeriod = 100;
    // const blockMinusVotingPeriod = blockNumber - votingPeriod;

    let eventFilter = governorContract.filters.ProposalCreated();

    // Make dynamic, can't read more than 3 at a time
    const logs = await provider.getLogs({
      ...eventFilter,
      fromBlock: 0,
      toBlock: 2,
      // fromBlock: onlyActive && votingPeriod !== 0
      //   ? blockMinusVotingPeriod > 0
      //     ? blockMinusVotingPeriod
      //     : ethers.BigNumber.from(1) // Use 0 as the block number
      //   : ethers.BigNumber.from(1), // Use 0 as the block number
      // toBlock: blockNumber, // Use the current block number as the toBlock value
    });

    // It doesn't get this far
    let proposals = logs.filter((log) => {
      const parsedLog = governorContract.interface.parseLog(log);
      console.log("Parsed Log Args:", parsedLog);
      if (!parsedLog || !parsedLog.args) return false;
      const deadline = parsedLog.args[7].toNumber();
      return onlyActive ? deadline >= blockNumber : true;
    });

    // console.log(proposals);

    proposals = proposals.map((log) => {
      const parsedLog = governorContract.interface.parseLog(log);
      if (!parsedLog || !parsedLog.args) return null;
      const [proposalId, , , , , calldatas, snapshot, deadline, description] =
        parsedLog.args;
      return {
        calldatas,
        deadline,
        description,
        proposalId,
        snapshot,
      };
    });

    console.log(proposals);

    return proposals.filter((proposal) => proposal !== null);
  } catch (error) {
    throw error;
  }
}

app.get("/proposals", async (req, res) => {
  try {
    // const onlyActive = req.query.onlyActive === "true"; // Get the onlyActive flag from query parameter
    const proposals = await fetchProposals(/* onlyActive */);
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express app and listen for incoming requests
app.listen(3001, () => {
  console.log("Server started on http://localhost:3001");
});
