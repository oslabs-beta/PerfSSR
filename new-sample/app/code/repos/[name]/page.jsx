'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Repo from '../../../components/Repo';
import RepoDirs from '../../../components/RepoDirs';

const RepoPage = ({ params: { name } }) => {
  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowComponent(true);
    }, 500); // 3000 milliseconds = 3 seconds

    return () => {
      clearTimeout(timeout); // Clean up the timeout when the component unmounts
    };
  }, []);

  if (!showComponent) {
    return null; // or render a loading state if desired
  }

  return (
    <div className='card'>
      <Link href='/code/repos' className='btn btn-back'>
        Back To Repositories
      </Link>
      <Suspense fallback={<div>Loading repo...</div>}>
        <Repo name={name} />
      </Suspense>
      <Suspense fallback={<div>Loading directories...</div>}>
        <RepoDirs name={name} />
      </Suspense>
    </div>
  );
};

export default RepoPage;