import React, { useEffect, useRef, useState } from "react";
import { DEFAULT_TIME } from "../constants/time";

export const Timer = React.memo(() => {
  const [count, setCount] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setCount((prev) => (prev > 0 ? prev - 1000 : 0));
    }, 1000);

    return () => clearInterval(intervalRef.current as ReturnType<typeof setInterval>);
  }, [isRunning]);

  useEffect(() => {
    if (count === 0) {
      clearInterval(intervalRef.current as ReturnType<typeof setInterval>);
    }
  }, [count]);

  return (
    <div>
      <p>{count / 1000} seconds</p>
      <button onClick={() => setIsRunning(!isRunning)}>{isRunning ? "Stop" : "Start"}</button>
      <button onClick={() => setCount(DEFAULT_TIME)}>Reset</button>
    </div>
  );
});
