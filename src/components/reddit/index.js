import React, { useEffect, useState } from "react";
//import ReactDOM from "react-dom";

// 1. Destructure the `subreddit` from props:
export default function Reddit({ subreddit }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // 2. Use a template string to set the URL:
      const res = await fetch(
        `https://www.reddit.com/r/${subreddit}.json`
      );

      const json = await res.json();
      setPosts(json.data.children.map(c => c.data));
    }

    fetchData();

    // 3. Re-run this effect when `subreddit` changes:
  }, [subreddit, setPosts]);

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

// 4. Pass "reactjs" as a prop:
/*ReactDOM.render(
  <Reddit subreddit='reactjs' />,
  document.querySelector("#root")
);*/