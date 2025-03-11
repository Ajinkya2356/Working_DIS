import React, { useState, useRef } from 'react';

const CameraSetup: React.FC = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    console.log(isCameraOn)
    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraOn(true);
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraOn(false);
        }
    };

    return (
        <div className="flex flex-row min-h-screen w-full">
            <div className="flex flex-col items-center justify-center p-4 bg-gray-900 justify-between flex-1">
                <h1 className="text-4xl font-bold mt-10">Camera Setup</h1>
                <div className="my-auto rounded-lg">
                    <video ref={videoRef} className="w-full h-96 bg-black" autoPlay></video>
                </div>

            </div>
            <div className="w-full flex flex-col gap-5 max-w-md bg-gray-900 shadow-md rounded-lg p-10">
                <h2 className="text-xl font-bold mb-5 bg-gray-800 p-2 mb-3 rounded-lg">Settings</h2>
                <div className="flex gap-10 justify-between mb-4 w-full">
                    <button
                        onClick={startCamera}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 w-1/2"
                    >
                        Start Camera
                    </button>
                    <button
                        onClick={stopCamera}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 w-1/2"
                    >
                        Stop Camera
                    </button>
                </div>
                <div className="flex gap-10 justify-between mb-4 w-full">
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700 w-1/2">
                        Retry
                    </button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 w-1/2">
                        Capture
                    </button>
                </div>
                <div className="bg-yellow-100 text-yellow-800 p-2 rounded">
                    <p>Warning: Ensure proper lighting for best results.</p>
                </div>
                <div className="mb-2">
                    <label className="block text-white bg-gray-800 p-2 mb-3 rounded-lg">Resolution:</label>
                    <select className="w-full p-2 rounded">
                        <option>720p</option>
                        <option>1080p</option>
                        <option>4K</option>
                    </select>
                </div>
                <div className="mb-2">
                    <label className="block text-white bg-gray-800 p-2 mb-3 rounded-lg">Frame Rate:</label>
                    <select className="w-full p-2 rounded">
                        <option>30 FPS</option>
                        <option>60 FPS</option>
                        <option>120 FPS</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CameraSetup;