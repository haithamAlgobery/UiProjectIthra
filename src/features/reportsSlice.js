// src/features/reportsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

export const createReport = createAsyncThunk(
  "reports/create",
  async (payload, { rejectWithValue }) => {
    // payload: { title, detail, contentId, typeReportId }
    try {
      const res = await api.post("/report", payload);
      return res.data ?? { success: true };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  creating: "idle", // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReportState(state) {
      state.creating = "idle";
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(createReport.pending, state => {
        state.creating = "pending";
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state) => {
        state.creating = "succeeded";
      })
      .addCase(createReport.rejected, (state, action) => {
        state.creating = "failed";
        state.error = action.payload || action.error?.message;
      });
  }
});

export const { clearReportState } = reportsSlice.actions;
export const selectReportCreating = state => state.reports.creating;
export const selectReportError = state => state.reports.error;
export default reportsSlice.reducer;
