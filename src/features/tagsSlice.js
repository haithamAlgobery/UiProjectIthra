
// ===== file: tagsSlice.js =====
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

// fetch tags for a content id
export const fetchTagsByContentId = createAsyncThunk(
  "tags/fetchByContent",
  async (contentId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tags/${contentId}`);
      // expected shape: { message, isSccess, data: { idContent, tags: [...] } }
      return res.data?.data?.tags ?? [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || String(err));
    }
  }
);


export const updateTagsByContentId = createAsyncThunk(
  "tags/updateByContent",
  async ({ contentId, tags }, { rejectWithValue }) => {
    try {
      if (!contentId) return rejectWithValue({ message: "contentId required" });
      if (!Array.isArray(tags)) return rejectWithValue({ message: "tags must be an array" });

      // prepare body exactly as server expects: only tags (camelCase)
      const body = { tags }; // will be serialized to {"tags":[...]}
    
      const res = await api.put(`/tags/${contentId}`, body);

      
      const updated = res?.data?.data?.tags ?? res?.data?.tags ?? res?.data ?? tags;

      return Array.isArray(updated) ? updated : tags;
    } catch (err) {
     

      // better error extraction like your editComment example
      if (err?.response) {
        const serverData = err.response.data;
        // If ASP.NET returned ModelState errors:
        if (serverData && serverData.errors) {
          const messages = Object.entries(serverData.errors)
            .map(([field, arr]) => {
              const list = Array.isArray(arr) ? arr.join(" ; ") : String(arr);
              return `${field}: ${list}`;
            })
            .join(" || ");
          return rejectWithValue({ status: err.response.status, message: messages, raw: serverData });
        }
        // otherwise return title or whole payload
        return rejectWithValue({ status: err.response.status, message: serverData?.title ?? JSON.stringify(serverData), raw: serverData });
      }

      return rejectWithValue({ message: err?.message ?? String(err) });
    }
  }
);


const tagsSlice = createSlice({
  name: "tags",
  initialState: {
    tags: [],
    loading: false,
    error: null,
    saving: false,
    saveError: null,
  },
  reducers: {
    setLocalTags(state, action) {
      state.tags = action.payload;
    },
    clearTags(state) {
      state.tags = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTagsByContentId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTagsByContentId.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload || [];
      })
      .addCase(fetchTagsByContentId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })
      .addCase(updateTagsByContentId.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateTagsByContentId.fulfilled, (state, action) => {
        state.saving = false;
        state.tags = action.payload || state.tags;
      })
      .addCase(updateTagsByContentId.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || action.error?.message;
      });
  },
});

export const { setLocalTags, clearTags } = tagsSlice.actions;
export default tagsSlice.reducer;


