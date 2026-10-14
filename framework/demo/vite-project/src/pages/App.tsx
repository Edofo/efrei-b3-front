import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { CountButton } from "../components/CountButton";
import { useUser } from "../contexts/useUser";
import { Timer } from "../components/Timer";
import { routes } from "../constants/routes";
import { Link } from "react-router";
import { useQueryPosts } from "@/api/posts/queries/query-posts";

export const App = () => {
  const [count, setCount] = useState(0);
  const [toggle, setToggle] = useState(false);

  const { data: posts } = useQueryPosts();

  const { user, setUser } = useUser();

  const countMemo = useMemo(() => {
    return count * 2;
  }, [count]);

  const updateCount = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  return (
    <>
      <Timer />
      <p>countMemo: {countMemo}</p>
      <Link to={routes.DASHBOARD_HOME}>Home</Link>
      <section id="center">
        <CountButton count={count} onCount={updateCount} />
        <button onClick={() => setToggle(!toggle)}>Toggle</button>
        <button onClick={() => setUser("John Doe")}>Set User</button>
      </section>
      {posts?.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </div>
      ))}
    </>
  );
};
