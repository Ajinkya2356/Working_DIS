import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logoutUser } from '../slices/userSlice';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { loading, userData, isAuthenticated } = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logoutUser());
    }
    return (
        <div className="fixed top-0 w-full z-10 text-white">
            <nav className="bg-gray-800 shadow-md p-4 flex justify-between items-center w-full ">
                <div className='flex items-center gap-5'>
                    <img src="../../logo.jpg" alt="Logo" className="w-12 h-12 rounded-full" />

                    {isAuthenticated && userData?.user_role === 'worker' && (
                        <div>
                            <button className='bg-gray-800 text-md' onClick={() => {
                                navigate('/dashboard');
                            }}>Home</button>
                            <button className='bg-gray-800 text-md' onClick={() => navigate('/myinspections')}>Inspections</button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-white">Loading...</div>
                ) : (
                    isAuthenticated && (
                        <>
                            <div className="flex items-center space-x-6">
                                <img
                                    src={userData?.photo || 'https://via.placeholder.com/40'}
                                    alt="Worker Profile"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div className="flex flex-col items-start space-y-1">
                                    <p className="text-white font-semibold">{userData?.name}</p>
                                    <p className="text-gray-300 text-sm">Employee ID: {userData?.reg_no}</p>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300 ease-in-out shadow-md"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    )
                )}
            </nav>
        </div>
    );
};

export default Navbar;