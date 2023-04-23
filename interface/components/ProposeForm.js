import {
  FormControl,
  Button,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"
import { useContractWrite } from "wagmi"
import { ethers } from "ethers"
import * as Yup from "yup"
import {
  GovernorContractABI,
  governorContractAddress,
  DAOModeratorsABI,
  daoModeratorsAddress,
  CurrentChain,
  ChainList,
} from "../constants"

const ProposeSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  moderatorAddress: Yup.string()
    .test((address) => ethers.utils.isAddress(address))
    .required("Required"),
})

const getCalldata = (name, email, moderatorAddress) => {
  const _interface = new ethers.utils.Interface(DAOModeratorsABI)
  return _interface.encodeFunctionData("setNewModerator", [name, email, moderatorAddress])
}

export function ProposeForm() {
  /* Replace with an automatic solution */
  let currentChain = ChainList[CurrentChain["default"]]
  const GovernorContractAddresses = governorContractAddress[currentChain]
  const DAOModeratorsAddresses = daoModeratorsAddress[currentChain]
  const GovernorContractAddress = GovernorContractAddresses[GovernorContractAddresses.length - 1]
  const DAOModeratorsAddress = DAOModeratorsAddresses[DAOModeratorsAddresses.length - 1]

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const { write } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: GovernorContractAddress,
    contractInterface: GovernorContractABI,
    functionName: "propose",
    onSuccess() {
      toast({
        title: "Proposal submitted correctly!",
        status: "success",
        duration: 9000,
        containerStyle: {
          maxHeight: "500px",
        },
        isClosable: true,
      })
    },
    onError(error) {
      const minimumVotingPeriodNotReached = error.reason?.includes("Voting period should be longer")

      if (minimumVotingPeriodNotReached) {
        toast({
          title: "Minimum voting period not reached",
          description: "Please submit a proposal after current proposals voting period ends",
          status: "error",
          duration: 15000,
          containerStyle: {
            maxHeight: "500px",
          },
          isClosable: true,
        })
      } else {
        toast({
          title: "Error submitting the proposal",
          description: error.message ? error.message : JSON.stringify(error),
          status: "error",
          duration: 9000,
          containerStyle: {
            maxHeight: "500px",
          },
          isClosable: true,
        })
      }
    },
  })

  return (
    <>
      {/* <button style={{ margin: "0 16px" }} onClick={onOpen}>
        Propose a new moderator
      </button> */}
      <Button
        bgColor={"#2a9d8f"}
        _hover={{ bgColor: "#e9c46a", color: "#000", border: 0 }}
        onClick={onOpen}
      >
        Propose a new moderator
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="#333" backdropFilter="auto" backdropInvert="80%" backdropBlur="2px" />
        <ModalContent bg="#e9c46a" border="white 1px solid">
          <ModalHeader color={"black"}>Propose a new moderator for the DAO</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              name: "",
              email: "",
              moderatorAddress: "",
            }}
            validationSchema={ProposeSchema}
            onSubmit={(values, actions) => {
              const { name, email, moderatorAddress } = values
              write({
                recklesslySetUnpreparedArgs: [
                  [DAOModeratorsAddress],
                  [0],
                  [getCalldata(name, email, moderatorAddress)],
                  `Proposing moderator ${name} with email ${email} and wallet address ${moderatorAddress}`,
                ],
              })
              actions.setSubmitting(false)
              onClose()
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <ModalBody pb={6} color={"black"}>
                  <Field name="name">
                    {({ field }) => (
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input {...field} placeholder="Name" bgColor={"white"} />
                        {errors.name && touched.name && <span>{errors.name}</span>}
                      </FormControl>
                    )}
                  </Field>

                  <Field name="email">
                    {({ field }) => (
                      <FormControl mt={4}>
                        <FormLabel>Email</FormLabel>
                        <Input {...field} placeholder="Email" bgColor={"white"} />
                        {errors.email && touched.email && <span>{errors.email}</span>}
                      </FormControl>
                    )}
                  </Field>

                  <Field name="moderatorAddress">
                    {({ field }) => (
                      <FormControl>
                        <FormLabel>Wallet address</FormLabel>
                        <Input {...field} placeholder="Wallet address" bgColor={"white"} />
                        {errors.moderatorAddress && touched.moderatorAddress && (
                          <span>{errors.moderatorAddress}</span>
                        )}
                      </FormControl>
                    )}
                  </Field>
                </ModalBody>

                <ModalFooter>
                  <Button
                    type="submit"
                    bgColor={"#e76f51"}
                    _hover={{ bgColor: "#2a9d8f", border: 0, color: "white" }}
                  >
                    Submit
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  )
}
