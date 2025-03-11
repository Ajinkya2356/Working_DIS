import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkers, addWorker as addWorkerAction, deleteWorker, updateWorker } from '../slices/adminSlice';



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

interface createWorker {
  name: string;
  reg_no: string;
  password: string;
  photo: File | null;
  user_role?: string;
  email?: string;
}

interface WorkerCrudProps {
  tab: string;
}

const WorkerCrud: React.FC<WorkerCrudProps> = ({ tab }) => {
  const dispatch = useDispatch();
  const { loading, workers, meta } = useSelector((state: any) => state.admin);
  const [createForm, setCreateForm] = useState<createWorker>({
    name: '',
    reg_no: '',
    password: '',
    photo: null,
    email: '',
  });
  const [activeTab, setActiveTab] = useState<string>(tab);
  const [searchRegNo, setSearchRegNo] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [filterType, setFilterType] = useState('Name');
  const [recentlyJoined, setRecentlyJoined] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    dispatch(fetchWorkers({
      name: searchName,
      reg_no: searchRegNo,
      recentlyJoined: recentlyJoined,
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
    }));
  }, [dispatch, searchName, searchRegNo, recentlyJoined, paginationModel]);



  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'Name' | 'Reg. No.' | 'Recently Joined';
    setFilterType(value);
    setSearchName('');
    setSearchRegNo('');
    setRecentlyJoined(value === 'Recently Joined');
  };

  const addWorker = () => {
    const form = new FormData();
    form.append('name', createForm.name);
    form.append('reg_no', createForm.reg_no);
    form.append('password', createForm.password);
    form.append('email', createForm.email);
    form.append('photo', createForm.photo as Blob);
    dispatch(addWorkerAction(form));
    setPaginationModel({
      page: 0,
      pageSize: 10,
    })
    resetForm();
    setActiveTab('get');
  };

  const handleUpdateWorker = () => {
    const form = new FormData();
    Object.entries(createForm).forEach(([key, value]) => {
      if (key !== 'photo' && value !== '') {
        form.append(key, value as string);
      } else if (key === 'photo' && value !== null) {
        form.append(key, value as Blob);
      }
    });
    dispatch(updateWorker({ id: selectedRow, worker: form }));
    setPaginationModel({
      page: 0,
      pageSize: 10,
    })
    setSelectedRow(null);
    setIsUpdating(false);
    resetForm();
  };

  const handleDeleteWorker = (_id: string) => {
    setIsDeleteConfirmOpen(true);
    setSelectedRow(_id);
  };

  const confirmDelete = () => {
    dispatch(deleteWorker(selectedRow));
    setPaginationModel({
      page: 0,
      pageSize: 10,
    })
    setIsDeleteConfirmOpen(false);
    setSelectedRow(null)
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setSelectedRow(null)
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files) {
      const imgURL = URL.createObjectURL(files[0]);
      setPhotoPreview(imgURL);
      setCreateForm({ ...createForm, photo: files[0] });
    } else {
      setCreateForm({ ...createForm, [name]: value });
    }
  };

  const resetForm = () => {
    setCreateForm({
      name: '',
      reg_no: '',
      password: '',
      photo: null,
      email: '',
    });
    setPhotoPreview(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'photo',
      headerName: 'Photo',
      width: 100,
      renderCell: (params) => (
        <div className="flex justify-center items-center w-full h-full">
          <img src={params.value} alt={params.row.name} className="h-10 w-10 rounded-full" />
        </div>
      ),
      headerAlign: 'center',
      resizable: false,
    },
    { field: 'name', headerName: 'Name', flex: 1, resizable: false, headerAlign: 'center', },
    { field: 'reg_no', headerName: 'Employee ID', flex: 1, resizable: false, headerAlign: 'center', },
    {
      field: 'user_role', headerName: 'User Role', flex: 1, resizable: false, headerAlign: 'center', renderCell: (params) => (
        <span>{params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase()}</span>
      ),
    },
    {
      field: 'actions',
      flex: 1,
      headerName: 'Actions',
      headerAlign: 'center',
      resizable: false,
      renderCell: (params) => (
        <div className="flex space-x-2 justify-between items-center h-full">
          <button
            className="bg-blue-600 text-white text-sm my-4 py-1 px-3 rounded hover:bg-blue-700 transition duration-300 ease-in-out h-7 w-1/2"
            onClick={() => {
              setCreateForm({
                name: params.row.name as string,
                reg_no: params.row.reg_no as string,
                password: '',
                photo: params.row.photo,
                user_role: params.row.user_role,
                email: params.row.email,
              });
              setIsUpdating(true);
              setSelectedRow(params.row.id);
              setPhotoPreview(params.row.photo);
            }}
          > Update
          </button>
          <button
            className="bg-red-600 text-white text-sm my-4 py-1 px-3 rounded hover:bg-red-700 transition duration-300 ease-in-out h-7 w-1/2"
            onClick={() =>
              handleDeleteWorker(params.row.id)
            }
          > Delete
          </button>

        </div>
      ),
    },
  ];
  return (
    <div>
      {activeTab === 'add' && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg relative w-1/3">
            <button
              className="absolute bg-white top-2 right-2 text-gray-700 hover:text-gray-500"
              onClick={() => {
                setActiveTab('get');
                resetForm();
              }}
            >
              ✕
            </button>
            <h2 className="text-xl text-gray-700 font-semibold mb-4">Add Worker</h2>
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="name" placeholder="Name" value={createForm.name} onChange={handleInputChange} required />
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="reg_no" placeholder="Registration No" value={createForm.reg_no} onChange={handleInputChange} required />
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="password" type="password" placeholder="Password" value={createForm.password} onChange={handleInputChange} required />
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="email" placeholder="Email" value={createForm.email} onChange={handleInputChange} required />
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="photo" type="file" accept="image/*" onChange={handleInputChange} required />
            <button className="bg-teal-600 text-white py-2 rounded hover:bg-teal-500" onClick={addWorker}>Add Worker</button>
          </div>
        </div>
      )}

      {isUpdating && ( // Update Overlay
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg relative w-1/3">
            <button
              className="absolute bg-white top-2 right-2 text-gray-700 hover:text-gray-500"
              onClick={() => {
                setIsUpdating(false);
                setSelectedRow(null);
                resetForm();
              }}
            >
              ✕
            </button>
            <h2 className="text-xl text-gray-700 font-semibold mb-4">Update Worker</h2>
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="name" placeholder="Name" value={createForm.name} onChange={handleInputChange} required />
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="reg_no" placeholder="Registration No" value={createForm.reg_no} onChange={handleInputChange} required />
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="password" type="password" placeholder="Password" value={createForm.password} onChange={handleInputChange} required />
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="email" placeholder="Email" value={createForm.email} onChange={handleInputChange} required />
            <select
              className="border border-gray-300 rounded p-2 mb-2 w-full bg-gray-900 text-white"
              name="user_role"
              value={createForm.user_role || ''}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select User Role</option>
              <option value="worker">Worker</option>
              <option value="admin">Admin</option>
            </select>
            <span className='flex justify-center m-3 text-black'><img src={photoPreview} alt={`user ${createForm.reg_no}`} height={50} width={50} /></span>
            <input className="border border-gray-300 rounded p-2 mb-2 w-full" style={{ backgroundColor: '#1F2937', color: 'white' }} name="photo" type="file" accept="image/*" onChange={handleInputChange} required />

            <button className="bg-teal-600 text-white py-2 rounded hover:bg-teal-500" onClick={handleUpdateWorker}>Update Worker</button>
          </div>
        </div>
      )}

      {activeTab === 'get' && (
        <div className="tab-content">
          <div className="flex flex-row justify-around mb-4 gap-5 items-center">

            {filterType !== 'Recently Joined' ? (
              <input
                className="rounded p-2 w-full bg-black"
                name={filterType === 'Name' ? 'name' : 'reg_no'}
                placeholder={`Filter by ${filterType}`}
                value={filterType === 'Name' ? searchName : searchRegNo}
                onChange={filterType === 'Name' ? (e) => setSearchName(e.target.value) : (e) => setSearchRegNo(e.target.value)}
                autoComplete='off'
              />
            ) :
              null
            }
            <div className="w-60">
              <select className="rounded p-2 w-full bg-black" value={filterType} onChange={handleFilterChange}>
                <option>Name</option>
                <option>Reg. No.</option>
                <option>Recently Joined</option>
              </select>
            </div>
            <button
              className="bg-purple-600 text-white rounded hover:bg-purple-500"
              onClick={() => setActiveTab(prevTab => (prevTab === 'add' ? 'get' : 'add'))}
            >
              Add
            </button>
          </div>
          <ThemeProvider theme={theme}>
            <DataGrid
              loading={loading}
              rows={workers}
              columns={columns}
              getRowId={(row) => row.id}
              paginationMode='server'
              pagination
              rowCount={meta.total}
              pageSizeOptions={
                [2, 5, 10, 20, 50, 100]
              }
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          </ThemeProvider>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-gray-500  text-lg mb-4">{`Are you sure you want to delete this user ?`}</h2>
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
  );
};

export default WorkerCrud;
