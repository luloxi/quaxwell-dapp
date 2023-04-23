const express = require("express");
const app = express();
const { ethers } = require("ethers");
const {
  GovernorContractABI,
  governorContractAddress,
  CurrentChain,
  ChainList,
} = require("../../interface/constants");

/* Replace with an automatic solution */
let currentChain = ChainList[CurrentChain["default"]];
const GovernorContractAddress = governorContractAddress[currentChain][0];

// To be updated with an Ethereum node URL for production
const provider = ethers.getDefaultProvider("http://localhost:8545");

// This should be an argument when calling the Express server
const onlyActive = true;

async function fetchProposals(onlyActive) {
  try {
    const governorContract = new ethers.Contract(
      GovernorContractAddress,
      GovernorContractABI,
      provider
    );

    const votingPeriod = await governorContract.votingPeriod();
    console.log("Tu abuela:", votingPeriod.toString());
    const blockNumber = await provider.getBlockNumber();

    let eventFilter = governorContract.filters.ProposalCreated();
    const blockMinusVotingPeriod = blockNumber - votingPeriod.toString();

    const logs = await provider.getLogs({
      ...eventFilter,
      fromBlock:
        onlyActive && votingPeriod !== 0
          ? blockMinusVotingPeriod > 0
            ? blockMinusVotingPeriod
            : 0
          : "earliest",
      toBlock: "latest",
    });

    let proposals = logs.filter((log) => {
      const deadline = governorContract.interface
        .parseLog(log)
        .args[7].toNumber();
      // If onlyActive is true, only show proposals where deadline is greater than blockNumber
      // Else, show everything
      return onlyActive ? deadline >= blockNumber : true;
    });

    // let proposals = logs.filter((log) => {

    //   const deadline = governorContract.interface
    //     .parseLog(log)
    //     .args[7].toNumber();
    // If onlyActive, only show proposals where deadline is greater than blockNumber
    // Else, show everything
    //   return onlyActive ? deadline >= blockNumber : true;
    //   return true;
    // });

    proposals = proposals.map((log) => {
      console.log(governorContract.interface.parseLog(log));
      //   const [proposalId, , , , , calldatas, snapshot, deadline, description] =
      //     governorContract.interface.parseLog(log).args;
      //   return {
      //     calldatas,
      //     deadline,
      //     description,
      //     proposalId,
      //     snapshot,
      //   };
    });

    return proposals;
  } catch (error) {
    throw error;
  }
}

app.get("/proposals", async (req, res) => {
  try {
    const onlyActive = req.query.onlyActive === "true"; // Get the onlyActive flag from query parameter
    const proposals = await fetchProposals(onlyActive);
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express app and listen for incoming requests
app.listen(3001, () => {
  console.log("Server started on http://localhost:3001");
});
