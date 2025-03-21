"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import { useSelector } from "react-redux";

export default function ChatPage() {
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [receiver, setReceiver] = useState("");
  const [friendName, setFriendName] = useState("Chat With Friends");
  const URL = process.env.NEXT_PUBLIC_API_URL;
  const SOCKET = process.env.NEXT_PUBLIC_SOCKET_URL;
  const data = useSelector((state) => state.chat);

  useEffect(() => {
    const socket = io("wss://chatapi-nrs0.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });
    setSocket(socket);
    socket.emit("registerUser", data.user?._id);
    socket.on("receiveMessage", (message) => {
      console.log("📥 Received Message:", message);
      setMessages((prevMessages) => ({
        ...prevMessages,
        [message.msg_name]: [
          ...(prevMessages[message.msg_name] || []),
          { text: message.text, sender: "friend" },
        ],
      }));
    });
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prevMessages) => ({
      ...prevMessages,
      [receiver.msg_name]: [
        ...(prevMessages[receiver.msg_name] || []),
        { text: input, sender: "You" },
      ],
    }));

    socket.emit(
      "sendMessage",
      JSON.stringify({
        text: input,
        sender: "You",
        senderId: data.user?._id,
        reciverId: receiver._id,
        msg_name: receiver.msg_name,
      })
    );
    setInput("");
  };
  console.log(messages);

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#1f2937] via-[#6b7280] to-[#ffffff] overflow-hidden">
      <Sidebar
        setReceiver={setReceiver}
        setFriendName={setFriendName}
        URL={URL}
      />
      <div className="flex-1 flex flex-col h-full">
        <Navbar friendName={friendName} URL={URL} />
        <ChatMessage messages={messages} receiver={receiver} URL={URL} />
        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          receiver={receiver}
          URL={URL}
        />
      </div>
    </div>
  );
}

/*  useEffect(
    function () {
      async function saveMessage() {
        if (Object.keys(messages).length !== 0) {
          console.log("enter");
          const msg_name = {
            messages,
          };
          try {
            const fetch_data = await axios.post(
              "http://localhost:3000/api/v1/messages/send",
              msg_name ,
              { withCredentials: true }
            );
            console.log("fetch : ", fetch_data);
          } catch (error) {
            console.log(error);
          }
        }
      }
      saveMessage();
    },
    [messages]
  );
*/
