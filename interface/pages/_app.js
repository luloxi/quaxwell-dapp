import * as React from "react"
import { WagmiConfig, chain, configureChains, createClient } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { globalCSS } from "../styles/globalCSS"

const theme = extendTheme(globalCSS)

const { provider, webSocketProvider } = configureChains(
  [chain.hardhat],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: "https://polygon-mumbai.g.alchemy.com/v2/n-dS9QE4hHURuOL2I222A7pVqer60TCf",
      }),
    }),
  ]
)

const client = createClient({
  connectors: [new InjectedConnector({ chains: [chain.hardhat] })],
  provider,
  webSocketProvider,
})

function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={client}>
        <Component {...pageProps} />
      </WagmiConfig>
    </ChakraProvider>
  )
}

export default App
