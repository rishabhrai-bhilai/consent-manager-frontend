// RequireAuth.js
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthProvider';

const RequireAuth = ({ allowedRole }) => {
    const { auth } = useAuth(); // Assuming `auth` contains user info (e.g., `auth.role`)
    const location = useLocation();

    // If user is not logged in, redirect to login page
    if (!auth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is logged in but doesn't have the required role, redirect to unauthorized page
    const hasRequiredRole = auth.role === allowedRole;

    return hasRequiredRole
        ? <Outlet />
        : <Navigate to="/unauthorized" state={{ from: location }} replace />;
};

export default RequireAuth;