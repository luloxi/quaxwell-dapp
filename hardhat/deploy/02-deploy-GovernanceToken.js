const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()
const {
  GOVERNANCE_TOKEN: { NAME: GOVERNANCE_TOKEN_NAME, SYMBOL, TOTAL_SUPPLY },
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  arguments = [GOVERNANCE_TOKEN_NAME, SYMBOL, TOTAL_SUPPLY]

  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    log: true,
    args: arguments,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  log("-------------------------------------")

  if (
    !developmentChains.includes(network.name) &&
    (process.env.ETHERSCAN_API_KEY || process.env.POLYGONSCAN_API_KEY)
  ) {
    log("Verifying...")
    await verify(governanceToken.address, arguments)
  }

  log("-------------------------------------")
}

module.exports.tags = ["all", "governancetoken", "anarchy"]
