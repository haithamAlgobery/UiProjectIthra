// src/features/typecontent.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

export const fetchContentTypes = createAsyncThunk("types/fetchContentTypes", async () => {
  const resp = await api.get("/typecontent");
  return resp.data; // يتوقع مصفوفة {title, code}
});

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const typesSlice = createSlice({
  name: "types",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContentTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchContentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "فشل جلب أنواع المحتوى";
      });
  },
});

export default typesSlice.reducer;
