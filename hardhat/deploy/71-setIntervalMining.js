const { network } = require("hardhat")
require("dotenv").config()

const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ deployments }) => {
  const { log } = deployments
  // If on a development chain, continue
  if (developmentChains.includes(network.name)) {
    console.log("Mining a block every five seconds...")
    await network.provider.send("evm_setIntervalMining", [5000])
  }

  log("Done!")
  log("-------------------------------------")
}

module.exports.tags = ["all", "mining"]
