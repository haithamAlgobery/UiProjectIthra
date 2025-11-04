// src/features/resource.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

export const createResource = createAsyncThunk(
  "resource/createResource",
  async ({ title, url, contentId, details }, { rejectWithValue }) => {
    try {
      const body = { title, url, contentId, details };
      const resp = await api.post("/resource", body);
      return resp.data;
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Create resource failed");
    }
  }
);

export const deleteResource = createAsyncThunk(
  "resource/deleteResource",
  async ({ id }, { rejectWithValue }) => {
    try {
      if (!id) throw new Error("Missing resource id");
      await api.delete(`/resource/${id}`);
      return { id };
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Delete resource failed");
    }
  }
);

export const fetchResourcesByContentId = createAsyncThunk(
  "resource/fetchResourcesByContentId",
  async ({ contentId }, { rejectWithValue }) => {
    try {
      const resp = await api.get("/resource/by-contentid", { params: { contentId } });
      console.log(resp.data);
      return resp.data || [];
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Fetch resources failed");
    }
  }
);
const initialState = {
  byContent: {},
  loading: false,
  error: null,
};

const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {
    resetResourcesForContent(state, action) {
      const contentId = action.payload;
      if (state.byContent[contentId]) delete state.byContent[contentId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload;
        const cid = res.contentId;
        if (!cid) return;
        state.byContent[cid] = state.byContent[cid] || [];
        state.byContent[cid].push(res);
      })
      .addCase(createResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Create resource failed";
      })

      .addCase(deleteResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.loading = false;
        const { id } = action.payload;
        Object.keys(state.byContent).forEach((cid) => {
          state.byContent[cid] = state.byContent[cid].filter((r) => r.id !== id);
        });
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Delete resource failed";
      })

      .addCase(fetchResourcesByContentId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourcesByContentId.fulfilled, (state, action) => {
        state.loading = false;
        const arr = action.payload || [];
        const cid = arr.length > 0 ? arr[0].contentId : null;
        if (cid) state.byContent[cid] = arr;
      })
      .addCase(fetchResourcesByContentId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Fetch resources failed";
      });
  },
});

export const { resetResourcesForContent } = resourceSlice.actions;
export default resourceSlice.reducer;
