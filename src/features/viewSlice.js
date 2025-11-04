// src/features/viewSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";



export const sendViewsBatch = createAsyncThunk(
  "views/sendBatch",
  async (ids) => {
    if (!ids?.length) return;
    await api.post("/view/bulk", { contentIds: ids });
    return ids;
  }
);

export const sendViewsSingle = createAsyncThunk(
    "views/sendSingle",
    async (id) => {
      if (!id?.length) return;

      await api.post(`/view/${id}`);
      return id;
    }
  );


  
  

const viewSlice = createSlice({
  name: "views",
  initialState: { viewedIds: [] },
  reducers: {
    addView(state, action) {
      const id = action.payload;
      if (!state.viewedIds.includes(id)) state.viewedIds.push(id);
    },
    clearViews(state) {
      state.viewedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendViewsBatch.fulfilled, (state) => {
      state.viewedIds = [];
    });
  },
});

export const { addView, clearViews } = viewSlice.actions;
export default viewSlice.reducer;
