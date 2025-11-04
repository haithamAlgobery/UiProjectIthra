// src/features/viewContentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

export const fetchContentFull = createAsyncThunk(
  "viewContent/fetchContentFull",
  async ({ contentId }, { rejectWithValue }) => {
    try {
      const resp = await api.get(`/content/${contentId}/full`);
      return resp.data; // حسب الـ API الذي أعطيتني
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Fetch Content Error");
    }
  }
);

const initialState = {
  content: null,
  loading: false,
  error: null,
};

const viewContentSlice = createSlice({
  name: "viewContent",
  initialState,
  reducers: {
    resetContent(state) {
      state.content = null;
      state.loading = false;
      state.error = null;
    },

    applyInteractionUpdate(state, action) {
      if (!state.content) return;
    
      const { type, conId } = action.payload;
      if (state.content.contentId != conId) return;
    
      const my = state.content.myInterActive || {};
      const counts = state.content.interactiveCounts || {
        likeCount: 0,
        notLikeCount: 0,
        saveCount: 0,
      };
    
      // Helper to clamp counts >= 0
      const clamp0 = (v) => (v < 0 ? 0 : v);
    
      // Some projects call "save" field isLove or isSaved — detect existing key
      const saveKey = ("isSaved" in my) ? "isSaved" : (("isLove" in my) ? "isLove" : "isSaved");
      if (!(saveKey in my)) my[saveKey] = false;
    
      // Ensure like/notLike keys exist
      if (typeof my.isLike !== "boolean") my.isLike = false;
      if (typeof my.isNotLike !== "boolean") my.isNotLike = false;
    
      if (type === "save") {
        // Toggle saved/favourite
        my[saveKey] = !my[saveKey];
    
       
      } else if (type === "like") {
        const wasLike = my.isLike;
        const wasNotLike = my.isNotLike;
    
        if (!wasLike) {
          // user is liking now
          counts.likeCount = (counts.likeCount || 0) + 1;
          // if they previously had notLike, remove that
          if (wasNotLike) {
            counts.notLikeCount = clamp0((counts.notLikeCount || 0) - 1);
          }
          my.isLike = true;
          my.isNotLike = false;
        } else {
          // user is un-liking (toggle off)
          counts.likeCount = clamp0((counts.likeCount || 0) - 1);
          my.isLike = false;
        }
      } else if (type === "notLike" || type === "not_like" || type === "dislike") {
        // Support a few possible type names for "not like"
        const wasLike = my.isLike;
        const wasNotLike = my.isNotLike;
    
        if (!wasNotLike) {
          // user is marking notLike now
          counts.notLikeCount = (counts.notLikeCount || 0) + 1;
          // if they previously had like, remove that
          if (wasLike) {
            counts.likeCount = clamp0((counts.likeCount || 0) - 1);
          }
          my.isNotLike = true;
          my.isLike = false;
        } else {
          // toggle off notLike
          counts.notLikeCount = clamp0((counts.notLikeCount || 0) - 1);
          my.isNotLike = false;
        }
      } 
      state.content.myInterActive = my;
      state.content.interactiveCounts = {
        ...state.content.interactiveCounts,
        likeCount: clamp0(counts.likeCount || 0),
        notLikeCount: clamp0(counts.notLikeCount || 0),
        ...(counts.saveCount !== undefined ? { saveCount: clamp0(counts.saveCount) } : {}),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContentFull.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContentFull.fulfilled, (state, action) => {
        state.loading = false;
        // API قد يرجع كائن يحتوي على الحقول كما أعطيتني
        state.content = action.payload || null;
      })
      .addCase(fetchContentFull.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Fetch Content Failed";
      });
  },
});

export const { resetContent, applyInteractionUpdate } = viewContentSlice.actions;
export default viewContentSlice.reducer;
