import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Register from '../component/register.tsx';
import Login from '../component/login.tsx';

const AuthLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');

    const toggleForm = () => {
        setIsLogin(!isLogin);
        navigate(isLogin ? '/auth' : '/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button 
                            onClick={toggleForm}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
                
                {isLogin ? <Login /> : <Register />}
            </div>
        </div>
    );
};

export default AuthLayout;