'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const HeaderDelayed = () => {
  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowComponent(true);
    }, 1000); // 3000 milliseconds = 3 seconds

    return () => {
      clearTimeout(timeout); // Clean up the timeout when the component unmounts
    };
  }, []);

  if (!showComponent) {
    return null; // or render a loading state if desired
  }

  return <Header />;
};

const Header = () => {
  return (
    <header className='header'>
      <div className='container'>
        <div className='logo'>
          <Link href='/'>Traversy Media</Link>
        </div>
        <div className='links'>
          <Link href='/about'>About</Link>
          <Link href='/about/team'>Our Team</Link>
          <Link href='/code/repos'>Code</Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderDelayed;