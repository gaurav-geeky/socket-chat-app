import { useState } from "react";
import Chat from "./Chat";

function App() {
  const [username, setUsername] = useState("");

  const joinChat = () => {
    const name = prompt("Enter your name");
    if (name) setUsername(name);
  };

  return (
    <div style={{ padding: "20px" }}>
      {username ?
        (
          <Chat username={username} />
        ) :
        (
          <button onClick={joinChat}>Join Chat</button>
        )
      } 
    </div>
  );
}

export default App;
