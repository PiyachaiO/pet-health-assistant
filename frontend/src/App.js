import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Users from './pages/Users'; // Import the Users component
import PetProfile from './pages/PetProfile';
import EditPetProfile from './pages/EditPetProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import NutritionRecommendation from './pages/NutritionRecommendation';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import VetDashboard from './pages/VetDashboard';
import EditProfile from './pages/EditProfile'; // Import EditProfile
import Profile from './pages/Profile'; // Import Profile
import ManageArticles from './pages/ManageArticles'; // Import ManageArticles
import ArticleForm from './pages/ArticleForm'; // Import ArticleForm
import Pets from './pages/Pets'; // Import Pets
import VetApplicationPage from './pages/VetApplicationPage'; // Import VetApplicationPage
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster />
        <Router>
          <Navbar />
          <div className="container mx-auto mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/users" element={<Users />} /> {/* Add the route for Users */}
            <Route path="/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
            <Route path="/pets/:id" element={<ProtectedRoute><PetProfile /></ProtectedRoute>} />
            <Route path="/pets/:id/edit" element={<ProtectedRoute><EditPetProfile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/vet-dashboard" element={<ProtectedRoute requiredRole={["veterinarian"]}><VetDashboard /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} /> {/* Add EditProfile route */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> {/* Add Profile route */}
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/articles/new" element={<ProtectedRoute requiredRole={["admin", "veterinarian"]}><ArticleForm /></ProtectedRoute>} />
            <Route path="/articles/edit/:id" element={<ProtectedRoute requiredRole={["admin", "veterinarian"]}><ArticleForm /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><NutritionRecommendation /></ProtectedRoute>} />
            <Route path="/nutrition/guidelines" element={<ProtectedRoute><NutritionRecommendation /></ProtectedRoute>} />
            <Route path="/pets/:petId/nutrition" element={<ProtectedRoute><NutritionRecommendation /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/vet-application" element={<ProtectedRoute><VetApplicationPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/vet" element={<ProtectedRoute requiredRole="vet"><VetDashboard /></ProtectedRoute>} />
            {/* Redirect old admin routes to main articles page */}
            <Route path="/admin/articles" element={<ProtectedRoute requiredRole={["admin", "veterinarian"]}><Articles /></ProtectedRoute>} />
            <Route path="/admin/articles/new" element={<ProtectedRoute requiredRole={["admin", "veterinarian"]}><ArticleForm /></ProtectedRoute>} />
            <Route path="/admin/articles/edit/:id" element={<ProtectedRoute requiredRole={["admin", "veterinarian"]}><ArticleForm /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
