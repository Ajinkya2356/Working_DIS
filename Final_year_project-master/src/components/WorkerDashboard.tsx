import React, { useEffect, useRef, useState } from 'react';
import WorkerStats from "./WorkerStats";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { useNavigate } from "react-router-dom";
import Webcam from 'react-webcam';
import useErrorNotifier from '../hooks/useErrorNotifier';
import { useDispatch } from 'react-redux';
import { getAnalytics } from '../slices/inspectionSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const WorkerDashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(true);

  const startInspection = () => {
    setIsCapturing(false);
    navigate('/checkpoints')
  };

  useEffect(() => {
    dispatch(getAnalytics())
  }, [dispatch])

  useErrorNotifier({ stateName: 'inspection' });

  return (
    <>
      <div className="min-h-screen bg-gray-900 flex flex-1 flex-col w-full mt-20 text-white">
        <div className="grid grid-cols-12 gap-4 p-6 w-full">
          <div className="col-span-12 lg:col-span-8 space-y-4 w-full">
            <div className="col-span-12 lg:col-span-8 w-full">
              <div className="bg-gray-900 p-4 shadow-md rounded-md ">
                <WorkerStats />
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-4 w-full">
            <div className="bg-gray-900 p-4 shadow-md rounded-md w-full">
              <h2 className="text-lg font-semibold mb-2 bg-gray-800 p-2 rounded-md">Live Camera Feed</h2>
              <div className="h-80 bg-gray-300 rounded flex items-center justify-center">
                {isCapturing ? (
                  <img
                    src='http://localhost:3000/video_feed'
                    alt="Live Feed"
                    crossOrigin="anonymous"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600">Live Feed Placeholder</span>
                )}
              </div>
              <button
                onClick={startInspection}
                className="mt-4 w-full p-2 rounded bg-green-500 hover:bg-green-600 text-white"
              >
                Start Capture
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkerDashboard;
