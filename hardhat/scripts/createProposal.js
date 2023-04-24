const { ethers } = require("hardhat")

async function main() {
  // Get the instance of the contracts
  const governorContract = await ethers.getContract("GovernorContract")
  const daoModerators = await ethers.getContract("DAOModerators")

  const targets = [daoModerators.address]
  const values = [0]
  const calldatas = [getCalldata(daoModerators, 0)]
  const description = "Example proposal"

  // Call the propose function with the configured arguments
  const proposalId = await governorContract.propose(targets, values, calldatas, description)

  console.log("Proposal created with ID:", proposalId.toString())
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
