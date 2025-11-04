// src/features/options.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

export const fetchSortOptions = createAsyncThunk("options/fetchSortOptions", async () => {
  const resp = await api.get("/options/sort");
  return resp.data; // يتوقع مصفوفة {key,name}
});

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const optionsSlice = createSlice({
  name: "options",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSortOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSortOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSortOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "فشل جلب خيارات الفرز";
      });
  },
});

export default optionsSlice.reducer;
