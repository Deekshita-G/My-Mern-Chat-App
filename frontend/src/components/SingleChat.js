import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { Flex, HStack, IconButton, Spinner, useToast } from "@chakra-ui/react";
import {
  formatConversationTime,
  getSender,
  getSenderFull,
} from "../config/ChatLogics";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { getSocket } from "../config/socket";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const selectedChatRef = useRef();
  const typingTimeoutRef = useRef();
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { selectedChat, setSelectedChat, user, setNotification } = ChatState();

  const markMessagesAsSeen = useCallback(
    async (chatId) => {
      if (!chatId || !user) {
        return;
      }

      try {
        await axios.put(
          `/api/message/${chatId}/seen`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
      } catch (error) {
        console.error("Failed to mark messages as seen", error);
      }
    },
    [user]
  );

  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      await markMessagesAsSeen(selectedChat._id);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleSendMessage = async () => {
    const messageContent = newMessage.trim();

    if (!messageContent || !selectedChat) {
      return;
    }

    socketRef.current?.emit("stop typing", selectedChat._id);
    setTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setNewMessage("");

      const { data } = await axios.post(
        "/api/message",
        {
          content: messageContent,
          chatId: selectedChat._id,
        },
        config
      );

      setMessages((previousMessages) => [...previousMessages, data]);
      socketRef.current?.emit("send message", data);
      setFetchAgain((previousState) => !previousState);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to send the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSendMessage();
    }
  };

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const socket = getSocket();
    socketRef.current = socket;

    const handleConnected = () => setSocketConnected(true);
    const handleTyping = (roomId) => {
      if (roomId === selectedChatRef.current?._id) {
        setIsTyping(true);
      }
    };
    const handleStopTyping = (roomId) => {
      if (!roomId || roomId === selectedChatRef.current?._id) {
        setIsTyping(false);
      }
    };
    const handleReceiveMessage = async (incomingMessage) => {
      const activeChatId = selectedChatRef.current?._id;
      const incomingChatId = incomingMessage?.chat?._id;

      if (activeChatId && incomingChatId === activeChatId) {
        setMessages((previousMessages) => {
          if (previousMessages.some((message) => message._id === incomingMessage._id)) {
            return previousMessages;
          }

          return [...previousMessages, incomingMessage];
        });

        await markMessagesAsSeen(incomingChatId);
      } else {
        setNotification((previousNotifications) => {
          if (previousNotifications.some((message) => message._id === incomingMessage._id)) {
            return previousNotifications;
          }

          return [incomingMessage, ...previousNotifications];
        });
      }

      setFetchAgain((previousState) => !previousState);
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("setup", user);
    socket.on("connected", handleConnected);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);
    socket.on("receive message", handleReceiveMessage);

    return () => {
      socket.off("connected", handleConnected);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
      socket.off("receive message", handleReceiveMessage);
      socket.disconnect();
    };
  }, [markMessagesAsSeen, user, setFetchAgain, setNotification]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;

    if (!selectedChat) {
      setMessages([]);
      setIsTyping(false);
      return undefined;
    }

    fetchMessages();
    socketRef.current?.emit("join room", selectedChat._id);

    return () => {
      socketRef.current?.emit("leave room", selectedChat._id);
      socketRef.current?.emit("stop typing", selectedChat._id);
    };
    // eslint-disable-next-line
  }, [selectedChat]);

  const typingHandler = (event) => {
    setNewMessage(event.target.value);

    if (!socketConnected || !selectedChat) {
      return;
    }

    if (!typing) {
      setTyping(true);
      socketRef.current?.emit("typing", selectedChat._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 2500);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={4}
            px={1}
            w="100%"
            fontFamily="Work Sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
              borderRadius="full"
            />
            {!selectedChat.isGroupChat ? (
              <HStack spacing={3}>
                <Box>
                  <Text fontSize={{ base: "2xl", md: "3xl" }}>
                    {getSender(user, selectedChat.users)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Online chat room
                  </Text>
                </Box>
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </HStack>
            ) : (
              <HStack spacing={3}>
                <Box>
                  <Text fontSize={{ base: "2xl", md: "3xl" }}>
                    {selectedChat.chatName}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {selectedChat.users.length} members
                  </Text>
                </Box>
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </HStack>
            )}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(243,244,246,0.88) 100%)"
            w="100%"
            h="100%"
            borderRadius="2xl"
            overflowY="hidden"
            borderWidth="1px"
            borderColor="blackAlpha.100"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={handleKeyDown} id="message-input" isRequired mt={3}>
              {istyping ? (
                <Flex align="center" gap={2} pl={2}>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 8, marginLeft: 0 }}
                  />
                  <Text fontSize="xs" color="gray.500">
                    typing...
                  </Text>
                </Flex>
              ) : null}
              <Flex gap={2} align="center">
                <Input
                  variant="filled"
                  bg="white"
                  borderRadius="full"
                  placeholder="Write a message"
                  value={newMessage}
                  onChange={typingHandler}
                  _focus={{
                    borderColor: "orange.300",
                    boxShadow: "0 0 0 1px #fdba74",
                  }}
                />
                <IconButton
                  aria-label="Send message"
                  icon={<ArrowForwardIcon />}
                  colorScheme="orange"
                  borderRadius="full"
                  onClick={handleSendMessage}
                  isDisabled={!newMessage.trim()}
                />
              </Flex>
              {selectedChat?.latestMessage?.createdAt && (
                <Text mt={2} fontSize="xs" color="gray.500" textAlign="right" pr={2}>
                  Updated {formatConversationTime(selectedChat.latestMessage.createdAt)}
                </Text>
              )}
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            pb={3}
            fontFamily="Work Sans"
            textAlign="center"
            color="gray.600"
          >
            Pick a conversation and your messages will appear here in real time
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
