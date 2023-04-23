const { network } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()
const {
  developmentChains,
  GOVERNOR_CONTRACT: {
    NAME: GOVERNOR_CONTRACT_NAME,
    INITIAL_VOTING_DELAY,
    INITIAL_VOTING_PERIOD,
    INITIAL_MINIMUM_VOTING_PERIOD,
    INITIAL_PROPOSAL_THRESHOLD,
    QUORUM_NUMERATOR_VALUE,
  },
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()

  const governanceToken = await get("GovernanceToken")
  // const daoModerators = await get("DAOModerators")

  arguments = [
    governanceToken.address,
    GOVERNOR_CONTRACT_NAME,
    INITIAL_VOTING_DELAY,
    INITIAL_VOTING_PERIOD,
    INITIAL_MINIMUM_VOTING_PERIOD,
    INITIAL_PROPOSAL_THRESHOLD,
    QUORUM_NUMERATOR_VALUE,
  ]

  const governorContract = await deploy("GovernorContract", {
    from: deployer,
    log: true,
    args: arguments,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  // Do something to automate this here?
  // if (developmentChains.includes(network.name)) {
  //   log("Transfering DAO ownershit to GovernorContract...")
  //   await daoModerators.transferOwnership(governorContract.address)
  // }

  log("-------------------------------------")

  if (
    !developmentChains.includes(network.name) &&
    (process.env.ETHERSCAN_API_KEY || process.env.POLYGONSCAN_API_KEY)
  ) {
    log("Verifying...")
    await verify(governorContract.address, arguments)
  }

  log("-------------------------------------")
}

module.exports.tags = ["all", "governorcontract", "anarchy"]
