// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import inspectionReducer from './slices/inspectionSlice'
import adminReducer from "./slices/adminSlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    inspection: inspectionReducer,
    admin : adminReducer
  },
});

export default store;