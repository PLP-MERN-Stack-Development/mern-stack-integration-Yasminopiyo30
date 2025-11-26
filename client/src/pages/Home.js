// Home.js - Home page component

import React from 'react';
import { Link } from 'react-router-dom';
import PostList from '../components/PostList';

const Home = () => {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to MERN Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A full-stack blog application built with MongoDB, Express.js, React.js, and Node.js.
          Explore our latest posts and join our community today.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Posts</h2>
          <Link
            to="/posts"
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            View all posts &rarr;
          </Link>
        </div>
        
        <PostList />
      </div>
    </div>
  );
};

export default Home;