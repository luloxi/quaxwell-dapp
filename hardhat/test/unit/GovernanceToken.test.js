const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { moveBlocks } = require("./utilities")
const { network, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  GOVERNANCE_TOKEN: { TOTAL_SUPPLY },
} = require("../../helper-hardhat-config")

// Skip tests if trying to run outside of local development
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("GovernanceToken Unit Test", function () {
      let governanceToken, deployer
      beforeEach(async function () {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1]

        await deployments.fixture("all")
        governanceToken = await ethers.getContract("GovernanceToken")
      })

      describe("Deployment", function () {
        it("Should set the right total supply of checkpoints(voting power)", async function () {
          await moveBlocks(1) // Is this necessary?
          const { number } = await ethers.provider.getBlock("latest")
          expect(await governanceToken.getPastTotalSupply(number - 1)).to.equal(TOTAL_SUPPLY)
        })

        it("Owner ERC20Votes balance should equal total supply", async function () {
          expect(await governanceToken.balanceOf(deployer.address)).to.equal(TOTAL_SUPPLY)
        })
      })

      describe("Delegation and transfer of ERC20Votes", function () {
        it("Owner should delegate voting power to himself", async function () {
          await governanceToken.delegate(deployer.address)
          expect(await governanceToken.getVotes(deployer.address)).to.equal(TOTAL_SUPPLY)
        })

        it("Owner should transfer a third of ERC20Votes to another address", async function () {
          const AMOUNT = TOTAL_SUPPLY / 3
          await governanceToken.transfer(user.address, BigNumber.from(AMOUNT))
          expect(await governanceToken.balanceOf(user.address)).to.equal(AMOUNT)
        })

        it("Transfer should fail if transfer amount is more than ERC20Votes balance", async function () {
          const AMOUNT = TOTAL_SUPPLY + 50
          await expect(governanceToken.transfer(user.address, BigNumber.from(AMOUNT))).to.be
            .reverted
        })
      })
    })
