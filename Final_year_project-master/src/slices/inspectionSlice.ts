import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';

interface InspectionState {
    inspections: Array<any>;
    analytics: any;
    inspectionsLoading: boolean;
    analyticsLoading: boolean;
    error: string | null;
    meters: Array<any>;
    loading: boolean;
    inspectionStatus: string | null;
    checkLoading: boolean;
    capturedImage: null;
    masterImage: null;
    diffImage: null;
    od: boolean;
    serial_no: string;
    serialLoading: boolean;
    meta: {
        page: number;
        total: number;
        limit: number;
    }
}

const initialState: InspectionState = {
    inspections: [],
    meters: [],
    analytics: null,
    inspectionsLoading: false,
    analyticsLoading: false,
    error: null,
    loading: false,
    inspectionStatus: null,
    checkLoading: false,
    capturedImage: null,
    masterImage: null,
    diffImage: null,
    od: false,
    serial_no: '',
    serialLoading: false,
    meta: {
        page: 1,
        total: 0,
        limit: 10
    }
};

export const getMyInspections = createAsyncThunk(
    'inspections/getMyInspections',
    async ({ key, value, startDate, endDate, page, limit, result }, { rejectWithValue }) => {
        try {
            let url = `/getInspections?my=true`;
            if (page && limit) {
                url += `&page=${page}&limit=${limit}`
            }
            if (key && value) {
                url += `&${key}=${value}`
            }
            if (startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`
            }
            if (result) {
                url += `&result=${result}`
            }
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const getAnalytics = createAsyncThunk(
    'inspections/getAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/analytics/numbers`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const getMeters = createAsyncThunk(
    'inspections/getMeterList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/meterList');
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const checkMeter = createAsyncThunk(
    'inspections/checkMeter',
    async (form, { rejectWithValue }) => {
        try {
            const response = await axios.post('http://localhost:3000/capture', form, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const createInspection = createAsyncThunk(
    'inspections/createInspection',
    async (result, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/inspect', result);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const getInspections = createAsyncThunk(
    'inspections/getInspections',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/getInspections');
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const getSerialNumber = createAsyncThunk(
    'inspections/getSerialNumber',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`http://localhost:3000/getSerialNo`, data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
)

export const saveImages = createAsyncThunk(
    'inpsections/saveImages',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`http://localhost:3000/saveImages`, data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.error);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
)

const inspectionSlice = createSlice({
    name: 'inspection',
    initialState,
    reducers: {
        resetInspectionStatus(state) {
            state.inspectionStatus = null;
        },
        clearErrors(state) {
            state.error = null;
        },
        changeCapture(state) {
            state.capturedImage = null;
        },
        changeMasterImage(state, action) {
            state.masterImage = action.payload ? action.payload : null;
        },
        changeDiff(state, action) {
            state.diffImage = action.payload ? action.payload : null;
        },
        resetod(state) {
            state.od = false;
        },
        changeSerialNumber(state) {
            state.serial_no = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMyInspections.pending, (state) => {
                state.inspectionsLoading = true;
                state.error = null;
            })
            .addCase(getMyInspections.fulfilled, (state, action: PayloadAction<any>) => {
                state.inspectionsLoading = false;
                state.inspections = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(getMyInspections.rejected, (state, action: PayloadAction<any>) => {
                state.inspectionsLoading = false;
                state.error = action.payload;
            })
            .addCase(getAnalytics.pending, (state) => {
                state.analyticsLoading = true;
                state.error = null;
            })
            .addCase(getAnalytics.fulfilled, (state, action: PayloadAction<any>) => {
                state.analyticsLoading = false;
                state.analytics = action.payload;
            })
            .addCase(getAnalytics.rejected, (state, action: PayloadAction<any>) => {
                state.analyticsLoading = false;
                state.error = action.payload;
            })
            .addCase(getMeters.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMeters.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.meters = action.payload;
            })
            .addCase(getMeters.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(checkMeter.pending, (state) => {
                state.checkLoading = true;
                state.error = null;
            })
            .addCase(checkMeter.fulfilled, (state, action: PayloadAction<any>) => {
                state.checkLoading = false;
                state.inspectionStatus = action.payload.res;
                state.capturedImage = action.payload.image;
                state.diffImage = action.payload.diff;
                state.od = action.payload.od;
            })
            .addCase(checkMeter.rejected, (state, action: PayloadAction<any>) => {
                state.checkLoading = false;
                state.error = action.payload;
            })
            .addCase(createInspection.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createInspection.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
            })
            .addCase(createInspection.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getInspections.pending, (state) => {
                state.inspectionsLoading = true;
                state.error = null;
            })
            .addCase(getInspections.fulfilled, (state, action: PayloadAction<any>) => {
                state.inspectionsLoading = false;
                state.inspections = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(getInspections.rejected, (state, action: PayloadAction<any>) => {
                state.inspectionsLoading = false;
                state.error = action.payload;
            })
            .addCase(getSerialNumber.pending, (state, action: PayloadAction<any>) => {
                state.serialLoading = true;
                state.error = action.payload;
            })
            .addCase(getSerialNumber.fulfilled, (state, action: PayloadAction<any>) => {
                state.serial_no = action.payload.serial_no;
                state.serialLoading = false;
            })
            .addCase(getSerialNumber.rejected, (state, action: PayloadAction<any>) => {
                state.serialLoading = false;
                state.error = action.payload;
            })
    },
});

export const { resetInspectionStatus, clearErrors, changeCapture, changeMasterImage, changeDiff, resetod, changeSerialNumber } = inspectionSlice.actions;
export default inspectionSlice.reducer;