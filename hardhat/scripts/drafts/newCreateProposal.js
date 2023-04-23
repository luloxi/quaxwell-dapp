const { deployments, ethers } = require("hardhat")
const {
  developmentChains,
  DAO_MODERATORS: { NEW_MODERATORS },
} = require("../helper-hardhat-config")
const {
  proposalDescription,
  NAME,
  EMAIL,
  MODERATOR_ADDRESS,
  SET_NEW_MODERATOR_FN,
} = require("../helper-hardhat-config")

// const getCalldata = (DAOModerators, moderatorIndex) => {
//   const { NAME, EMAIL, MODERATOR_ADDRESS } = NEW_MODERATORS[moderatorIndex]
//   return DAOModerators.interface.encodeFunctionData(SET_NEW_MODERATOR_FN, [
//     NAME,
//     EMAIL,
//     MODERATOR_ADDRESS,
//   ])
// }

const createProposal = async (GovernorContract, GovernanceToken, DAOModerators, moderatorIndex) => {
  // This can be changed into easy-to-fill settings
  // const calldata = getCalldata(DAOModerators, moderatorIndex)

  // Creating call data for the proposal
  const newModerator = [NAME, EMAIL, MODERATOR_ADDRESS]
  const calldata = { SET_NEW_MODERATOR_FN, newModerator }

  const [{ address: owner }] = await ethers.getSigners()
  // Self delegating to activate checkpoints and have the voting power tracked
  await GovernanceToken.delegate(owner)

  // Proposing
  const tx = await GovernorContract.propose(
    [DAOModerators.address],
    [0],
    [calldata],
    proposalDescription
  )
  const receipt = await tx.wait()

  // Get the event to extract the proposalId
  const createProposalEvent = receipt.events?.filter((e) => e.event === "ProposalCreated")

  return {
    calldata,
    status: receipt.status,
    owner,
    proposalId: createProposalEvent[0].args.proposalId,
  }
}

async function main() {
  /* Get signer and contract */

  const accounts = await ethers.getSigners()
  const deployer = accounts[0]

  const daoModerators = await ethers.getContract("DAOModerators", deployer)
  const governanceToken = await ethers.getContract("GovernanceToken", deployer)
  const governorContract = await ethers.getContract("GovernorContract", deployer)

  // /* Creating a new proposal */

  const { proposalId } = await createProposal(governorContract, governanceToken, daoModerators, 0)

  let proposalState = await governorContract.state(proposalId)
  console.log(`Current proposal state of proposal # ${proposalId} is: ${proposalState}`)

  // If development chains blabla
  // await moveBlocks(INITIAL_VOTING_DELAY + 1)
  // let newProposalState = await governorContract.state(proposalId)
  // console.log("Now proposal state is:", newProposalState)

  console.log("Done!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

// const writeProposal = async function () {

// }
