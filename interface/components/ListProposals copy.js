import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useAccount, useBlockNumber, useContractRead, useProvider } from "wagmi"
import { HasVoted, Proposal } from "./index"
import { GovernorContractABI, governorContractAddress, CurrentChain, ChainList } from "../constants"

export function ListProposals({ onlyActive, onlySuccessful, availableVoting }) {
  /* Replace with an automatic solution */
  let currentChain = ChainList[CurrentChain["default"]]
  const GovernorContractAddress = governorContractAddress[currentChain][0]

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [proposals, setProposals] = useState([])
  const [votingPeriod, setVotingPeriod] = useState(0)

  const { isConnected } = useAccount()
  const provider = useProvider()

  useContractRead({
    addressOrName: GovernorContractAddress,
    contractInterface: GovernorContractABI,
    functionName: "votingPeriod",
    onSuccess(data) {
      setVotingPeriod(data.toNumber())
    },
    onError(error) {
      setError(error)
    },
  })

  useEffect(() => {
    const governorContract = new ethers.Contract(
      GovernorContractAddress,
      GovernorContractABI,
      provider
    )
    let eventFilter = governorContract.filters.ProposalCreated()

    const { data: blockNumber } = useBlockNumber({ watch: true })
    const blockMinusVotingPeriod = blockNumber - votingPeriod

    provider
      .getLogs({
        ...eventFilter,
        fromBlock:
          onlyActive && votingPeriod !== 0
            ? blockMinusVotingPeriod > 0
              ? blockMinusVotingPeriod
              : 0
            : "earliest",
        toBlock: "latest",
      })
      .then((logs) => {
        setIsLoading(false)
        let proposals = logs.filter((log) => {
          const deadline = governorContract.interface.parseLog(log).args[7].toNumber()
          // If onlyActive, only show proposals where deadline is greater than blockNumber
          // Else, show everything
          return onlyActive ? deadline >= blockNumber : true
        })

        proposals = proposals.map((log) => {
          const [proposalId, , , , , calldatas, snapshot, deadline, description] =
            governorContract.interface.parseLog(log).args

          return {
            calldatas,
            deadline,
            description,
            proposalId,
            snapshot,
          }
        })
        setProposals(proposals)
      })
      .catch((error) => {
        setIsLoading(false)
        setError(error)
      })
  }, [blockNumber, onlyActive, provider, votingPeriod])

  return (
    <>
      {error && (
        <span className="error">
          Error: {error.message ? error.message : JSON.stringify(error)}
        </span>
      )}
      {isLoading && <span>Loading DAO proposals ...</span>}
      {proposals.length > 0 &&
        proposals.map((proposal, i) =>
          isConnected ? (
            <HasVoted proposalId={proposal.proposalId} key={i}>
              <Proposal
                key={i}
                proposal={proposal}
                availableVoting={availableVoting}
                onlySuccessful={onlySuccessful}
              />
            </HasVoted>
          ) : (
            <Proposal
              key={i}
              proposal={proposal}
              availableVoting={availableVoting}
              onlySuccessful={onlySuccessful}
            />
          )
        )}
    </>
  )
}
