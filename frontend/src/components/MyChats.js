import { AddIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { Badge, Button, Flex } from "@chakra-ui/react";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  formatConversationTime,
  getSender,
  getSenderFull,
} from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
  } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain, user]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      p={3}
      bg="rgba(255, 255, 255, 0.72)"
      backdropFilter="blur(18px)"
      w={{ base: "100%", md: "31%" }}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="whiteAlpha.700"
      boxShadow="0 20px 45px rgba(15, 23, 42, 0.08)"
      overflow="hidden"
    >
      <Box
        pb={4}
        px={2}
        w="100%"
        borderBottom="1px solid"
        borderColor="blackAlpha.100"
      >
        <Flex justify="space-between" align="center" gap={3}>
          <Box>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontFamily="Work Sans">
              Conversations
            </Text>
            <Text fontSize="sm" color="gray.500">
              Stay in sync with your latest messages
            </Text>
          </Box>
          <GroupChatModal>
            <Button
              colorScheme="orange"
              bg="orange.400"
              _hover={{ bg: "orange.500" }}
              borderRadius="full"
              px={5}
              rightIcon={<AddIcon />}
            >
              Group
            </Button>
          </GroupChatModal>
        </Flex>
      </Box>
      <Box d="flex" flexDir="column" pt={4} w="100%" h="100%" overflowY="hidden">
        {chats ? (
          <Stack overflowY="auto" spacing={3} pr={1}>
            {chats.map((chat) => {
              const unreadCount = notification.filter(
                (item) => item.chat._id === chat._id
              ).length;
              const isSelected = selectedChat?._id === chat._id;

              return (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={
                    isSelected
                      ? "linear-gradient(135deg, #0f766e 0%, #155e75 100%)"
                      : "whiteAlpha.900"
                  }
                  color={isSelected ? "white" : "gray.800"}
                  px={4}
                  py={3}
                  borderRadius="xl"
                  key={chat._id}
                  borderWidth="1px"
                  borderColor={isSelected ? "transparent" : "blackAlpha.100"}
                  boxShadow="sm"
                  transition="all 0.2s ease"
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "md",
                  }}
                >
                  <Flex align="center" gap={3}>
                    <Avatar
                      size="md"
                      name={
                        chat.isGroupChat
                          ? chat.chatName
                          : getSender(loggedUser, chat.users)
                      }
                      src={
                        !chat.isGroupChat
                          ? getSenderFull(loggedUser, chat.users)?.pic
                          : undefined
                      }
                    />
                    <Box flex="1" minW={0}>
                      <Flex align="center" justify="space-between" gap={2}>
                        <Text fontWeight="700" isTruncated>
                          {!chat.isGroupChat
                            ? getSender(loggedUser, chat.users)
                            : chat.chatName}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={isSelected ? "whiteAlpha.800" : "gray.500"}
                          flexShrink={0}
                        >
                          {formatConversationTime(
                            chat.latestMessage?.createdAt || chat.updatedAt
                          )}
                        </Text>
                      </Flex>
                      <Text
                        fontSize="sm"
                        color={isSelected ? "whiteAlpha.900" : "gray.500"}
                        noOfLines={1}
                      >
                        {chat.latestMessage
                          ? `${chat.latestMessage.sender.name}: ${chat.latestMessage.content}`
                          : "No messages yet. Start the conversation."}
                      </Text>
                    </Box>
                    {unreadCount > 0 && (
                      <Badge colorScheme="orange" borderRadius="full" px={2} py={1}>
                        {unreadCount}
                      </Badge>
                    )}
                  </Flex>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
