import React, { useEffect, useContext, useState } from 'react';
import { connectAndJoin, disconnect } from '../app/Context';
import { useDispatch, useSelector } from "react-redux";
import { newMessage, selectWebsocket } from "../modules/websocket";
import { UserContext } from '../app/UserContext';
import { useHistory } from 'react-router-dom';

export default function DebugPage() {
  const history = useHistory();
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

  const openConnection = () => {
    connectAndJoin(dispatch);
  }

  const closeConnection = () => {
    disconnect(dispatch);
  }

  const handleLogin = () => {
    history.push("/login");
  }

  const logout = () => {
    userContext.logout();
  }

  const authenticateWithBackend = () => {

  }

  const handleSetDisplayName = () => {
    userContext.setDisplayName("Overwritten Name");
  };

  return (
    <>

      <h6>User Info</h6>
      <div>
        <div>Login Status: {userContext.loginStatus}</div>
        <div>Display Name: {userContext.displayName}</div>
        <div>Email: {userContext.email}</div>
        <div>Last Signin: {userContext.lastSignInTime}</div>
        <div>Token: {userContext.idToken}</div>
        <div>Token Expiration: ??</div>
      </div>

      <h6>Websocket Console</h6>
      <div>
        <div>Connection Status: { websocket.status } </div>
        <button onClick={openConnection}>openConnection</button>
        <button onClick={closeConnection}>closeConnection</button>
        <button onClick={handleLogin}>login</button>
        <button onClick={logout}>logout</button>
        <button onClick={handleSetDisplayName}>set displayName</button>
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
