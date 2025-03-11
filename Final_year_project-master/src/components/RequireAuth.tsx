// src/components/RequireAuth.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import { loadUser } from '../slices/userSlice';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
    } else if (token && !isAuthenticated && !loading) {
      dispatch(loadUser());
    } else if (!isAuthenticated && !loading) {
      navigate('/');
    }
  }, [dispatch, isAuthenticated, loading, navigate]);

  if (loading) {
    return <div className='bg-gray-900 text-white min-h-screen min-w-screen flex justify-center items-center'>Loading...</div>;
  }

  return <>{children}</>;
};

export default RequireAuth;