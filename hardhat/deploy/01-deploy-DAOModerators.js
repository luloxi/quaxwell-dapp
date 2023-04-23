const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()
const {
  DAO_MODERATORS: { NAME, EMAIL, MODERATOR_ADDRESS },
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  arguments = [NAME, EMAIL, MODERATOR_ADDRESS]

  const daoModerators = await deploy("DAOModerators", {
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
    await verify(daoModerators.address, arguments)
  }

  log("-------------------------------------")
}

module.exports.tags = ["all", "daomoderators", "anarchy"]
