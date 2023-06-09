import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import { CheckIcon, InfoIcon, UnlockIcon } from "@chakra-ui/icons"
import { useState } from "react"
import { Field, Form, Formik } from "formik"
import { BigNumber, ethers } from "ethers"
import * as Yup from "yup"
import { useAccount, useContractRead, useContractWrite } from "wagmi"
import { supportEnum, proposalStateEnum } from "../shared/constants"
import { ProposalBlockTimestamp, ProposalVotes, TotalVotingPower } from "./index"
import {
  GovernorContractABI,
  governorContractAddress,
  daoModeratorsAddress,
  CurrentChain,
  ChainList,
} from "../constants"

export function Proposal({ availableVoting = 0, hasVoted = false, proposal, onlySuccessful }) {
  /* Replace with an automatic solution */
  let currentChain = ChainList[CurrentChain["default"]]
  const GovernorContractAddresses = governorContractAddress[currentChain]
  const DAOModeratorsAddresses = daoModeratorsAddress[currentChain]
  const GovernorContractAddress = GovernorContractAddresses[GovernorContractAddresses.length - 1]
  const DAOModeratorsAddress = DAOModeratorsAddresses[DAOModeratorsAddresses.length - 1]

  const { isConnected } = useAccount()
  const [justVoted, setJustVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [proposalState, setProposalState] = useState("")
  const [error, setError] = useState("")

  const { calldatas, deadline, description, proposalId, snapshot } = proposal
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const _availableVoting = Math.floor(Math.sqrt(availableVoting))
  const votingWeightOptions = [...Array(_availableVoting).keys()].map((e) => e.toString())
  const supportOptions = Object.keys(supportEnum)

  const VotingSchema = Yup.object().shape({
    support: Yup.string().oneOf(supportOptions).required("Required"),
    votingWeight: Yup.string().oneOf(votingWeightOptions).required("Required"),
  })

  useContractRead({
    addressOrName: GovernorContractAddress,
    contractInterface: GovernorContractABI,
    functionName: "state",
    args: proposalId,
    onSuccess(data) {
      setIsLoading(false)
      if (data || data === 0) {
        setProposalState(proposalStateEnum[data])
      }
    },
    onError(error) {
      setIsLoading(false)
      setError(error)
    },
    watch: true,
  })

  const { write } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: GovernorContractAddress,
    contractInterface: GovernorContractABI,
    functionName: "vote",
    onSuccess() {
      setJustVoted(true)
      toast({
        title: "Vote submitted succesfully",
        status: "success",
        duration: 9000,
        isClosable: true,
      })
    },
    onError(error) {
      toast({
        title: "Error casting your vote",
        description: error.message ? error.message : JSON.stringify(error),
        status: "error",
        duration: 9000,
        containerStyle: {
          maxHeight: "500px",
        },
        isClosable: true,
      })
    },
  })

  const descriptionHash = ethers.utils.id(description)

  const { write: execute } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: GovernorContractAddress,
    contractInterface: GovernorContractABI,
    functionName: "execute",
    onSuccess() {
      toast({
        title: "Proposal executed succesfully",
        status: "success",
        duration: 9000,
        isClosable: true,
      })
    },
    onError(error) {
      toast({
        title: "Error executing proposal",
        description: error.message ? error.message : JSON.stringify(error),
        status: "error",
        duration: 9000,
        containerStyle: {
          maxHeight: "500px",
        },
        isClosable: true,
      })
    },
  })

  const canVote =
    proposalState === "Active" && _availableVoting !== 0 && hasVoted ? !hasVoted : !justVoted

  function handleVote() {
    if (canVote) {
      onOpen()
    }
  }

  return (
    <>
      {error && (
        <span className="error">
          Error: {error.message ? error.message : JSON.stringify(error)}
        </span>
      )}
      {isLoading && <span>Loading proposal state ...</span>}
      {((onlySuccessful && proposalState === "Succeeded") || !onlySuccessful) && (
        <Box bgColor="#e9c46a" color="#333" margin="12px" padding="24px" borderRadius="12px">
          <Heading as="h3" size="sm" marginBottom="16px">
            {description}
          </Heading>
          <Grid templateColumns="repeat(12, 1fr)" gap={4}>
            <GridItem colSpan={6}>
              <ProposalVotes proposalId={proposalId} />
            </GridItem>
            <GridItem colSpan={6}>
              <ProposalBlockTimestamp blockTimestamp={snapshot} />
              <ProposalBlockTimestamp blockTimestamp={deadline} deadline />
              <p>
                <InfoIcon /> {proposalState}
              </p>
              {(hasVoted || justVoted) && (
                <p>
                  <CheckIcon color="blue" /> Vote casted
                </p>
              )}
            </GridItem>
          </Grid>

          {canVote && isConnected && (
            <Container display="flex" justifyContent="space-around" marginTop="16px">
              <div>
                <TotalVotingPower />
                <p>
                  <UnlockIcon /> <b>Available votes:</b> {availableVoting} votes
                </p>
              </div>
              <button className="primary-button" onClick={handleVote}>
                Vote
              </button>
            </Container>
          )}
          {onlySuccessful && proposalState === "Succeeded" && (
            <Container display="flex" justifyContent="center" marginTop="16px">
              <button
                className="primary-button"
                onClick={() =>
                  execute({
                    recklesslySetUnpreparedArgs: [
                      [DAOModeratorsAddress],
                      [0],
                      calldatas,
                      descriptionHash,
                    ],
                  })
                }
              >
                Execute proposal
              </button>
            </Container>
          )}
        </Box>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="#333" backdropFilter="auto" backdropInvert="80%" backdropBlur="2px" />
        <ModalContent bg="#f4a261" color="#333">
          <ModalHeader>
            Vote for &quot;{description.substring(0, 80)}
            {description.length > 80 && "..."}&quot;
          </ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              support: "",
              votingWeight: "",
            }}
            validationSchema={VotingSchema}
            onSubmit={(values, actions) => {
              let { support, votingWeight } = values
              support = BigNumber.from(support)
              votingWeight = BigNumber.from(votingWeight)

              write({
                recklesslySetUnpreparedArgs: [proposalId, votingWeight, support],
              })
              actions.setSubmitting(false)
              onClose()
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <ModalBody pb={6}>
                  <Field name="support">
                    {({ field }) => (
                      <FormControl>
                        <FormLabel>Your support for this proposal</FormLabel>
                        <Select bgColor={"white"} id="support" onChange={field.onChange}>
                          <option>- select an option -</option>
                          {supportOptions.map((key, i) => (
                            <option key={i} value={key}>
                              {supportEnum[key]}
                            </option>
                          ))}
                        </Select>
                        {errors.support && touched.support && <span>{errors.support}</span>}
                      </FormControl>
                    )}
                  </Field>

                  <Field name="votingWeight">
                    {({ field }) => (
                      <FormControl>
                        <FormLabel>Your voting weight for this proposal</FormLabel>
                        <Select bgColor="white" id="votingWeight" onChange={field.onChange}>
                          {votingWeightOptions.map((weight) => (
                            <option key={weight} value={weight}>
                              {weight}
                            </option>
                          ))}
                        </Select>
                        {errors.votingWeight && touched.votingWeight && (
                          <span>{errors.votingWeight}</span>
                        )}
                      </FormControl>
                    )}
                  </Field>
                </ModalBody>

                <ModalFooter>
                  <Button
                    bgColor={"#2a9d8f"}
                    color={"#FFF"}
                    _hover={{ background: "#e76f51", border: 0 }}
                    type="submit"
                  >
                    Submit
                  </Button>

                  {/* <button type="submit">Submit</button> */}
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  )
}
