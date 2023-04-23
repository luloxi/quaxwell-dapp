const {
  DAOModeratorsAddress,
  DAOModeratorsABI,
  GovernanceTokenAddress,
  GovernanceTokenABI,
  GovernorContractAddress,
  GovernorContractABI,
} = require("../helper-hardhat-config")
const { ethers, network } = require("hardhat")
const fs = require("fs")

module.exports = async () => {
  const { log } = deployments
  if (process.env.UPDATE_FRONT_END) {
    log("Updating address and ABI on interface...")
    await updateDAOModeratorsABI()
    await updateDAOModeratorsAddress()
    await updateGovernanceTokenABI()
    await updateGovernanceTokenAddress()
    await updateGovernorContractABI()
    await updateGovernorContractAddress()

    log("Done!")
    log("-------------------------------------")
  }
}

async function updateDAOModeratorsABI() {
  const DAOModerators = await ethers.getContract("DAOModerators")
  fs.writeFileSync(DAOModeratorsABI, DAOModerators.interface.format(ethers.utils.FormatTypes.json))
}

async function updateDAOModeratorsAddress() {
  const DAOModerators = await ethers.getContract("DAOModerators")
  const contractAddresses = JSON.parse(fs.readFileSync(DAOModeratorsAddress, "utf8"))
  if (network.config.chainId.toString() in contractAddresses) {
    if (!contractAddresses[network.config.chainId.toString()].includes(DAOModerators.address)) {
      contractAddresses[network.config.chainId.toString()].push(DAOModerators.address)
    }
  } else {
    contractAddresses[network.config.chainId.toString()] = [DAOModerators.address]
  }
  fs.writeFileSync(DAOModeratorsAddress, JSON.stringify(contractAddresses))
}

async function updateGovernanceTokenABI() {
  const GovernanceToken = await ethers.getContract("GovernanceToken")
  fs.writeFileSync(
    GovernanceTokenABI,
    GovernanceToken.interface.format(ethers.utils.FormatTypes.json)
  )
}

async function updateGovernanceTokenAddress() {
  const GovernanceToken = await ethers.getContract("GovernanceToken")
  const contractAddresses = JSON.parse(fs.readFileSync(GovernanceTokenAddress, "utf8"))
  if (network.config.chainId.toString() in contractAddresses) {
    if (!contractAddresses[network.config.chainId.toString()].includes(GovernanceToken.address)) {
      contractAddresses[network.config.chainId.toString()].push(GovernanceToken.address)
    }
  } else {
    contractAddresses[network.config.chainId.toString()] = [GovernanceToken.address]
  }
  fs.writeFileSync(GovernanceTokenAddress, JSON.stringify(contractAddresses))
}

async function updateGovernorContractABI() {
  const GovernorContract = await ethers.getContract("GovernorContract")
  fs.writeFileSync(
    GovernorContractABI,
    GovernorContract.interface.format(ethers.utils.FormatTypes.json)
  )
}

async function updateGovernorContractAddress() {
  const GovernorContract = await ethers.getContract("GovernorContract")
  const contractAddresses = JSON.parse(fs.readFileSync(GovernorContractAddress, "utf8"))
  if (network.config.chainId.toString() in contractAddresses) {
    if (!contractAddresses[network.config.chainId.toString()].includes(GovernorContract.address)) {
      contractAddresses[network.config.chainId.toString()].push(GovernorContract.address)
    }
  } else {
    contractAddresses[network.config.chainId.toString()] = [GovernorContract.address]
  }
  fs.writeFileSync(GovernorContractAddress, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
