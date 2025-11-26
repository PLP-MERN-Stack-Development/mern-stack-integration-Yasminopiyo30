// AuthContext.js - Authentication context provider

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGIN_FAIL':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    loading: false,
    isAuthenticated: false,
    user: null,
    error: null,
  });

  // Check if user is logged in on initial load
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: user,
      });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const data = await authService.login({ email, password });
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data.user,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAIL',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const data = await authService.register(userData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data.user,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAIL',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};