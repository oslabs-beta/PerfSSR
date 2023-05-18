export const metadata = {
  title: 'About Traversy Media',
};

import React from 'react'

const AboutPage = async () => {

  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');

  // await new Promise((resolve) => setTimeout(resolve, 3000)); 
  const testJson = await response.json();
  console.log("testjson", testJson);

  return (
    <div>
      <h1>About Traversy Media</h1>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Suscipit
        molestiae ipsam, et aut consequatur ipsum voluptates quasi, quos
        recusandae doloribus provident consequuntur amet nobis est voluptate
        perferendis quaerat distinctio saepe dolores perspiciatis ex ab nostrum
        eaque! Porro perspiciatis possimus, sed a quidem sunt sit doloremque
        molestiae maiores blanditiis quasi quod.
      </p>
    </div>
  );
};
export default AboutPage;
