import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import Tooltip from '@mui/material/Tooltip';
import { addMeter, captureMaster, deleteMeter, getMeters, resetMasterImage, updateExistMeter } from '../slices/adminSlice';
import '../styles/customScrollbar.css';


const theme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          '& .MuiDataGrid-cell': {
            color: 'white', // Customize cell text color
            backgroundColor: '#1F2937', // Customize cell background color
            borderColor: "white",
            borderWidth: 0.5,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#111828', // Customize column header background color
            color: 'black', // Customize column header text color
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#1F2937', // Customize footer background color
            color: 'white', // Customize footer text color
          },
          '& .MuiTablePagination-root': {
            color: 'white', // Customize pagination text color
          },
          '& .MuiTablePagination-selectIcon': {
            color: 'white', // Customize pagination select icon color
          },
          '& .MuiTablePagination-actions': {
            '& .MuiButtonBase-root': {
              color: 'white', // Customize pagination arrow color
            },
          },
        },
      },
    },
  },
});

interface MeterCrudProps {
  tab: string;
}

interface createMeter {
  model: string;
  description: string;
  photo: File | null;
  com_protocol: string;
  com_configure: {
    'serial_port'?: string;
    'baud_rate'?: string;
    'parity'?: string;
    'stop_bits'?: string;
    'byte_size'?: string;
    'ip'?: string;
    'port'?: string;
    'slave_id': string;
    'register_count': string;
    'serial_no_register': string;
    'date_register': string;
  }
}

interface updateMeter {
  model?: string;
  description?: string;
  photo?: File | null;
  com_protocol?: string;
  com_configure?: {
    'serial_port'?: string;
    'baud_rate'?: string;
    'parity'?: string;
    'stop_bits'?: string;
    'byte_size'?: string;
    'ip'?: string;
    'port'?: string;
    'slave_id'?: string;
    'register_count'?: string;
    'serial_no_register'?: string;
    'date_register'?: string;
  }
}

const modbusFields = [
  'serial_port',
  'baud_rate',
  'parity',
  'stop_bits',
  'byte_size',
]

const ethernetFields = [
  'ip',
  'port',
]

const usbFields = [
  'baud_rate',
  'parity',
  'stop_bits',
  'byte_size',
]

const nameTolabelMap = {
  model: "Meter Name",
  description: "Meter Description",
  com_protocol: "Communication Protocol",
  date_register: "Date Register",
  serial_no_register: "Serial No Register",
  slave_id: "Slave ID",
  register_count: "Register Count",
  serial_port: "Serial Port",
  baud_rate: "Baud Rate",
  parity: "Parity",
  stop_bits: "Stop Bits",
  byte_size: "Byte Size",
  ip: "IP",
  port: "Port"
}

