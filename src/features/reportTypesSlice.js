// src/features/reportTypesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

export const fetchReportTypes = createAsyncThunk(
  "reportTypes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/report-type");
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  items: [],
  loading: "idle",
  error: null
};

const reportTypesSlice = createSlice({
  name: "reportTypes",
  initialState,
  reducers: {
    clearReportTypes(state) {
      state.items = [];
      state.loading = "idle";
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchReportTypes.pending, state => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchReportTypes.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchReportTypes.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || action.error?.message;
      });
  }
});

export const { clearReportTypes } = reportTypesSlice.actions;
export const selectReportTypes = state => state.reportTypes.items;
export const selectReportTypesLoading = state => state.reportTypes.loading;
export const selectReportTypesError = state => state.reportTypes.error;
export default reportTypesSlice.reducer;
