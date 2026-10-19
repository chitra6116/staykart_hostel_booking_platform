import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Guest Pages
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import PhotoCreditsPage from './pages/PhotoCreditsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCalendarPage from './pages/admin/AdminCalendarPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminRoomsPage from './pages/admin/AdminRoomsPage';
import AdminManagePhotosPage from './pages/admin/AdminManagePhotosPage';
import AdminPricingPage from './pages/admin/AdminPricingPage';
import AdminAmenitiesPage from './pages/admin/AdminAmenitiesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Standard public layout with Navbar & Footer
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  {/* Public and Guest routes wrapped in PublicLayout */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/rooms/:id" element={<RoomDetailPage />} />
                    <Route path="/credits" element={<PhotoCreditsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Authenticated Guest Routes */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute guestOnly={true}>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/confirmation/:code"
                      element={
                        <ProtectedRoute guestOnly={true}>
                          <ConfirmationPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-bookings"
                      element={
                        <ProtectedRoute guestOnly={true}>
                          <MyBookingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute guestOnly={true}>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Admin Console Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="calendar" element={<AdminCalendarPage />} />
                    <Route path="properties" element={<AdminPropertiesPage />} />
                    <Route path="rooms" element={<AdminRoomsPage />} />
                    <Route path="photos" element={<AdminManagePhotosPage />} />
                    <Route path="pricing" element={<AdminPricingPage />} />
                    <Route path="amenities" element={<AdminAmenitiesPage />} />
                    <Route path="bookings" element={<AdminBookingsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                  </Route>
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
