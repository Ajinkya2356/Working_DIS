import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { getRoutines } from '../slices/adminSlice';

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

interface RoutineCrudProps {
    tab: string;
}

const RoutineCrud: React.FC<RoutineCrudProps> = ({ tab }) => {
    const dispatch = useDispatch();
    const { loading, routines, meta } = useSelector((state: any) => state.admin);
    const [activeTab, setActiveTab] = useState<string>(tab);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [filterType, setFilterType] = useState<string>('date');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [customDateRange, setCustomDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterType(e.target.value);
    };

    const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDateFilter(e.target.value);
    };

    useEffect(() => {
        let startDate: string | null = null;
        let endDate: string | null = null;
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Assuming week starts on Monday
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        switch (dateFilter) {
            case 'today':
                startDate = new Date().toISOString().split('T')[0];
                endDate = new Date().toISOString().split('T')[0] + 'T23:59:59';
                break;
            case 'this_week':
                startDate = startOfWeek.toISOString().split('T')[0];
                endDate = new Date().toISOString().split('T')[0] + 'T23:59:59';
                break;
            case 'this_month':
                startDate = startOfMonth.toISOString().split('T')[0];
                endDate = endOfMonth.toISOString().split('T')[0] + 'T23:59:59';
                break;
            case 'custom':
                if (!customDateRange.start || !customDateRange.end) {
                    console.log('Both start date and end date must be provided for custom date range.');
                    return;
                }
                startDate = customDateRange.start;
                endDate = customDateRange.end;
                break;
            default:
                startDate = null;
                endDate = null;
        }
        dispatch(getRoutines({ startDate, endDate, page: paginationModel.page + 1, limit: paginationModel.pageSize }));
    }, [dispatch, dateFilter, customDateRange, paginationModel]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'start') {
            setCustomDateRange((prev) => ({ ...prev, start: value }));
        } else if (name === 'end') {
            setCustomDateRange((prev) => ({ ...prev, end: value }));
        }
    };

    const columns: GridColDef[] = [

        {
            field: 'date', headerName: 'Date', width: 100, resizable: false, headerAlign: 'center', align: 'center',
        },
        {
            field: 'start_time',
            headerName: 'In time',
            headerAlign: 'center',
            resizable: false,
            width: 120,
            align: 'center',
        },
        {
            field: 'end_time',
            headerName: 'Out time',
            headerAlign: 'center',
            resizable: false,
            width: 120,
            align: 'center',
        },
        { field: 'worker_reg_no', headerName: 'Worker ID', flex: 1, resizable: false, headerAlign: 'center', align: 'center', width: 150, },
        { field: 'worker_name', headerName: 'Worker Name', flex: 1, resizable: false, headerAlign: 'center', align: 'center', width: 150, },

    ];

    return (
        <div className="container">
            <h1 className="text-2xl font-bold text-center mb-6">Routine Management</h1>

            {activeTab === 'get' && (
                <div className="tab-content">
                    <div className="flex flex-row justify-around mb-4 gap-5">
                        <select
                            className="border border-gray-300 rounded p-2 mb-2 w-full bg-gray-900 text-white"
                            value={filterType}
                            onChange={handleFilterChange}
                        >
                            <option value="date">Date</option>
                        </select>

                        {filterType === 'date' && (
                            <select
                                className="border border-gray-300 rounded p-2 mb-2 w-full bg-gray-900 text-white"
                                value={dateFilter}
                                onChange={handleDateFilterChange}
                            >
                                <option value="all">All</option>
                                <option value="today">Today</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                                <option value="custom">Custom Date Range</option>
                            </select>
                        )}
                        {filterType === 'date' && dateFilter === 'custom' && (
                            <div className="flex flex-row gap-2">
                                <input
                                    className="border border-gray-300 rounded p-2 mb-2 w-full"
                                    style={{ backgroundColor: '#1F2937', color: 'white' }}
                                    type="date"
                                    name="start"
                                    value={customDateRange.start}
                                    onChange={handleInputChange}
                                />
                                <input
                                    className="border border-gray-300 rounded p-2 mb-2 w-full"
                                    style={{ backgroundColor: '#1F2937', color: 'white' }}
                                    type="date"
                                    name="end"
                                    value={customDateRange.end}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}
                    </div>
                    <ThemeProvider theme={theme}>
                        <DataGrid
                            loading={loading}
                            rows={routines}
                            columns={columns}
                            getRowId={(row) => row._id}
                            paginationMode='server'
                            pagination
                            rowCount={meta.total}
                            pageSizeOptions={[2, 5, 10, 20, 50, 100]}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                        />
                    </ThemeProvider>
                </div>
            )}
        </div>
    );
};

export default RoutineCrud;