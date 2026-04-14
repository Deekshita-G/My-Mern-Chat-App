import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  formatMessageTime,
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { Box, Text } from "@chakra-ui/layout";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((message, index) => {
          const isOwn = message.sender._id === user._id;
          const isLatestOwn = isOwn && index === messages.length - 1;

          return (
            <div
              style={{ display: "flex", flexDirection: "column" }}
              key={message._id}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: isOwn ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                }}
              >
                {(isSameSender(messages, message, index, user._id) ||
                  isLastMessage(messages, index, user._id)) && (
                  <Tooltip
                    label={message.sender.name}
                    placement="bottom-start"
                    hasArrow
                  >
                    <Avatar
                      mt="7px"
                      mr={1}
                      size="sm"
                      cursor="pointer"
                      name={message.sender.name}
                      src={message.sender.pic}
                    />
                  </Tooltip>
                )}
                <Box
                  bg={
                    isOwn
                      ? "linear-gradient(135deg, #ea580c 0%, #fb923c 100%)"
                      : "white"
                  }
                  color={isOwn ? "white" : "gray.800"}
                  marginLeft={isSameSenderMargin(
                    messages,
                    message,
                    index,
                    user._id
                  )}
                  marginTop={isSameUser(messages, message, index, user._id) ? 2 : 4}
                  borderRadius={isOwn ? "20px 20px 6px 20px" : "20px 20px 20px 6px"}
                  px={4}
                  py={3}
                  maxW={{ base: "84%", md: "75%" }}
                  boxShadow="0 10px 25px rgba(15, 23, 42, 0.08)"
                >
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {message.content}
                  </Text>
                  <Text
                    mt={1}
                    fontSize="xs"
                    textAlign="right"
                    color={isOwn ? "whiteAlpha.800" : "gray.400"}
                  >
                    {formatMessageTime(message.createdAt)}
                  </Text>
                </Box>
              </div>

              {isLatestOwn && (
                <Box
                  pl={{ base: 0, md: "60px" }}
                  mt="2px"
                  display="flex"
                  justifyContent="flex-end"
                >
                  <Text fontSize="xs" color="gray.500">
                    {message.status === "seen"
                      ? "Seen"
                      : message.status === "delivered"
                      ? "Delivered"
                      : "Sent"}
                  </Text>
                </Box>
              )}
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
