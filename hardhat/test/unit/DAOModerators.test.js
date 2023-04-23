const { expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  DAO_MODERATORS: { NEW_MODERATORS },
} = require("../../helper-hardhat-config")
const { NAME, EMAIL, MODERATOR_ADDRESS } = NEW_MODERATORS[0]

// Skip tests if trying to run outside of local development
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("DAOModerators Unit Test", function () {
      let daoModerators, deployer
      beforeEach(async function () {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]

        await deployments.fixture("all")
        daoModerators = await ethers.getContract("DAOModerators")
      })

      it("Should get current moderators", async () => {
        const moderators = await daoModerators.getModerators()
        expect(moderators).to.have.lengthOf(1)
      })

      it("Should set a new moderator", async () => {
        await daoModerators.setNewModerator(NAME, EMAIL, MODERATOR_ADDRESS)
        const moderators = await daoModerators.getModerators()
        expect(moderators).to.have.lengthOf(2)
      })
      it("Should delete current moderators", async () => {
        await daoModerators.deleteModerators()
        const moderators = await daoModerators.getModerators()
        expect(moderators).to.have.lengthOf(0)
      })
      it("Should emit an event on the appointment of a new moderator", async () => {
        await expect(daoModerators.setNewModerator(NAME, EMAIL, MODERATOR_ADDRESS))
          .to.emit(daoModerators, "LogNewModerator")
          .withArgs(NAME, EMAIL, MODERATOR_ADDRESS)
      })
    })
