import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Code splitting: each page loads on demand
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Farms = lazy(() => import('./pages/Farms'));
const Crops = lazy(() => import('./pages/Crops'));
const CropDetail = lazy(() => import('./pages/CropDetail'));
const Weather = lazy(() => import('./pages/Weather'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Resources = lazy(() => import('./pages/Resources'));
const Orders = lazy(() => import('./pages/Orders'));
const Forum = lazy(() => import('./pages/Forum'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Consultations = lazy(() => import('./pages/Consultations'));
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Suspense fallback={<div className="text-center py-5">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/farms" element={<Farms />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/crops/:id" element={<CropDetail />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:id" element={<PostDetail />} />
              <Route path="/consultations" element={<Consultations />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
