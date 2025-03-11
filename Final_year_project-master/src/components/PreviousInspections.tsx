import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';


const PreviousInspections: React.FC = () => {
    const { inspections, inspectionsLoading } = useSelector((state: any) => state.inspection);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };
    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    };

    if (inspectionsLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="bg-gray-900 p-4 shadow-md rounded-md flex flex-col flex-1">
            <h2 className="text-lg font-semibold mb-2 bg-gray-800 p-2 rounded-md">Previous Inspection Results</h2>
            <div className="relative w-full px-2">
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 mx-2 rounded-full shadow-md focus:outline-none"
                >
                    &lt;
                </button>
                <div ref={scrollContainerRef} className="flex mx-10 p-4 
                overflow-x-hidden overflow-x-auto whitespace-nowrap ">
                    {
                        (inspections.map((inspection) => (
                            <div key={inspection.id} className="w-56 mx-4 p-2">
                                <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full transform transition-transform hover:scale-105 ">
                                    <img
                                        src={inspection?.meter_details?.photo}
                                        alt={`Meter ${inspection?.serial_no}`}
                                        className="w-full h-50 object-cover rounded-t-lg mb-4"
                                    />
                                    <div className="bg-gray-800 rounded-lg transform transition-transform hover:scale-105">
                                        <div className='flex justify-between px-2'>
                                            <div className=' flex-1 text-left'>
                                                {['Serial No', 'Model', 'Date', 'Status', 'Client'].map((entry, index) => (
                                                    <div key={index} className="text-white font-semibold text-sm mb-2">{entry}</div>
                                                ))}
                                            </div>
                                            <div className=' flex-1 text-left'>
                                                <div className="text-white font-semibold text-sm mb-2">{inspection?.serial_no}</div>
                                                <div className="text-white font-semibold text-sm mb-2">{inspection?.meter_details?.model}</div>
                                                <div className="text-white font-semibold text-sm mb-2">{formatDate(inspection?.date)}</div>
                                                <div className={`font-semibold text-sm mb-2 ${inspection?.status === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {inspection?.status.toUpperCase()}
                                                </div>
                                                <div className="text-white font-semibold text-sm mb-2">{inspection?.client}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )))
                    }
                </div>
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md mx-2 focus:outline-none"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default PreviousInspections;