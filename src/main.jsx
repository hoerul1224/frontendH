import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import './App.css';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import HealthChecks from './pages/HealthChecks.jsx';
import HealthCheckDetail from './pages/HealthCheckDetail.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Users from './pages/Users.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DCU from './pages/DCU.jsx';
import MCU from './pages/MCU.jsx';
import MCUFollowUp from './pages/MCUFollowUp.jsx';
import ManageMCU from './pages/ManageMCU.jsx';
import BodyComposition from './pages/BodyComposition.jsx';
import ManageBodyComposition from './pages/ManageBodyComposition.jsx';
import RiwayatKonsultasi from './pages/RiwayatKonsultasi.jsx';
import ManageConsultation from './pages/ManageConsultation.jsx';
import ManageDCU from './pages/ManageDCU.jsx';
import MiniMCU from './pages/MiniMCU.jsx';
import ManageMiniMCU from './pages/ManageMiniMCU.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/healthchecks" element={<ProtectedRoute><HealthChecks /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/healthchecks/:id" element={<ProtectedRoute><HealthCheckDetail /></ProtectedRoute>} />
          <Route path="/health/body-composition" element={<ProtectedRoute><BodyComposition /></ProtectedRoute>} />
          <Route path="/admin/body-composition" element={<ProtectedRoute><ManageBodyComposition /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/health/dcu" element={<ProtectedRoute><DCU /></ProtectedRoute>} />
          <Route path="/health/mcu" element={<ProtectedRoute><MCU /></ProtectedRoute>} />
          <Route path="/health/mcu-followup" element={<ProtectedRoute><MCUFollowUp /></ProtectedRoute>} />
          <Route path="/admin/mcu" element={<ProtectedRoute><ManageMCU /></ProtectedRoute>} />
          <Route path="/health/riwayat-konsultasi" element={<ProtectedRoute><RiwayatKonsultasi /></ProtectedRoute>} />
          <Route path="/admin/consultation" element={<ProtectedRoute><ManageConsultation /></ProtectedRoute>} />
          <Route path="/admin/dcu" element={<ProtectedRoute><ManageDCU /></ProtectedRoute>} />
          <Route path="/health/mini-mcu" element={<ProtectedRoute><MiniMCU /></ProtectedRoute>} />
          <Route path="/admin/mini-mcu" element={<ProtectedRoute><ManageMiniMCU /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);