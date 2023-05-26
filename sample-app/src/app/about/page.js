export const metadata = {
  title: "New Next App Demo - About Page",
};

import React from "react";
import * as fetch from "node-fetch";

export async function fetchTodo() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  return response.json();
}

const About = async () => {
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  const testJson = await fetchTodo;
  console.log("testjson", testJson);

  return (
    <div>
      <h1>About Page</h1>
    </div>
  );
};

export default About;
