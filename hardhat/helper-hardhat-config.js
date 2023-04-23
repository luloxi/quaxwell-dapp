/* Variables for updating rainbowkit frontend */

const developmentChains = ["hardhat", "localhost"]
const daoModeratorsAddress = "../rainbowkit/constants/daoModeratorsAddress.json"
const daoModeratorsABI = "../rainbowkit/constants/daoModeratorsABI.json"
const governanceTokenAddress = "../rainbowkit/constants/governanceTokenAddress.json"
const governanceTokenABI = "../rainbowkit/constants/governanceTokenABI.json"
const governorContractAddress = "../rainbowkit/constants/governorContractAddress.json"
const governorContractABI = "../rainbowkit/constants/governorContractABI.json"

/* Variables for updating interface frontend */

const DAOModeratorsAddress = "../interface/constants/daoModeratorsAddress.json"
const DAOModeratorsABI = "../interface/constants/DAOModeratorsABI.json"
const GovernanceTokenAddress = "../interface/constants/governanceTokenAddress.json"
const GovernanceTokenABI = "../interface/constants/GovernanceTokenABI.json"
const GovernorContractAddress = "../interface/constants/governorContractAddress.json"
const GovernorContractABI = "../interface/constants/GovernorContractABI.json"

module.exports = {
  developmentChains,
  daoModeratorsAddress,
  daoModeratorsABI,
  governanceTokenAddress,
  governanceTokenABI,
  governorContractAddress,
  governorContractABI,
  DAOModeratorsAddress,
  DAOModeratorsABI,
  GovernanceTokenAddress,
  GovernanceTokenABI,
  GovernorContractAddress,
  GovernorContractABI,
  DAO_MODERATORS: {
    NAME: "Lulox",
    EMAIL: "lulox.eth@protonmail.com",
    MODERATOR_ADDRESS: "0xfBD9Ca40386A8C632cf0529bbb16b4BEdB59a0A0",
    NEW_MODERATORS: [
      {
        NAME: "Jigglypuff",
        EMAIL: "jiggly@puff.com",
        MODERATOR_ADDRESS: "0x820fb393d946194BFd5d3e07475c84a812f0C176",
      },
      {
        NAME: "Metapod",
        EMAIL: "meta@pod.com",
        MODERATOR_ADDRESS: "0x82e67Fb485B9E29A3cd2E6FDfa789e4220324671",
      },
    ],
    SET_NEW_MODERATOR_FN: "setNewModerator",
  },
  GOVERNANCE_TOKEN: {
    NAME: "GovernanceToken",
    SYMBOL: "GT",
    // Total supply of ERC20Votes
    TOTAL_SUPPLY: 300,
  },
  GOVERNOR_CONTRACT: {
    NAME: "QuadraticVoting",
    /**
     * Delay, in number of block, between the proposal is created and the vote
     * starts. This can be increassed to leave time for users to buy voting power,
     * or delegate it, before the voting of a proposal starts.
     */
    INITIAL_VOTING_DELAY: 1,
    /**
     * Delay, in number of blocks, between the vote start and vote ends.
     * 45115 blocks is approximately one week.
     *
     * For testing purposes, we are using lower values.
     */
    INITIAL_VOTING_PERIOD: 100,
    /**
     * Minimum delay, in number of blocks, between the vote start and vote
     * ends. 25780 blocks is approximately 4 days.
     *
     * For testing purposes, we are using lower values.
     */
    INITIAL_MINIMUM_VOTING_PERIOD: 60,
    // The number of votes required in order for a voter to become a proposer
    INITIAL_PROPOSAL_THRESHOLD: 10,
    // Quorum is specified as `numerator / denominator`. By default the denominator
    // is 100.
    QUORUM_NUMERATOR_VALUE: 4,
  },
}
