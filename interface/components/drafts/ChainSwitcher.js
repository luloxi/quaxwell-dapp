import { useMoralis } from "react-moralis"
// import React from "react"

// Try to do something like this but with Wagmi
export function ChainSwitcher({ contractAddressFile }) {
  const { chainId: chainIdHex } = useMoralis()
  const chainId = parseInt(chainIdHex)

  try {
    const contractData = require(`../constants/${contractName}.json`)
    if (contractData[chainId]) {
      return contractData[chainId]
    } else {
      console.log(`Contract address not found for contract ${contractName} on chainId ${chainId}`)
    }
  } catch (error) {
    console.log(`Failed to load contract data for ${contractName}: ${error}`)
  }

  // Return a default value or handle the case when contract address is not found
  return null
}

// May be called like this on another component

// const [GovernorContractAddress, setGovernorContractAddress] = useState("") // State to hold the contract address

// useEffect(() => {
//   // Fetch the contract address on component mount or whenever contractName prop changes
//   const fetchData = async () => {
//     const address = await ChainSwitcher({ contractAddressFile: "governorContractAddress" }) // Call the ChainSwitcher component with desired contractName
//     setContractAddress(address) // Set the contract address to state
//   }
//   fetchData()
// }, []) // Only run this effect on component mount
