import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "./lib/api";
import BottomNav from "./components/BottomNav";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Course from "./pages/Course";
import Lesson from "./pages/Lesson";
import Profile from "./pages/Profile";

/** Redirect to login if not authenticated. */
function RequireAuth({ children }: { children: JSX.Element }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

/** Pages that show the bottom navigation bar. */
const NAV_ROUTES = ["/", "/learn", "/profile"];

function Layout() {
  const location = useLocation();
  const showNav = NAV_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + "/")
  ) && location.pathname !== "/login";

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/learn"
          element={
            <RequireAuth>
              {/* /learn just redirects to home for now; expand to content library later */}
              <Navigate to="/" replace />
            </RequireAuth>
          }
        />
        <Route
          path="/course/:courseId"
          element={
            <RequireAuth>
              <Course />
            </RequireAuth>
          }
        />
        <Route
          path="/lesson/:courseId/:lessonId"
          element={
            <RequireAuth>
              <Lesson />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
