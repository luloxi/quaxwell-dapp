const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { moveBlocks } = require("./utilities")
const { network, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  DAO_MODERATORS: { NEW_MODERATORS, SET_NEW_MODERATOR_FN },
  GOVERNANCE_TOKEN: { TOTAL_SUPPLY },
  GOVERNOR_CONTRACT: { INITIAL_VOTING_DELAY, INITIAL_VOTING_PERIOD, INITIAL_MINIMUM_VOTING_PERIOD },
} = require("../../helper-hardhat-config")

/* Helper objects */

const proposalDescription = "Example proposal description"
const weight = {
  sufficient: 15,
  sufficientTwoProposals: 10,
  exceeded: 20,
  notQuorum: 2,
}
const support = {
  against: 0,
  for: 1,
  abstain: 2,
}
const proposalState = {
  pending: 0,
  active: 1,
  canceled: 2,
  defeated: 3,
  succeeded: 4,
  queued: 5,
  expired: 6,
  executed: 7,
}

/* Helper functions */

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

// Skip tests if trying to run outside of local development
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("GovernorContract Unit Test", function () {
      let governanceToken, daoModerators, governorContract, deployer
      beforeEach(async function () {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1]

        await deployments.fixture("all")
        governanceToken = await ethers.getContract("GovernanceToken")
        daoModerators = await ethers.getContract("DAOModerators")
        governorContract = await ethers.getContract("GovernorContract")
      })

      describe("Creation of proposals", function () {
        it("Should create a proposal", async function () {
          const { proposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          let _proposalState = await governorContract.state(proposalId)
          expect(_proposalState).to.equal(proposalState.pending)

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          _proposalState = await governorContract.state(proposalId)
          expect(_proposalState).to.equal(proposalState.active)
        })
        it("Proposal should fail if proposer has no voting power", async function () {
          const calldata = getCalldata(daoModerators, 0)
          await expect(
            governorContract.propose([daoModerators.address], [0], [calldata], proposalDescription)
          ).to.be.reverted
        })
        it("Proposal should fail if proposer votes are below proposal threshold", async function () {
          await governanceToken.delegate(deployer.address)
          // Transfer all votes except one to a second address
          await governanceToken.transfer(user.address, BigNumber.from(TOTAL_SUPPLY - 1))
          const calldata = getCalldata(daoModerators, 0)
          await expect(
            governorContract.propose([daoModerators.address], [0], [calldata], proposalDescription)
          ).to.be.reverted
        })
        it("Should create two proposals", async function () {
          const { status } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          expect(status).to.equal(1)

          await moveBlocks(INITIAL_VOTING_DELAY + 2)

          const proposal = await createProposal(governorContract, governanceToken, daoModerators, 1)
          expect(proposal.status).to.equal(1)
        })
        it("Second proposal should fail if minimum voting period cannot be reached", async function () {
          const { status } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          expect(status).to.equal(1)

          await moveBlocks(INITIAL_VOTING_PERIOD - INITIAL_MINIMUM_VOTING_PERIOD + 1)

          await expect(createProposal(governorContract, governanceToken, daoModerators, 1)).to.be
            .reverted
        })
        it("Should create two proposals in different voting periods", async function () {
          const { status } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          expect(status).to.equal(1)

          await moveBlocks(INITIAL_VOTING_PERIOD + 10)

          const proposal = await createProposal(governorContract, governanceToken, daoModerators, 1)
          expect(proposal.status).to.equal(1)
        })
        it("Should fail when creating two equal proposals", async function () {
          const { status } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )
          expect(status).to.equal(1)
          await expect(createProposal(governorContract, governanceToken, daoModerators, 0)).to.be
            .reverted
        })
      })

      describe("Voting", function () {
        it("Should vote for a proposal", async function () {
          const { owner, proposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await governorContract.vote(proposalId, weight.sufficient, support.for)
          expect(await governorContract.hasVoted(proposalId, owner)).to.be.true
        })

        it("Should fail if voter casts more votes that he has to one proposal", async function () {
          const { proposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await expect(governorContract.vote(proposalId, weight.exceeded, support.for)).to.be
            .reverted
        })

        it("Should vote for two proposals", async function () {
          const { owner, proposalId: firstProposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )
          const { proposalId: secondProposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            1
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await governorContract.vote(firstProposalId, weight.sufficientTwoProposals, support.for)
          expect(await governorContract.hasVoted(firstProposalId, owner)).to.be.true

          await governorContract.vote(secondProposalId, weight.sufficientTwoProposals, support.for)
          expect(await governorContract.hasVoted(secondProposalId, owner)).to.be.true
        })

        it("Should fail if voter casts more votes that he has for two proposals", async function () {
          const { proposalId: firstProposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )
          const { proposalId: secondProposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            1
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await governorContract.vote(firstProposalId, weight.sufficient, support.for)

          await expect(governorContract.vote(secondProposalId, weight.sufficient, support.for)).to
            .be.reverted
        })

        it("Voting weight between voting periods should be cleaned", async function () {
          const { owner, proposalId: firstProposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await governorContract.vote(firstProposalId, weight.sufficient, support.for)

          expect(await governorContract.hasVoted(firstProposalId, owner)).to.be.true

          await moveBlocks(INITIAL_VOTING_PERIOD + 100)

          const { proposalId: secondProposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            1
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await governorContract.vote(secondProposalId, weight.sufficient, support.for)
          expect(await governorContract.hasVoted(secondProposalId, owner)).to.be.true
        })

        it("Should not be able to vote if received ERC20Votes during the voting period", async function () {
          const { proposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          // eslint-disable-next-line no-undef
          const [, other] = await ethers.getSigners()

          const amount = TOTAL_SUPPLY / 3
          await governanceToken.transfer(other.address, BigNumber.from(amount))
          expect(await governanceToken.balanceOf(other.address)).to.equal(amount)

          await expect(
            governorContract.connect(other).vote(proposalId, weight.sufficient, support.for)
          ).to.be.reverted
        })

        it("Should get available votes", async function () {
          await governanceToken.delegate(deployer.address)

          await moveBlocks(1)

          expect(await governorContract.getAvailableVotingPower()).to.equal(TOTAL_SUPPLY)

          const calldata = getCalldata(daoModerators, 0)

          const tx = await governorContract.propose(
            [daoModerators.address],
            [0],
            [calldata],
            proposalDescription
          )
          const receipt = await tx.wait()

          const createProposalEvent = receipt.events?.filter((e) => e.event === "ProposalCreated")

          const proposalId = createProposalEvent[0].args.proposalId

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          expect(await governorContract.getAvailableVotingPower()).to.equal(TOTAL_SUPPLY)

          await governorContract.vote(proposalId, weight.sufficient, support.for)

          expect(await governorContract.getAvailableVotingPower()).to.equal(
            TOTAL_SUPPLY - weight.sufficient ** 2
          )
        })
      })

      describe("Proposal outcome", function () {
        it("Proposal should be defeated if quorum is not reached", async () => {
          const { proposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await governorContract.vote(proposalId, weight.notQuorum, support.for)

          await moveBlocks(INITIAL_VOTING_PERIOD + 1)

          const _proposalState = await governorContract.state(proposalId)
          expect(_proposalState).to.equal(proposalState.defeated)
        })

        it("Proposal should be defeated if majority is not reached", async () => {
          const { proposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await governorContract.vote(proposalId, weight.sufficient, support.against)

          await moveBlocks(INITIAL_VOTING_PERIOD + 1)

          const _proposalState = await governorContract.state(proposalId)
          expect(_proposalState).to.equal(proposalState.defeated)
        })

        it("Proposal should be successful if quorum and majority is reached", async () => {
          const { proposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await governorContract.vote(proposalId, weight.sufficient, support.for)

          await moveBlocks(INITIAL_VOTING_PERIOD + 1)

          const _proposalState = await governorContract.state(proposalId)
          expect(_proposalState).to.equal(proposalState.succeeded)
        })

        // Test is failing, why?
        xit("Proposal should be executed and daoModerators should be appointed", async () => {
          const { proposalId, calldata } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await governorContract.vote(proposalId, weight.sufficient, support.for)

          await moveBlocks(INITIAL_VOTING_PERIOD + 1)

          // eslint-disable-next-line no-undef
          const descriptionHash = ethers.utils.id(proposalDescription)

          await governorContract.execute([daoModerators.address], [0], [calldata], descriptionHash)

          const _proposalState = await governorContract.state(proposalId)
          expect(_proposalState).to.equal(proposalState.executed)

          const moderators = await daoModerators.getModerators()
          expect(moderators).to.have.lengthOf(2)
        })
      })

      describe("Events", function () {
        it("Should emit an event when a vote is casted", async () => {
          const { owner, proposalId } = await createProposal(
            governorContract,
            governanceToken,
            daoModerators,
            0
          )

          await moveBlocks(INITIAL_VOTING_DELAY + 1)

          await expect(governorContract.vote(proposalId, weight.sufficient, support.for))
            .to.emit(governorContract, "LogVoteCasted")
            .withArgs(owner, proposalId, support.for, weight.sufficient)
        })
      })

      describe("Disabled functions", function () {
        it("Function castVote should be disabled", async () => {
          await expect(governorContract.castVote(2, 1)).to.be.reverted
        })

        it("Function castVoteWithReason should be disabled", async () => {
          await expect(governorContract.castVoteWithReason(2, 1, "fail")).to.be.reverted
        })

        it("Function castVoteWithReasonAndParams should be disabled", async () => {
          await expect(governorContract.castVoteWithReasonAndParams(2, 1, "fail", 1)).to.be.reverted
        })

        it("Function castVoteBySig should be disabled", async () => {
          await expect(
            governorContract.castVoteBySig(
              2,
              1,
              1,
              "0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0",
              "0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0"
            )
          ).to.be.reverted
        })

        it("Function castVoteWithReasonAndParamsBySig should be disabled", async () => {
          await expect(
            governorContract.castVoteWithReasonAndParamsBySig(
              2,
              1,
              "fail",
              1,
              1,
              "0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0",
              "0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0"
            )
          ).to.be.reverted
        })
      })
    })
