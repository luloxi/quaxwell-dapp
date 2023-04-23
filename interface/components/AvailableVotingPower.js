import React from "react"
import { useState } from "react"
import { useContractRead } from "wagmi"
import { GovernorContractABI, governorContractAddress, CurrentChain, ChainList } from "../constants"

export function AvailableVotingPower({ children }) {
  /* Replace with an automatic solution */
  let currentChain = ChainList[CurrentChain["default"]]
  const GovernorContractAddresses = governorContractAddress[currentChain]
  const GovernorContractAddress = GovernorContractAddresses[GovernorContractAddresses.length - 1]

  const [isLoading, setIsLoading] = useState(true)
  const [availableVoting, setAvailableVoting] = useState(0)
  const [error, setError] = useState("")

  useContractRead({
    addressOrName: GovernorContractAddress,
    contractInterface: GovernorContractABI,
    functionName: "getAvailableVotingPower",
    onSuccess(data) {
      setIsLoading(false)
      setAvailableVoting(data.toNumber())
    },
    onError(error) {
      setIsLoading(false)
      setError(error)
    },
    watch: true,
  })

  return (
    <>
      {error && (
        <span className="error">
          Error: {error.message ? error.message : JSON.stringify(error)}
        </span>
      )}
      {isLoading && <span>Loading available voting power...</span>}
      {React.cloneElement(children, { availableVoting: availableVoting })}
    </>
  )
}
