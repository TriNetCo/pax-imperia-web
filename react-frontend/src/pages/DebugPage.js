import React, { useEffect, useContext, useState } from 'react';
import { connectAndJoin, disconnect } from '../app/Context';
import { useDispatch, useSelector } from "react-redux";
import { newMessage, selectWebsocket } from "../modules/websocket";
import { UserContext } from '../app/UserContext';

export default function DebugPage() {
  const userContext = useContext(UserContext);
  const [websocketConsole, setWebsocketConsole] = useState("");
  const dispatch = useDispatch();
  const [msgToSend, setMsgToSend] = useState("");
  const websocket = useSelector(selectWebsocket);

  useEffect(() => {
    // doStuff();
  }, [userContext]);

  const sendMessage = () => {
    setWebsocketConsole(websocketConsole + "sent: " + msgToSend + "\n");
    dispatch(newMessage(msgToSend));
  }

  const handleMessageChange = event => {
    setMsgToSend(event.target.value);
  };

  const thingy = () => {
    console.log("The state is: " + websocket.status);
  }

  const openConnection = () => {
    connectAndJoin(dispatch);
  }

  const closeConnection = () => {
    disconnect(dispatch);
  }

  const login = () => {
    userContext.login();
  }

  const logout = () => {
    userContext.logout();
  }

  const authenticateWithBackend = () => {

  }

  return (
    <>

      <h6>User Info</h6>
      <div>
        <div data-testid="login-state">Login State: {userContext.isPendingState}</div>
        <div>Display Name: {userContext.displayName}</div>
        <div>Email: {userContext.email}</div>
        <div>Token: {userContext.idToken}</div>
        <div>Token Expiration: ??</div>
      </div>

      <h6>Websocket Console</h6>
      <div>
        <div>Connection Status: { websocket.status } </div>
        <button onClick={openConnection}>openConnection</button>
        <button onClick={closeConnection}>closeConnection</button>
        <button onClick={login}>login</button>
        <button onClick={logout}>logout</button>
        <button onClick={authenticateWithBackend}>authenticateWithBackend</button>

        <div>
          <textarea value={msgToSend} onChange={handleMessageChange}></textarea>
          <button onClick={sendMessage}>Send Message</button>
        </div>

        <div>
          Server Responses:
          <pre
            id="server-responses">
            {websocketConsole}
          </pre>
        </div>

      </div>

    </>
  );
}
