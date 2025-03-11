import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../slices/userSlice';
import { useNavigate } from 'react-router-dom';
import useErrorNotifier from '../hooks/useErrorNotifier';
interface LoginForm {
    reg_no: string;
    password: string;
}
const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState<LoginForm>({ reg_no: '', password: '' });
    const { isAuthenticated, userData, loading, error } = useSelector((state: any) => state.user);
    useEffect(() => {
        if (isAuthenticated) {
            if (userData?.user_role === 'admin') {
                navigate('/admin/dashboard');
            } else if (userData?.user_role === 'worker') {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, userData, navigate]);
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        dispatch(loginUser(form));
    };
    useErrorNotifier({ stateName: 'user' });
    return (
        <div className="w-full flex min-h-screen flex-col justify-center items-center bg-gray-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm ">
                <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    Login 
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="worker_id" className="block text-sm font-medium leading-6 text-white text-left">
                            Employee ID
                        </label>
                        <div className="mt-2">
                            <input
                                onChange={(e) => setForm({ ...form, reg_no: e.target.value })}
                                id="worker_id"
                                name="worker_id"
                                type="text"
                                required
                                autoComplete="worker_id"
                                className="block w-full rounded-md border-0 py-1.5 px-2 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-black"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                                Password
                            </label>
                        </div>
                        <div className="mt-2 relative">
                            <input
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-md border-0 py-1.5 pr-10 pl-2 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-black"
                            />

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 cursor-pointer"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d={
                                        showPassword
                                            ? "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                            : "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                    }
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;