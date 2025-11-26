// PostList.js - Component to display a list of blog posts

import React from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { postService } from '../services/api';

const PostList = () => {
  const { request, loading, error } = useApi();
  const [posts, setPosts] = React.useState([]);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await request(() => postService.getAllPosts());
        setPosts(data.data);
      } catch (err) {
        // Error is handled by the useApi hook
      }
    };

    fetchPosts();
  }, [request]);

  if (loading) return <div className="text-center py-10">Loading posts...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Latest Blog Posts</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No posts found. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={post.author?.avatar || '/default-avatar.jpg'}
                    alt={post.author?.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{post.author?.name}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt || post.content.substring(0, 100) + '...'}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {post.category?.name}
                  </span>
                  
                  <Link
                    to={`/posts/${post._id}`}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;