import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Jobs from "./pages/public/Jobs";
import JobDetails from "./pages/public/JobDetails";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import EmployerLogin from "./pages/auth/EmployerLogin";

import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerProfile from "./pages/employer/EmployerProfile";
import PostJob from "./pages/employer/PostJob";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminJobs from "./pages/admin/AdminJobs";

import Home from "./pages/public/Home";
import QualificationJobs from "./pages/public/QualificationJobs";
import Footer from "./components/Footer";
import { QUALIFICATIONS } from "./lib/qualifications";

import BecomeEmployer from "./pages/public/BecomeEmployer";
import AdminEmployers from "./pages/admin/AdminEmployers";

import AboutUs from "./pages/static/AboutUs";
import ContactUs from "./pages/static/ContactUs";
import PrivacyPolicy from "./pages/static/PrivacyPolicy";
import TermsConditions from "./pages/static/TermsConditions";
import Disclaimer from "./pages/static/Disclaimer";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />

        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Static qualification landing pages (SEO) */}
          {QUALIFICATIONS.map(({ value, slug }) => (
            <Route
              key={slug}
              path={`/${slug}`}
              element={<QualificationJobs qualification={value} />}
            />
          ))}

          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employer-login" element={<EmployerLogin />} />

          {/* Static pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/disclaimer" element={<Disclaimer />} />

          {/* Employer protected pages */}
          <Route
            path="/employer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerProfile />
              </ProtectedRoute>
            }
          />

          {/* Public - Become Employer */}
<Route path="/become-employer" element={<BecomeEmployer />} />

{/* Admin - Approve Employers */}
<Route path="/admin/employers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminEmployers /></ProtectedRoute>} />

          <Route
            path="/employer/post-job"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <PostJob />
              </ProtectedRoute>
            }
          />

          {/* Admin pages */}
<Route path="/admin" element={<AdminLogin />} />
<Route path="/admin/login" element={<AdminLogin />} />

<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/jobs"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminJobs />
    </ProtectedRoute>
  }
/>

          {/* Unknown route */}
          <Route
            path="*"
            element={
              <div className="page-shell">
                <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
                  <div className="card max-w-md p-8 text-center">
                    <h2 className="text-2xl font-bold text-ink">Page not found</h2>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
              <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;