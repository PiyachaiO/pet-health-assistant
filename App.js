import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './src/pages/Home';
import Users from './src/pages/Users';
import PetProfile from './src/pages/PetProfile';
import EditPetProfile from './src/pages/EditPetProfile';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Dashboard from './src/pages/Dashboard';
import Appointments from './src/pages/Appointments';
import Articles from './src/pages/Articles';
import ArticleDetail from './src/pages/ArticleDetail';
import NutritionRecommendation from './src/pages/NutritionRecommendation';
import Notifications from './src/pages/Notifications';
import AdminDashboard from './src/pages/AdminDashboard';
import VetDashboard from './src/pages/VetDashboard';
import EditProfile from './src/pages/EditProfile';
import Profile from './src/pages/Profile';
import ManageArticles from './src/pages/ManageArticles';
import ArticleForm from './src/pages/ArticleForm';
import Pets from './src/pages/Pets';
import ProtectedRoute from './src/components/ProtectedRoute';
import { AuthProvider } from './src/contexts/AuthContext';
import Navbar from './src/components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
          <Route path="/pets/:id" element={<ProtectedRoute><PetProfile /></ProtectedRoute>} />
          <Route path="/pets/:id/edit" element={<ProtectedRoute><EditPetProfile /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/nutrition" element={<ProtectedRoute><NutritionRecommendation /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/vet-dashboard" element={<ProtectedRoute><VetDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/manage-articles" element={<ProtectedRoute><ManageArticles /></ProtectedRoute>} />
          <Route path="/articles/new" element={<ProtectedRoute><ArticleForm /></ProtectedRoute>} />
          <Route path="/articles/:id/edit" element={<ProtectedRoute><ArticleForm /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
