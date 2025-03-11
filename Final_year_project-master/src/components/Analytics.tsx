import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const data = [
    { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
    { name: 'Aug', uv: 3000, pv: 2400, amt: 2400 },
    { name: 'Sep', uv: 2000, pv: 1398, amt: 2210 },
    { name: 'Oct', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Nov', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Dec', uv: 2390, pv: 3800, amt: 2500 }
];

const pieData = [
    { name: 'Pass meters', value: 400 },
    { name: 'Fail meters', value: 100 },
];

const meterModelData = [
    { name: 'Model A', pass: 200, fail: 200 },
    { name: 'Model B', pass: 150, fail: 150 },
    { name: 'Model C', pass: 100, fail: 200 },
    { name: 'Model D', pass: 50, fail: 150 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics = () => {
    return (
        <div className="flex flex-col p-2 bg-gray-900 min-h-screen">
            {/*  <h1 className="text-4xl font-bold text-white mb-6">Analytics Dashboard</h1> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4 text-center">Total Meters Checked</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <h2 className="text-xl font-semibold text-white mb-4">Average Meters Checked</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="pv" stroke="#82ca9d" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Correct vs Incorrect Meters</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-700 py-4 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">Today</h3>
                            <ResponsiveContainer width="100%" height={200} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <PieChart>
                                    <Legend verticalAlign="top" align="right" />
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-gray-700 py-4 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">This Week</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Legend verticalAlign="top" align="right" />
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-gray-700 py-4 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">This Month</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Legend verticalAlign="top" align="right" />
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-gray-700 py-4 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">Custom Date Range</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Legend verticalAlign="top" align="right" />
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className='flex flex-row justify-between gap-1 px-2'>
                                <div className="mb-4 flex flex-col justify-start w-1/2 gap-2">
                                    <label className="text-white">Start Date:</label>
                                    <input type="date" className="p-1 rounded w-full" />
                                </div>
                                <div className="mb-4 flex flex-col justify-start w-1/2 gap-2">
                                    <label className="text-white">End Date:</label>
                                    <input type="date" className="p-1 rounded w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg my-4">
                <h2 className="text-xl font-semibold text-white mb-4">Total Meter Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={meterModelData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="pass" stackId="a" fill="green" width={150} />
                        <Bar dataKey="fail" stackId="a" fill="red" width={150} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Analytics;