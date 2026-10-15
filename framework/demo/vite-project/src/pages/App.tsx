import { useCallback, useEffect, useMemo, useState } from "react";
import { CountButton } from "@/components/CountButton";
import { useUser } from "@/contexts/useUser";
import { Timer } from "@/components/Timer";
import { routes } from "@/constants/routes";
import { Link } from "react-router";
import { useQueryPosts } from "@/api/posts/queries/query-posts";
import { useDebounce } from "@/hooks/useDebounce";

export const App = () => {
  const [count, setCount] = useState(0);
  const [toggle, setToggle] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce({ value: search });

  const { data: posts } = useQueryPosts();

  const { updateUser } = useUser();

  const countMemo = useMemo(() => {
    return count * 2;
  }, [count]);

  const updateCount = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  useEffect(() => {
    console.log("debouncedSearch", debouncedSearch);
  }, [debouncedSearch]);

  return (
    <>
      <Timer />
      <p>countMemo: {countMemo}</p>
      <Link to={routes.DASHBOARD_HOME}>Home</Link>
      <section id="center">
        <CountButton count={count} onCount={updateCount} />
        <button onClick={() => setToggle(!toggle)}>Toggle</button>
        <button onClick={() => updateUser("John Doe")}>Set User</button>
        <Link to="/11">Details</Link>
      </section>
      <input type="text" onChange={(e) => setSearch(e.target.value)} />
      {posts?.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </div>
      ))}
    </>
  );
};
