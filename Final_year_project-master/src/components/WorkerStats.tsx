import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import CountUp from "react-countup";

const WorkerStats: React.FC = () => {
    const { analytics, analyticsLoading, error } = useSelector((state: any) => state.inspection);

    if (analyticsLoading) {
        return <div className="text-white text-center">Loading...</div>
    }

    return (
        <div className="bg-gray-900 flex flex-col gap-5 p-6">
            <h2 className="text-white text-lg font-semibold p-2 bg-gray-800 rounded-md">Inspection Analytics</h2>

            {error ? (
                <div className="text-red-500 text-center">Error: {error}</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Total Meters */}
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 shadow-lg rounded-md flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105">
                        <p className="text-white">Total Meters</p>
                        <h2 className="text-4xl font-semibold">
                            <CountUp end={analytics?.total || 0} duration={2} />
                        </h2>
                    </div>

                    {/* Correct Meters */}
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 shadow-lg rounded-md flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105">
                        <p className="text-white">Correct Meters</p>
                        <h2 className="text-4xl font-semibold text-white">
                            <CountUp end={analytics?.correct || 0} duration={2} />
                        </h2>
                    </div>

                    {/* Incorrect Meters */}
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 shadow-lg rounded-md flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105">
                        <p className="text-white">Incorrect Meters</p>
                        <h2 className="text-4xl font-semibold text-white">
                            <CountUp end={analytics?.incorrect || 0} duration={2} />
                        </h2>
                    </div>
                </div>
            )}

            <h2 className="text-white text-lg font-semibold p-2 bg-gray-800 rounded-md mt-6">Today's Metrics</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Today's Total Meters */}
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 shadow-lg rounded-md flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105">
                    <p className="text-white">Total Meters</p>
                    <h2 className="text-4xl font-semibold">
                        <CountUp end={analytics?.today_total || 0} duration={2} />
                    </h2>
                </div>

                {/* Today's Correct Meters */}
                <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 shadow-lg rounded-md flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105">
                    <p className="text-white">Correct Meters</p>
                    <h2 className="text-4xl font-semibold text-white">
                        <CountUp end={analytics?.today_correct || 0} duration={2} />
                    </h2>
                </div>

                {/* Today's Incorrect Meters */}
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 shadow-lg rounded-md flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105">
                    <p className="text-white">Incorrect Meters</p>
                    <h2 className="text-4xl font-semibold text-white">
                        <CountUp end={analytics?.today_incorrect || 0} duration={2} />
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default WorkerStats;