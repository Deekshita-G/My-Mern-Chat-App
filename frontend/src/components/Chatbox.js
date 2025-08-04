import { Box } from "@chakra-ui/layout";
import { useEffect } from "react";
import axios from "axios";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, user } = ChatState();

  // Mark messages as seen when a chat is opened
  useEffect(() => {
  const markAsSeen = async () => {
    if (!selectedChat || !user) return;

    try {
      await axios.put(
        `/api/message/${selectedChat._id}/seen`,
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
  };

  markAsSeen();
}, [selectedChat, user]); // ✅ include 'user' here


  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
