import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
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
        messages.map((m, i) => {
          const isOwn = m.sender._id === user._id;
          const isLatestOwn =
            isOwn && i === messages.length - 1;

          return (
            <div style={{ display: "flex", flexDirection: "column" }} key={m._id}>
              <div style={{ display: "flex" }}>
                {(isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                  <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                    <Avatar
                      mt="7px"
                      mr={1}
                      size="sm"
                      cursor="pointer"
                      name={m.sender.name}
                      src={m.sender.pic}
                    />
                  </Tooltip>
                )}
                <span
                  style={{
                    backgroundColor: `${isOwn ? "#BEE3F8" : "#B9F5D0"}`,
                    marginLeft: isSameSenderMargin(messages, m, i, user._id),
                    marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                  }}
                >
                  {m.content}
                </span>
              </div>

              {/* ✅ Show status for latest message sent by current user */}
              {isLatestOwn && (
                <Box pl="60px" mt="2px">
                  <Text fontSize="xs" color="gray.500">
                    {m.status === "seen"
                      ? "Seen"
                      : m.status === "delivered"
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
