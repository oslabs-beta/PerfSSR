
// import Course from './Course';

// const Courses = ({ courses }) => {
//   return (
//     <div className='courses'>
//       {courses.map((course) => (
//         <Course key={course.id} title={course.title} level = {course.level} 
//          description={course.description} link={course.link}/>
//       ))}
//     </div>
//   );
// };
// export default Courses;

import React, { useEffect, useState } from 'react';
import Course from './Course';

const withRenderThrottle = (Component, delay) => {
  const ThrottledComponent = (props) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => {
        clearTimeout(timeoutId);
      };
    }, []);

    if (!shouldRender) {
      return null;
    }

    return <Component {...props} />;
  };

  return ThrottledComponent;
};

const Courses = ({ courses }) => {
  const ThrottledCourses = withRenderThrottle(Course, 1000); // Throttle the rendering to once every 1000 milliseconds (1 second)

  return (
    <div className='courses'>
      {courses.map((course) => (
        <ThrottledCourses
          key={course.id}
          title={course.title}
          level={course.level}
          description={course.description}
          link={course.link}
        />
      ))}
    </div>
  );
};

export default Courses;