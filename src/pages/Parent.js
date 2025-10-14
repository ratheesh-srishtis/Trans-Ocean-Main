import React from "react";

export const Parent = () => {
  const [user] = useState({ name: "john", age: 28 });
  useEffect(() => {}, []);
  return <div>Parent</div>;
};
