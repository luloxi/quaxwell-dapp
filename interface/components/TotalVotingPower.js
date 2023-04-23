import { useState } from "react"
import { useAccount, useContractRead } from "wagmi"
import { LockIcon } from "@chakra-ui/icons"
import { GovernanceTokenABI, governanceTokenAddress, CurrentChain, ChainList } from "../constants"

export function TotalVotingPower() {
  /* Replace with an automatic solution */
  const currentChain = ChainList[CurrentChain["default"]]
  const GovernanceTokenAddresses = governanceTokenAddress[currentChain]
  const GovernanceTokenAddress = GovernanceTokenAddresses[GovernanceTokenAddresses.length - 1]

  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [totalVoting, setTotalVoting] = useState(0)
  const [error, setError] = useState("")

  useContractRead({
    addressOrName: GovernanceTokenAddress,
    contractInterface: GovernanceTokenABI,
    functionName: "balanceOf",
    args: address,
    onSuccess(data) {
      setIsLoading(false)
      setTotalVoting(data.toNumber())
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
      {isLoading && <span>Loading total voting power balance ...</span>}
      <p>
        <LockIcon /> <b>Total voting power:</b> {totalVoting} votes
      </p>
    </>
  )
}
