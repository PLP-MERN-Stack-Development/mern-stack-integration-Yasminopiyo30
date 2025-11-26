// PostDetail.js - Component to display a single blog post

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const { request, loading, error } = useApi();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await request(() => postService.getPost(id));
        setPost(data.data);
      } catch (err) {
        // Error is handled by the useApi hook
      }
    };

    fetchPost();
  }, [id, request]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    if (!isAuthenticated) {
      setCommentError('You must be logged in to comment');
      return;
    }

    setAddingComment(true);
    setCommentError('');

    try {
      const response = await postService.addComment(post._id, { content: comment });
      
      // Update the post with the new comment
      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, response.data]
      }));
      
      setComment('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add comment';
      setCommentError(errorMessage);
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading post...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  if (!post) return <div className="text-center py-10">Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/posts" className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mb-6">
        &larr; Back to posts
      </Link>
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <header className="mb-6">
            <div className="flex items-center mb-4">
              <img
                src={post.author?.avatar || '/default-avatar.jpg'}
                alt={post.author?.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span>By {post.author?.name}</span>
                  <span className="mx-2">•</span>
                  <time>{new Date(post.createdAt).toLocaleDateString()}</time>
                  <span className="mx-2">•</span>
                  <span>{post.viewCount} views</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {post.category?.name}
              </span>
            </div>
          </header>
          
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
      
      {/* Comments Section */}
      <section className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Comments ({post.comments?.length || 0})
        </h2>
        
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Add a comment
              </label>
              <textarea
                id="comment"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Write your comment here..."
              ></textarea>
              {commentError && <p className="mt-1 text-sm text-red-600">{commentError}</p>}
            </div>
            <button
              type="submit"
              disabled={addingComment}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {addingComment ? 'Adding...' : 'Add Comment'}
            </button>
          </form>
        ) : (
          <div className="mb-8 text-center py-4">
            <p className="text-gray-600 mb-4">
              Please <Link to="/login" className="text-indigo-600 hover:text-indigo-900">log in</Link> to add a comment.
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start">
                  <img
                    src={comment.user?.avatar || '/default-avatar.jpg'}
                    alt={comment.user?.name}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">{comment.user?.name}</h4>
                      <time className="ml-2 text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostDetail;