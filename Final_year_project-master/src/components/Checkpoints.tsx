import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkMeter, createInspection, getMeters, resetInspectionStatus, changeCapture, changeMasterImage, changeDiff, resetod, getSerialNumber, changeSerialNumber, saveImages } from '../slices/inspectionSlice';
import useErrorNotifier from '../hooks/useErrorNotifier';
import { set } from 'react-datepicker/dist/date_utils';

enum InspectionStatus {
    pass = 'pass',
    fail = 'fail'
}

interface Inspection {
    serial_no: string;
    status: InspectionStatus | string;
    meter_id: string;
    client: string;
}

const Checkpoints: React.FC = () => {
    const dispatch = useDispatch();
    const { meters, loading, checkLoading, inspectionStatus, capturedImage, masterImage, diffImage, od, serial_no, serialLoading } = useSelector((state) => state.inspection);
    const [operatorInput, setOperatorInput] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [inspectionForm, setInspectionForm] = useState<Inspection>({
        serial_no: '',
        status: '',
        meter_id: '',
        client: ''
    });
    const [currentMeter, setCurrentMeter] = useState<any>();
    const masterRef = useRef<HTMLImageElement>(null);
    const captureRef = useRef<HTMLButtonElement>(null);
    const captureButtonRef = useRef<HTMLButtonElement>(null);
    const retryButtonRef = useRef<HTMLButtonElement>(null);
    const continueButtonRef = useRef<HTMLButtonElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const capture = () => {
        const model_type = meters.find((meter: any) => meter.id === inspectionForm.meter_id).model;
        const captured_data = {
            model_type: model_type,
            master: masterImage,
        }
        dispatch(checkMeter(captured_data));
    };

    const retry = () => {
        dispatch(changeSerialNumber())
        dispatch(changeCapture())
        dispatch(changeDiff())
        dispatch(resetod())
        setInspectionForm({
            serial_no: inspectionForm.serial_no,
            status: '',
            meter_id: inspectionForm.meter_id,
            client: inspectionForm.client
        });
        dispatch(resetInspectionStatus());
    };

    const handleCaptureRetry = () => {
        if (capturedImage) {
            retry();
        } else {
            capture();
        }
    };

    const handleContinue = () => {
        dispatch(saveImages({
            images: [capturedImage, diffImage],
            names: [serial_no, serial_no + "_diff"],
            model_type: currentMeter.model
        }))
        dispatch(createInspection({
            ...inspectionForm,
            serial_no: serial_no,
            status: od ? (operatorInput === 'pass' ? InspectionStatus.pass : InspectionStatus.fail) : (inspectionStatus === 'pass' ? InspectionStatus.pass : InspectionStatus.fail)

        }));
        dispatch(changeCapture());
        dispatch(changeDiff())
        dispatch(changeSerialNumber())
        dispatch(resetod())
        setInspectionForm(prev => ({
            ...prev,
            serial_no: '',
            status: '',
        }));
        dispatch(resetInspectionStatus());
    };

    const handleSubmit = () => {
        dispatch(saveImages({
            images: [capturedImage, diffImage],
            names: [serial_no, serial_no + "_diff"],
            model_type: currentMeter.model
        }))
        dispatch(createInspection({
            ...inspectionForm,
            serial_no: serial_no,
            status: inspectionStatus === 'pass' ? InspectionStatus.pass : InspectionStatus.fail,
        }));
        dispatch(changeCapture());
        dispatch(changeDiff())
        dispatch(changeSerialNumber())
        dispatch(resetod())
        setInspectionForm({
            serial_no: '',
            status: '',
            meter_id: '',
            client: ''
        });
        dispatch(changeMasterImage());
        dispatch(resetInspectionStatus());
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        if (name === 'meter_id') {
            const selectedMeter = meters.find((meter: any) => meter.id === value);
            if (selectedMeter) {
                dispatch(changeMasterImage(selectedMeter.image))
                setCurrentMeter(selectedMeter);
            }
        }
        setInspectionForm({
            ...inspectionForm,
            [name]: value,
        });
    };

    const handleOperatorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOperatorInput(e.target.value);
    };

    useEffect(() => {
        dispatch(getMeters());
    }, [dispatch]);

    useEffect(() => {
        if (inspectionStatus === 'pass' || inspectionStatus === 'fail') {
            const data = {};
            Object.entries(currentMeter).map(([key, value]) => {
                if (key === 'image') {
                    return;
                }
                data[key] = value;
            })
            dispatch(getSerialNumber(data));
        }
    }, [inspectionStatus, od, currentMeter, dispatch]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case ' ':
                    captureButtonRef.current?.click();
                    break;
                case 'ArrowUp':
                    captureButtonRef.current?.click();
                    break;
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    continueButtonRef.current?.click();
                    break;
                case 'Enter':
                    submitButtonRef.current?.click();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useErrorNotifier({ stateName: 'inspection' });

    return (
        <div className="p-4 text-center flex flex-col flex-1 w-full mt-20 text-white bg-gray-900">
            <div className='flex items-center justify-between w-full'>
                <div className="flex gap-5 w-5/2 p-5 bg-gray-800 rounded-md justify-between">
                    <div className="flex flex-col items-center w-1/2 gap-2">
                        <h4 className="text-lg mb-2">Master Image</h4>
                        <img ref={masterRef} src={masterImage} alt="Master Image" className="h-96 w-96 mb-4 rounded-lg" />
                    </div>
                    <div className="flex flex-col items-center w-1/2 gap-2">
                        <h4 className="text-lg mb-2">Captured Image</h4>
                        {capturedImage ? (
                            <img src={capturedImage} alt="Captured Image" className="h-96 w-96 mb-4 rounded-lg" />
                        ) : (
                            <img
                                ref={captureRef}
                                src='http://localhost:3000/video_feed'
                                alt="Live Feed"
                                crossOrigin='anonymous'
                                className="h-96 w-96 mb-4 rounded-lg"
                            />
                        )}
                    </div>
                    {
                        diffImage && (
                            <div className="flex flex-col items-center w-1/2 gap-2">
                                <h4 className="text-lg mb-2">Faults</h4>
                                <img src={diffImage} alt="Master Image" className="h-96 w-96 mb-4 rounded-lg" />
                            </div>
                        )
                    }
                </div>
                <div className='flex flex-col gap-20 pt-3 pb-3 flex-1'>
                    <div className="flex flex-col gap-10 mx-5">
                        <div className='flex flex-col p-2 rounded-md gap-2'>
                            {inspectionStatus ? (
                                <div className={`flex justify-center rounded-md ${inspectionStatus === 'pass' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}>
                                    <p className={`text-semibold text-xl`}>{inspectionStatus.toUpperCase()}</p>
                                </div>
                            ) : checkLoading ? (<p>Loading...</p>) : null}

                            <label htmlFor="meterType" className="text-white text-md bg-gray-800 rounded p-2 text-center">Meter Model</label>
                            <select
                                id="meterType"
                                name="meter_id"
                                className="p-2 rounded-md text-white bg-black"
                                onChange={handleInputChange}
                                disabled={loading}
                                value={inspectionForm.meter_id}
                            >
                                <option value="" disabled>Select Meter Type</option>
                                {meters.map((meter) => (
                                    <option key={meter.id} value={meter.id}>{meter.model}</option>
                                ))}
                            </select>
                            <label htmlFor="serialNumber" className="text-center text-white text-md bg-gray-800 rounded p-2">Serial Number</label>
                            <input
                                id="serialNumber"
                                type="text"
                                name="serial_no"
                                value={serial_no}
                                onChange={handleInputChange}
                                className="p-2 rounded-md text-white bg-black"
                                readOnly
                                required
                            />
                            {
                                od === true && (
                                    <>
                                        <label htmlFor="od" className="flex justify-start text-white text-md">Operator</label>
                                        <select
                                            id="od"
                                            name="operatorInput"
                                            value={operatorInput}
                                            onChange={handleOperatorInput}
                                            className="p-2 rounded-md text-white"
                                            required
                                        >
                                            <option value="" disabled>Select Status</option>
                                            <option value="pass" selected={inspectionStatus === 'pass'}>Pass</option>
                                            <option value="fail" selected={inspectionStatus === 'fail'}>Fail</option>
                                        </select>
                                    </>
                                )
                            }
                            {/*  <button
                                onClick={() => setShowPopup(true)}
                                className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition duration-300 w-full"
                            >
                                Configure
                            </button> */}

                            {showPopup && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-white p-2 rounded-lg shadow-lg">
                                        <h2 className="text-xl mb-4 text-black bg-gray-200 p-3 rounded-md">Configuration</h2>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <h3 className="text-lg mb-2 text-black">Camera Settings</h3>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-md text-black">Camera to Meter Distance</label>
                                                        <span className="p-2 border rounded-md w-1/2 text-black">50 cm</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-md text-black">Camera Height</label>
                                                        <span className="p-2 border rounded-md w-1/2 text-black">150 cm</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-md text-black">Meter Height</label>
                                                        <span className="p-2 border rounded-md w-1/2 text-black">100 cm</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg mb-2 text-black">Set File Storage Directory</h3>
                                                <input
                                                    type="file"
                                                    webkitdirectory="true"
                                                    directory="true"
                                                    className="p-2 border rounded-md"
                                                    onChange={(e) => console.log(e.target.files)}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowPopup(false)}
                                            className="bg-red-500 text-white py-2 my-2 px-4 rounded hover:bg-red-600 transition duration-300"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className='flex justify-between'>
                            <button
                                ref={captureButtonRef}
                                type='submit'
                                onClick={handleCaptureRetry}
                                disabled={checkLoading}
                                className={`text-white py-2 px-4 rounded transition duration-300 w-full 
                                    ${checkLoading
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : !capturedImage
                                            ? 'bg-blue-500 hover:bg-blue-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                    }`}

                            >
                                {capturedImage ? 'Retry' : checkLoading ? 'Processing...' : 'Capture'}
                            </button>
                        </div>
                        <div className='flex justify-between gap-10'>
                            <button
                                ref={continueButtonRef}
                                onClick={handleContinue}
                                disabled={!capturedImage || !inspectionStatus || serial_no == ""}
                                className={`bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-300 w-full ${!capturedImage || !inspectionStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Continue
                            </button>
                            <button
                                ref={submitButtonRef}
                                onClick={handleSubmit}
                                disabled={!capturedImage || !inspectionStatus || serial_no == ""}
                                className={`bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300 w-full ${!capturedImage || !inspectionStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkpoints;