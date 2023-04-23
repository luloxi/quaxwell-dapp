const { deployments, ethers } = require("hardhat")
const {
  developmentChains,
  DAO_MODERATORS: { NEW_MODERATORS, SET_NEW_MODERATOR_FN },
} = require("../../helper-hardhat-config")

const proposalDescription = "Example proposal"

const createProposal = async (GovernorContract, GovernanceToken, DAOModerators, moderatorIndex) => {
  const calldata = getCalldata(DAOModerators, moderatorIndex)
  const [{ address: owner }] = await ethers.getSigners()
  await GovernanceToken.delegate(owner)

  const tx = await GovernorContract.propose(
    [DAOModerators.address],
    [0],
    [calldata],
    proposalDescription
  )
  const receipt = await tx.wait()

  const createProposalEvent = receipt.events?.filter((e) => e.event === "ProposalCreated")

  return {
    calldata,
    status: receipt.status,
    owner,
    proposalId: createProposalEvent[0].args.proposalId,
  }
}

const getCalldata = (DAOModerators, moderatorIndex) => {
  const { NAME, EMAIL, MODERATOR_ADDRESS } = NEW_MODERATORS[moderatorIndex]
  return DAOModerators.interface.encodeFunctionData(SET_NEW_MODERATOR_FN, [
    NAME,
    EMAIL,
    MODERATOR_ADDRESS,
  ])
}

async function main() {
  /* Get signer and contract */

  const accounts = await ethers.getSigners()
  const deployer = accounts[0]

  const daoModerators = await ethers.getContract("DAOModerators", deployer)
  const governanceToken = await ethers.getContract("GovernanceToken", deployer)
  const governorContract = await ethers.getContract("GovernorContract", deployer)

  // /* Creating a new pproposal */

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
