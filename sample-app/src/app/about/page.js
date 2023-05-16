export const metadata = {
  title: 'New Next App Demo - About Page',
}

import React from 'react'

const About = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');

  // await new Promise((resolve) => setTimeout(resolve, 3000)); 
  const testJson = await response.json();
  console.log("testjson", testJson);

  return (
    <div>
      <h1>About Page</h1>
    </div>
  )
}

export default About