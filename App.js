import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './frontend/src/pages/Home';
import Users from './frontend/src/pages/Users';
import PetProfile from './frontend/src/pages/PetProfile';
import EditPetProfile from './frontend/src/pages/EditPetProfile';
import Login from './frontend/src/pages/Login';
import Register from './frontend/src/pages/Register';
import Dashboard from './frontend/src/pages/Dashboard';
import Appointments from './frontend/src/pages/Appointments';
import Articles from './frontend/src/pages/Articles';
import ArticleDetail from './frontend/src/pages/ArticleDetail';
import NutritionRecommendation from './frontend/src/pages/NutritionRecommendation';
import Notifications from './frontend/src/pages/Notifications';
import AdminDashboard from './frontend/src/pages/AdminDashboard';
import VetDashboard from './frontend/src/pages/VetDashboard';
import EditProfile from './frontend/src/pages/EditProfile';
import Profile from './frontend/src/pages/Profile';
import ManageArticles from './frontend/src/pages/ManageArticles';
import ArticleForm from './frontend/src/pages/ArticleForm';
import Pets from './frontend/src/pages/Pets';
import ProtectedRoute from './frontend/src/components/ProtectedRoute';
import { AuthProvider } from './frontend/src/contexts/AuthContext';
import Navbar from './frontend/src/components/Navbar';

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
