require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  const governanceToken = await ethers.getContract("GovernanceToken", deployer)

  log("Delegating voting power to self...")
  await governanceToken.delegate(deployer)

  log("Done!")
  log("-------------------------------------")
}

module.exports.tags = ["all", "ownership", "anarchy"]
