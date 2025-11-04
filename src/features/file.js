// src/features/file.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

// upload single file (formData)
export const uploadFile = createAsyncThunk(
  "file/uploadFile",
  async ({ contentId, title, details, file }, { rejectWithValue }) => {
    try {
      if (!contentId) throw new Error("Missing contentId");
      const fd = new FormData();
      fd.append("contentId", contentId);
      fd.append("title", title ?? "");
      fd.append("details", details ?? "");
      fd.append("file", file);

      const resp = await api.post("/File", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // API returns created file object
      return resp.data;
    } catch (err) {
      // backend returns 400 with text -> put message into rejectWithValue
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Upload failed");
    }
  }
);




export const deleteFile = createAsyncThunk(
  "file/deleteFile",
  async ({ id }, { rejectWithValue }) => {
    try {
      if (!id) throw new Error("Missing file id");
      await api.delete(`/File/${id}`);
      return { id };
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Delete failed");
    }
  }
);

export const fetchFilesByContentId = createAsyncThunk(
  "file/fetchFilesByContentId",
  async ({ contentId }, { rejectWithValue }) => {
    try {
      // If your backend supports fetching files by contentId add the endpoint here.
      // Otherwise client can keep local list from uploads. For completeness, try GET /File?contentId=...
      const resp = await api.get("/File/by-contentid", { params: { contentId } });
      return resp.data || [];
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Fetch files failed");
    }
  }
);


export const downloadFile = createAsyncThunk(
  "file/downloadFile",
  // ننتظر كائن يحتوي fileId
  async ({ fileId }, { rejectWithValue }) => {
    try {
      // اجلب الملف كـ blob
      const resp = await api.get(`/filedownload/${fileId}/download-file`, {
        responseType: "blob",
      });

      // حاول استخراج اسم الملف من الهيدر Content-Disposition (إن وُجد)
      const contentDisposition =
        resp.headers["content-disposition"] || resp.headers["Content-Disposition"];
      let filename = undefined;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      // إرجع blob واسم الملف ونوع المحتوى
      return {
        blob: resp.data,
        filename: filename || `download_${fileId}`,
        contentType: resp.headers["content-type"] || "application/octet-stream",
      };
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "download error");
    }
  }
);
const initialState = {
  byContent: {}, // { [contentId]: [files...] }
  loading: false,
  error: null,
};

const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    resetFilesForContent(state, action) {
      const contentId = action.payload;
      if (state.byContent[contentId]) delete state.byContent[contentId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        const fileObj = action.payload;
        const cid = fileObj.contentId || fileObj.contentId || fileObj.contentId; // defensive
        if (!cid) return (state.loading = false);
        state.byContent[cid] = state.byContent[cid] || [];
        state.byContent[cid].push(fileObj);
        state.loading = false;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Upload failed";
      })

      .addCase(deleteFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.loading = false;
        const { id } = action.payload;
        // find and remove across content collections
        Object.keys(state.byContent).forEach((cid) => {
          state.byContent[cid] = state.byContent[cid].filter((f) => f.id !== id);
        });
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Delete failed";
      })

      .addCase(fetchFilesByContentId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilesByContentId.fulfilled, (state, action) => {
        state.loading = false;
        const arr = action.payload || [];
        // try to get contentId from first element if provided
        const cid = arr.length > 0 ? arr[0].contentId : null;
        if (cid) state.byContent[cid] = arr;
      })
      .addCase(fetchFilesByContentId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Fetch failed";
      });
  },
});

export const { resetFilesForContent } = fileSlice.actions;
export default fileSlice.reducer;
