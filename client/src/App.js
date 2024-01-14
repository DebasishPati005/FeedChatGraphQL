import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signin from './Auth/Signin';
import Signup from './Auth/Signup';
import Navbar from './common/Navbar';
import PageNotFound from './common/PageNotFound';
import AllPosts from './AllPosts/AllPosts';
import SinglePost from "./SinglePost/SinglePost"


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/" replace />;
  } else {
    return children;
  }
};


const App = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="signin" element={<Signin />} />
      <Route path="post/:postId" element={<ProtectedRoute><SinglePost /></ProtectedRoute>} />
      <Route path="all-posts" element={<ProtectedRoute><AllPosts /></ProtectedRoute>} />
      <Route path="/" element={<Signup />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </Router>
);

export default App;
