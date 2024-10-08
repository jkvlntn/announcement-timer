import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import io from "socket.io-client";

const Timer = ({ identifier }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [paused, setPaused] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const SERVER_URL = process.env.REACT_APP_SERVER_URL || "";
    const socket = io(`${SERVER_URL}`, {
      transports: ["websocket"],
    });

    socket.on(`update${identifier}`, (timeRemaining, paused) => {
      setTimeRemaining(timeRemaining);
      setPaused(paused);
    });

    const onFocus = () => {
      socket.emit(`get${identifier}`);
    };

    window.addEventListener("focus", onFocus);

    socket.emit(`get${identifier}`);

    return () => {
      window.removeEventListener("focus", onFocus);
      socket.off(`update${identifier}`);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let interval = null;

    if (!paused) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paused]);

  return (
    <div
      className={`outer-box ${
        searchParams.get("dark") === "1" ? "dark-mode" : ""
      }`}
    >
      <h4>Time Remaining in Server {identifier}</h4>
      <div className={`timer-box ${paused ? "red" : ""}`}>
        {timeRemaining !== null ? (
          <div>
            {Math.max(0, Math.floor(timeRemaining / 60))}
            <span className="special">:</span>
            {timeRemaining % 60 < 10 ? "0" : ""}
            {Math.max(0, timeRemaining % 60)}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default Timer;
