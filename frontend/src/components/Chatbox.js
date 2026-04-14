import { Box } from "@chakra-ui/layout";
import { useEffect } from "react";
import axios from "axios";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, user } = ChatState();

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
  }, [selectedChat, user]);

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="rgba(255, 255, 255, 0.72)"
      backdropFilter="blur(18px)"
      w={{ base: "100%", md: "68%" }}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="whiteAlpha.700"
      boxShadow="0 20px 45px rgba(15, 23, 42, 0.08)"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
