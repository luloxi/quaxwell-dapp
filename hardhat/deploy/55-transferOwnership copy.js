require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  const governorContract = await ethers.getContract("GovernorContract", deployer)
  const daoModerators = await ethers.getContract("DAOModerators", deployer)

  log("Transferring ownership to GovernorContract...")
  await daoModerators.transferOwnership(governorContract.address)

  log("Done!")
  log("-------------------------------------")
}

module.exports.tags = ["all", "ownership", "anarchy"]
