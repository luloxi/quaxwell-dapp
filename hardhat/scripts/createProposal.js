const hre = require("hardhat")

async function main() {
  // Configure the arguments for the propose function
  const targets = [
    /* insert target addresses here */
  ]
  const values = [
    /* insert values here */
  ]
  const calldatas = [10 /* Replace with custom calldata */]
  const description = "Your proposal description here"

  // Get the instance of the contract
  const contract = await hre.ethers.getContract("GovernorContract")

  // Call the propose function with the configured arguments
  const proposalId = await contract.propose(targets, values, calldatas, description)

  console.log("Proposal created with ID:", proposalId.toString())
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
