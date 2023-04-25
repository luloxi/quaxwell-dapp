import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useAccount, useBlockNumber, useContractRead, useProvider } from "wagmi"
import { HasVoted, Proposal } from "./index"
import { GovernorContractABI, governorContractAddress, CurrentChain, ChainList } from "../constants"

export function ListProposals({ onlyActive, onlySuccessful, availableVoting }) {
  /* Replace with an automatic solution */
  let currentChain = ChainList[CurrentChain["default"]]
  const GovernorContractAddresses = governorContractAddress[currentChain]
  const GovernorContractAddress = GovernorContractAddresses[GovernorContractAddresses.length - 1]

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { isConnected } = useAccount()
  const provider = useProvider()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const [proposals, setProposals] = useState([])
  const [votingPeriod, setVotingPeriod] = useState(0)

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
    // Fetch data from external API hosted on port 3001
    // fetch("http://localhost:3001/proposals")
    fetch("http://localhost:3001/proposals")
      .then((response) => response.json())
      .then((data) => {
        // Update the state with the fetched data
        setProposals(data)
        setIsLoading(false)
      })
      .catch((error) => {
        setError(error)
        setIsLoading(false)
      })
  }, [])

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
