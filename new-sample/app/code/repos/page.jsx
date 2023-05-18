'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaStar, FaCodeBranch, FaEye } from 'react-icons/fa';

async function fetchRepos() {
  const response = await fetch(
    'https://api.github.com/users/bradtraversy/repos',
    {
      next: {
        revalidate: 60,
      },
    }
  );

  await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 1 second

  const repos = await response.json();
  return repos;
}

const ReposPage = () => {
  const [repos, setRepos] = useState(null);
  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedRepos = await fetchRepos();
      setRepos(fetchedRepos);
      setShowComponent(true);
    };

    const timeout = setTimeout(fetchData, 1000); // 3000 milliseconds = 3 seconds

    return () => {
      clearTimeout(timeout); // Clean up the timeout when the component unmounts
    };
  }, []);

  if (!showComponent || !repos) {
    return null; // or render a loading state if desired
  }

  return (
    <div className='repos-container'>
      <h2>Repositories</h2>
      <ul className='repo-list'>
        {repos.map((repo) => (
          <li key={repo.id}>
            <Link href={`/code/repos/${repo.name}`}>
              <h3>{repo.name}</h3>
              <p>{repo.description}</p>
              <div className='repo-details'>
                <span>
                  <FaStar /> {repo.stargazers_count}
                </span>
                <span>
                  <FaCodeBranch /> {repo.forks_count}
                </span>
                <span>
                  <FaEye /> {repo.watchers_count}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReposPage;