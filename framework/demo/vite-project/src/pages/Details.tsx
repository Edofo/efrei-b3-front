import { useParams } from "react-router";

export const Details = () => {
  const { id } = useParams();
  return (
    <div>
      <h1>Details</h1>
      <p>ID: {id}</p>
    </div>
  );
};
