import React from 'react';

interface ScreenStatus {
    name: string;
    status: string;
}

interface FinalStatusProps {
    meterDetails: string;
    meterImage: string;
    screenStatuses: ScreenStatus[];
    accuracy: number;
    onRetry: () => void;
    onNext: () => void;
}

const toCapitalCase = (str: string): string => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const FinalStatus: React.FC<FinalStatusProps> = ({ meterDetails, meterImage, screenStatuses, accuracy, onRetry, onNext }) => {
    return (
        <div className="p-8 flex gap-10 w-full justify-around p-5">
            <div className='flex flex-col gap-10 flex-1 items-center pt-5
            bg-gray-800 rounded-lg'>
                <h1 className="text-3xl font-bold">Meter Details</h1>
                <div>
                    <p>{meterDetails}</p>
                </div>
                <div className="mb-4 rounded-lg">
                    <img src={meterImage} alt="Meter" className="w-full max-w-xs" />
                </div>
            </div>
            <div className="mb-4 flex-1 flex flex-col gap-5">
                <h1 className="text-3xl font-semibold">Submission Status</h1>
                <p className='text-justify'>Your submission has been reviewed. Below is a detailed breakdown of the checks that were performed. Please review the results and take the necessary actions if required. If your submission was rejected, you can retry the process or move on to the next meter.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {screenStatuses.map((screen, index) => (
                        <div key={index} className={`p-4 rounded-lg ${screen.status == 'pass' ? "bg-green-500" : "bg-red-500"}`}>
                            <h3 className="text-2xl font-medium">{screen.name}</h3>
                            <p className='text-xl'>{toCapitalCase(screen.status)}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className='flex flex-col gap-10 flex-1'>
                <div className="mb-4 flex items-center bg-gray-800 p-5 rounded-lg">
                    <div className="relative w-20 h-20">
                        <svg className="absolute top-0 left-0 w-full h-full text-gray-200" viewBox="0 0 36 36">
                            <path
                                className="stroke-current"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <svg className="absolute top-0 left-0 w-full h-full text-blue-500" viewBox="0 0 36 36">
                            <path
                                className="stroke-current"
                                strokeWidth="3"
                                fill="none"
                                strokeDasharray={`${accuracy}, 100`}
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h2 className="text-xl font-semibold">Accuracy: {accuracy}%</h2>
                    </div>
                </div>
                <div className="mt-8 flex justify-between gap-10">
                    <button
                        onClick={onRetry}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 w-1/2"
                    >
                        Retry
                    </button>
                    <button
                        onClick={onNext}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300 w-1/2"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinalStatus;