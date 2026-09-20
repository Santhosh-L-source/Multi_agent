import { useState } from "react";

function Chat() {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const sendMessage = async () => {

        if (!message.trim()) {
            return;
        }

        const token = localStorage.getItem("access_token");

        const userMessage = message;

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: userMessage
            }
        ]);

        setMessage("");

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        message: userMessage,
                        account_id: 5,
                        session_id: "session-1"
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to get response"
                );
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.response
                }
            ]);

        } catch (error) {

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: error.message
                }
            ]);
        }
    };

    return (
        <div>

            <h2>🤖 Bank AI Assistant</h2>

            <div>

                {messages.map((msg, index) => (

                    <div key={index}>

                        <strong>
                            {msg.role === "user"
                                ? "You"
                                : "AI"}
                        </strong>

                        <p>{msg.content}</p>

                    </div>

                ))}

            </div>

            <input
                type="text"
                placeholder="Ask something..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }}
            />

            <button onClick={sendMessage}>
                Send
            </button>

        </div>
    );
}

export default Chat;