const MeterCrud: React.FC<MeterCrudProps> = ({ tab }) => {
  const dispatch = useDispatch();
  const { meters, loading, meta, masterImage } = useSelector((state: any) => state.admin);
  const [paginationModel, setPaginationModel] = useState({
    page: 0, pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>(tab);
  const [createMeter, setCreateMeter] = useState<createMeter>({
    model: '',
    description: '',
    photo: null,
    com_protocol: '',
    com_configure: {
      slave_id: '',
      register_count: '',
      serial_no_register: '',
      date_register: '',
    }
  });
  const [selectedMeter, setSelectedMeter] = useState<any>(null);
  const [updateMeter, setUpdateMeter] = useState<updateMeter>({
    model: '',
    description: '',
    photo: null,
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);


  const handlePagination = (params) => {
    setPaginationModel({
      page: params.page,
      pageSize: params.pageSize
    });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name in createMeter.com_configure) {
      setCreateMeter({
        ...createMeter,
        com_configure: {
          ...createMeter.com_configure,
          [name]: value
        }
      });
    } else {
      setCreateMeter({
        ...createMeter,
        [name]: value
      });
    }
  };

  const handleProtocolChange = (event: React.ChangeEvent<HTMLSelectElement>, type: 'create' | 'update') => {
    const { name, value } = event.target;
    if (type === 'create') {
      setCreateMeter((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setUpdateMeter((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleComConfigure = (event) => {
    const { name, value } = event.target;
    setCreateMeter({
      ...createMeter,
      com_configure: {
        ...createMeter.com_configure,
        [name]: value
      }
    });
  }


  const updateComConfigure = (event) => {
    const { name, value } = event.target;
    setUpdateMeter({
      ...updateMeter,
      com_configure: {
        ...updateMeter.com_configure,
        [name]: value
      }
    });
  }

  const handleUpdate = (event) => {
    const { name, value } = event.target;
    setUpdateMeter({
      ...updateMeter,
      [name]: value

    })
  }

  const confirmDelete = () => {
    dispatch(deleteMeter(selectedMeter.id));
    setIsDeleteConfirmOpen(false);
    setSelectedMeter(null)
    setActiveTab('get')
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setSelectedMeter(null)
  };

  const resetform = () => {
    if (activeTab == 'add') {
      setCreateMeter({
        model: '',
        description: '',
        photo: null,
        com_protocol: '',
        com_configure: {
          slave_id: '',
          register_count: '',
          serial_no_register: '',
          date_register: '',
        }
      });
    }
    else {
      setUpdateMeter({
        model: '',
        description: '',
        photo: null,
      });
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'create' | 'update') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'create') {
          setCreateMeter({ ...createMeter, photo: reader.result as string });
        } else {
          setUpdateMeter({ ...updateMeter, photo: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    dispatch(getMeters({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      model: searchQuery
    }));
  }, [dispatch, paginationModel, searchQuery]);

  useEffect(() => {
    if (masterImage) {
      setCreateMeter((prev) => ({
        ...prev,
        photo: masterImage,
      }));
    }
  }, [masterImage]);
  useEffect(() => {
    if (masterImage) {
      setUpdateMeter((prev) => ({
        ...prev,
        photo: masterImage,
      }));
    }
  }, [masterImage]);

  const columns: GridColDef[] = [
    { field: 'model', headerName: 'Model Name', width: 150, headerAlign: 'center', align: 'center' },
    {
      field: 'photo',
      headerName: 'Photo',
      flex: 1,
      headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <div className='flex justify-center items-center p-2'>
          <img src={params.value} alt={params.row.model} className="h-3/4 w-3/4 object-contain" />
        </div>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value}
          </div>
        </Tooltip>
      ),
    },
    {
      field: 'com_protocol',
      headerName: 'Communication Protocol',
      headerClassName: 'flex flex-wrap',
      headerAlign: 'center',
      width: 130,
      align: 'center',
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value.toUpperCase()}
          </div>
        </Tooltip>
      ),
      renderHeader: (params) => (
        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center' }}>
          {params.colDef.headerName}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <div className="flex space-x-2 justify-between items-center h-full">
          <button
            className="bg-blue-600 text-white text-sm my-4 py-1 px-3 rounded hover:bg-blue-700 transition duration-300 ease-in-out h-7 w-1/2"
            onClick={() => {
              const prot = params.row.com_protocol;
              if (prot == 'modbus') {
                setUpdateMeter({
                  model: params.row.model,
                  description: params.row.description,
                  photo: params.row.photo,
                  com_protocol: params.row.com_protocol,
                  com_configure: {
                    slave_id: params.row.com_configure.slave_id,
                    register_count: params.row.com_configure.register_count,
                    serial_no_register: params.row.com_configure.serial_no_register,
                    date_register: params.row.com_configure.date_register,
                    serial_port: params.row.com_configure.serial_port,
                    baud_rate: params.row.com_configure.baud_rate,
                    parity: params.row.com_configure.parity,
                    stop_bits: params.row.com_configure.stop_bits,
                    byte_size: params.row.com_configure.byte_size,
                  }
                });
              }
              else if (prot == "ethernet") {
                setUpdateMeter({
                  model: params.row.model,
                  description: params.row.description,
                  photo: params.row.photo,
                  com_protocol: params.row.com_protocol,
                  com_configure: {
                    slave_id: params.row.com_configure.slave_id,
                    register_count: params.row.com_configure.register_count,
                    serial_no_register: params.row.com_configure.serial_no_register,
                    date_register: params.row.com_configure.date_register,
                    ip: params.row.com_configure.ip,
                    port: params.row.com_configure.port

                  }
                });
              }
              else {
                setUpdateMeter({
                  model: params.row.model,
                  description: params.row.description,
                  photo: params.row.photo,
                  com_protocol: params.row.com_protocol,
                  com_configure: {
                    slave_id: params.row.com_configure.slave_id,
                    register_count: params.row.com_configure.register_count,
                    serial_no_register: params.row.com_configure.serial_no_register,
                    date_register: params.row.com_configure.date_register,
                    baud_rate: params.row.com_configure.baud_rate,
                    parity: params.row.com_configure.parity,
                    stop_bits: params.row.com_configure.stop_bits,
                    byte_size: params.row.com_configure.byte_size,
                  }
                });
              }
              setActiveTab('update');

              setSelectedMeter(params.row);
            }}
          > Update
          </button>
          <button
            className="bg-red-600 text-white text-sm my-4 py-1 px-3 rounded hover:bg-red-700 transition duration-300 ease-in-out h-7 w-1/2"
            onClick={() => {
              setIsDeleteConfirmOpen(true)
              setSelectedMeter(params.row);
            }}
          > Delete
          </button>

        </div>
      ),
    },

  ];
  console.log(updateMeter)
  return (
    <div>
      {/* <h1 className="text-2xl font-bold text-center mb-6">Meter Management</h1> */}
      <div className="flex justify-between mb-4 items-center gap-10">
        <input
          type="text"
          placeholder="Search by model"
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 rounded flex-1 bg-black"
        />
        <button
          className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-500"
          onClick={() => setActiveTab(prevTab => (prevTab === 'add' ? 'get' : 'add'))}
        >
          {activeTab === 'add' ? 'Show All' : 'Add'}
        </button>

      </div>
      <div className="grid grid-cols-1 gap-4">
        {activeTab === 'add' && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg relative w-3/4 max-w-4xl">
              <button
                className="absolute top-2 right-2 text-white bg-black"
                onClick={() => {
                  setActiveTab('get');
                  resetform();
                }}
              >
                ✕
              </button>
              <h2 className="text-2xl text-white font-semibold mb-6">Add Meter</h2>
              <div className='flex justify-between gap-8'>
                <div className='flex flex-col gap-4 w-1/2 p-2 overflow-y-scroll custom-scrollbar h-64'>
                  {Object.entries(createMeter).map(([key, value]) => {
                    if (key === 'photo' || key ===
                      "com_configure"
                    ) return null;
                    if (key === 'com_protocol') {
                      return (
                        <div key={key}>
                          <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                            {nameTolabelMap[key]}
                          </label>
                          <select
                            style={{ backgroundColor: '#1F2937', color: 'white' }}
                            className="border rounded p-2 w-full text-white"
                            name={key}
                            value={value}
                            onChange={(e) => handleProtocolChange(e, 'create')}
                          >
                            <option value="">Select Protocol</option>
                            <option value="modbus">Modbus</option>
                            <option value="ethernet">Ethernet</option>
                            <option value="usb">USB</option>
                          </select>
                        </div>
                      );
                    }
                    return (
                      <div key={key}>
                        <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                          {nameTolabelMap[key]}
                        </label>
                        <input
                          style={{ backgroundColor: '#1F2937', color: 'white' }}
                          className="border rounded p-2 w-full text-white"
                          name={key}
                          type="text"
                          placeholder={`Meter ${key}`}
                          value={value}
                          onChange={handleInputChange}
                        />
                      </div>
                    );
                  })}
                  {['slave_id', 'register_count', 'serial_no_register', 'date_register'].map((key) => (
                    <div key={key}>
                      <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                        {nameTolabelMap[key]}
                      </label>
                      <input
                        style={{ backgroundColor: '#1F2937', color: 'white' }}
                        className="border rounded p-2 w-full text-white"
                        name={key}
                        type="text"
                        placeholder={`${nameTolabelMap[key]}`}
                        value={createMeter.com_configure[key]}
                        onChange={handleComConfigure}
                      />
                    </div>
                  ))}
                  {createMeter.com_protocol === 'modbus' && (
                    <>
                      {modbusFields.map((key) => (
                        <div key={key}>
                          <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                            {nameTolabelMap[key]}
                          </label>
                          <input
                            style={{ backgroundColor: '#1F2937', color: 'white' }}
                            className="border rounded p-2 w-full text-white"
                            name={key}
                            type="text"
                            placeholder={`${nameTolabelMap[key]}`}
                            value={createMeter.com_configure[key]}
                            onChange={handleComConfigure}
                          />
                        </div>
                      ))}
                    </>
                  )}
                  {createMeter.com_protocol === 'ethernet' && (
                    <>
                      {ethernetFields.map((key) => (
                        <div key={key}>
                          <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                            {nameTolabelMap[key]}
                          </label>
                          <input
                            style={{ backgroundColor: '#1F2937', color: 'white' }}
                            className="border rounded p-2 w-full text-white"
                            name={key}
                            type="text"
                            placeholder={`${nameTolabelMap[key]}`}
                            value={createMeter.com_configure[key]}
                            onChange={handleComConfigure}
                          />
                        </div>
                      ))}
                    </>
                  )}
                  {
                    createMeter.com_protocol === "usb" && (
                      <>
                        {usbFields.map((key) => (
                          <div key={key}>
                            <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                              {nameTolabelMap[key]}
                            </label>
                            <input
                              style={{ backgroundColor: '#1F2937', color: 'white' }}
                              className="border rounded p-2 w-full text-white"
                              name={key}
                              type="text"
                              placeholder={`${nameTolabelMap[key]}`}
                              value={createMeter.com_configure[key]}
                              onChange={handleComConfigure}
                            />
                          </div>
                        ))}
                      </>
                    )
                  }
                  <div>
                    <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor="photo">
                      Upload Meter Image
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'create')} className="rounded p-2 w-full text-white bg-gray-900" />
                  </div>
                </div>

                <div className="flex flex-col items-center w-1/2">
                  {
                    masterImage ? (
                      <img
                        src={masterImage}
                        alt="Meter Preview"
                        className="w-full h-auto mb-4 rounded-lg"
                      />
                    ) : (
                      <img
                        src={'http://localhost:3000/video_feed'}
                        alt="Meter Preview"
                        className="w-full h-auto mb-4 rounded-lg"
                      />
                    )
                  }
                  <div className="flex space-x-4 w-full justify-between">
                    <button
                      className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-500 w-1/2"
                      onClick={() => {
                        setCreateMeter({ ...createMeter, photo: null });
                        dispatch(resetMasterImage());
                      }}
                    >
                      Retry
                    </button>
                    <button
                      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-500 w-1/2"
                      onClick={() => {
                        dispatch(captureMaster());
                      }}
                    >
                      Capture
                    </button>
                  </div>
                </div>
              </div>
              <button
                className="bg-teal-600 text-white py-2 px-6 rounded hover:bg-teal-500 mt-6 w-1/2"
                onClick={() => {
                  dispatch(addMeter(createMeter));
                  dispatch(resetMasterImage());
                  setActiveTab('get');
                  resetform();
                }}
              >
                Add Meter
              </button>
            </div>
          </div>
        )}
        {
          activeTab == 'update' && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-8 rounded shadow-lg relative w-3/4 max-w-4xl">
                <button
                  className="absolute top-2 right-2 text-white bg-black"
                  onClick={() => setActiveTab('get')}
                >
                  ✕
                </button>
                <h2 className="text-2xl text-white font-semibold mb-6">Update Meter</h2>
                <div className="flex justify-between gap-8">



                  <div className='flex flex-col gap-4 w-1/2 p-2 overflow-y-scroll custom-scrollbar h-64'>
                    {Object.entries(updateMeter).map(([key, value]) => {
                      if (key === 'photo' || key ===
                        "com_configure"
                      ) return null;
                      if (key === 'com_protocol') {
                        return (
                          <div key={key}>
                            <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                              {nameTolabelMap[key]}
                            </label>
                            <select
                              style={{ backgroundColor: '#1F2937', color: 'white' }}
                              className="border rounded p-2 w-full text-white"
                              name={key}
                              value={value}
                              onChange={(e) => handleProtocolChange(e, 'update')}
                            >
                              <option value="">Select Protocol</option>
                              <option value="modbus">Modbus</option>
                              <option value="ethernet">Ethernet</option>
                              <option value="usb">USB</option>
                            </select>
                          </div>
                        );
                      }
                      return (
                        <div key={key}>
                          <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                            {nameTolabelMap[key]}
                          </label>
                          <input
                            style={{ backgroundColor: '#1F2937', color: 'white' }}
                            className="border rounded p-2 w-full text-white"
                            name={key}
                            type="text"
                            placeholder={`Meter ${key}`}
                            value={value}
                            onChange={handleUpdate}
                          />
                        </div>
                      );
                    })}
                    {['slave_id', 'register_count', 'serial_no_register', 'date_register'].map((key) => (
                      <div key={key}>
                        <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                          {nameTolabelMap[key]}
                        </label>
                        <input
                          style={{ backgroundColor: '#1F2937', color: 'white' }}
                          className="border rounded p-2 w-full text-white"
                          name={key}
                          type="text"
                          placeholder={`${nameTolabelMap[key]}`}
                          value={updateMeter.com_configure[key]}
                          onChange={updateComConfigure}
                        />
                      </div>
                    ))}
                    {updateMeter.com_protocol === 'modbus' && (
                      <>
                        {modbusFields.map((key) => (
                          <div key={key}>
                            <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                              {nameTolabelMap[key]}
                            </label>
                            <input
                              style={{ backgroundColor: '#1F2937', color: 'white' }}
                              className="border rounded p-2 w-full text-white"
                              name={key}
                              type="text"
                              placeholder={`${nameTolabelMap[key]}`}
                              value={updateMeter.com_configure[key]}
                              onChange={updateComConfigure}
                            />
                          </div>
                        ))}
                      </>
                    )}
                    {updateMeter.com_protocol === 'ethernet' && (
                      <>
                        {ethernetFields.map((key) => (
                          <div key={key}>
                            <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                              {nameTolabelMap[key]}
                            </label>
                            <input
                              style={{ backgroundColor: '#1F2937', color: 'white' }}
                              className="border rounded p-2 w-full text-white"
                              name={key}
                              type="text"
                              placeholder={`${nameTolabelMap[key]}`}
                              value={updateMeter.com_configure[key]}
                              onChange={updateComConfigure}
                            />
                          </div>
                        ))}
                      </>
                    )}
                    {updateMeter.com_protocol === 'usb' && (
                      <>
                        {usbFields.map((key) => (
                          <div key={key}>
                            <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor={key}>
                              {nameTolabelMap[key]}
                            </label>
                            <input
                              style={{ backgroundColor: '#1F2937', color: 'white' }}
                              className="border rounded p-2 w-full text-white"
                              name={key}
                              type="text"
                              placeholder={`${nameTolabelMap[key]}`}
                              value={updateMeter.com_configure[key]}
                              onChange={updateComConfigure}
                            />
                          </div>
                        ))}
                      </>
                    )}
                    <div>
                      <label className="block text-md font-semibold text-white mb-2 float-left" htmlFor="photo">
                        Upload Meter Image
                      </label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'update')} className="rounded p-2 w-full text-white bg-gray-900" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-1/2">
                    <img
                      src={'http://localhost:3000/video_feed'}
                      alt="Meter Preview"
                      className="w-full h-auto mb-4 rounded-lg"
                    />
                    <div className="flex space-x-4 w-full justify-between">
                      <button
                        className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-500 w-1/2"
                        onClick={() => {
                          setUpdateMeter({ ...updateMeter, photo: null });
                          dispatch(resetMasterImage());
                        }}
                      >
                        Retry
                      </button>
                      <button
                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-500 w-1/2"
                        onClick={() => {
                          dispatch(captureMaster());
                        }}
                      >
                        Capture
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="bg-teal-600 text-white py-2 px-6 rounded hover:bg-teal-500 mt-6 w-1/2"
                  onClick={() => {
                    dispatch(updateExistMeter({ id: selectedMeter.id, meter: updateMeter }));
                    dispatch(resetMasterImage());
                    setActiveTab('get');
                    resetform();
                  }}
                >
                  Update Meter
                </button>
              </div>
            </div>)
        }
        {
          activeTab == 'get' && (
            <div>
              <ThemeProvider theme={theme}>
                <DataGrid
                  loading={loading}
                  rows={meters}
                  columns={columns}
                  paginationModel={paginationModel}
                  pageSizeOptions={[2, 5, 10, 20]}
                  paginationMode="server"
                  rowCount={meta.total}
                  onPaginationModelChange={(params) => handlePagination(params)}
                  rowHeight={150}
                  getRowId={(row) => row.id}
                  onRowClick={(row) => setSelectedMeter(row.row)}
                />
              </ThemeProvider>
            </div>
          )
        }
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-gray-500  text-lg mb-4">Are you sure you want to delete this Meter ?</h2>
              <div className="flex justify-end">
                <button onClick={confirmDelete} className="mr-2 px-4 py-2 bg-red-500 text-white rounded">
                  Yes
                </button>
                <button onClick={cancelDelete} className=" px-4 py-2 bg-gray-300 rounded">
                  No
                </button>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MeterCrud;