// ===== file: editableContentSlice.js =====
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

// Fetch content by id
export const fetchContentById = createAsyncThunk(
  "editableContent/fetchById",
  async (contentId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/content/${contentId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || String(err));
    }
  }
);




// Update content by id — build FormData with exact backend DTO field names
// Backend DTO expects: Title, Details, Description, FileFromTypeImageOrVido, CategoryId
export const updateContentById = createAsyncThunk(
  "editableContent/updateById",
  async ({ contentId, payload }, { rejectWithValue }) => {
    try {
      if (!contentId) {
        return rejectWithValue({ message: "contentId is required" });
      }

      const fd = new FormData();
      fd.append("Title", payload.title ?? "");
      fd.append("Details", payload.details ?? "");
      fd.append("Description", payload.description ?? "");
      fd.append("CategoryId", payload.categoryId ?? "");
      fd.append("IdContent", "id");
      if (payload.file instanceof File) {
        fd.append("FileFromTypeImageOrVido", payload.file);
      }

      

      // لا تضف Content-Type يدوياً — axios/المتصفح سيضبط الـ boundary
      const res = await api.put(`/content/${contentId}`, fd);

      const result = res?.data?.data ?? res?.data ?? res;
      return result;
    } catch (err) {
      // إذا جاء رد من السيرفر، حاول استخراج أخطاء ModelState بطريقة واضحة
      if (err?.response) {
        const serverData = err.response.data;
        // ASP.NET مشكلة التحقق تعيد شكل: { title, status, errors: { Field: ["msg1","msg2"] } }
        if (serverData && serverData.errors) {
          const messages = Object.entries(serverData.errors)
            .map(([field, arr]) => {
              const list = Array.isArray(arr) ? arr.join(" ; ") : String(arr);
              return `${field}: ${list}`;
            })
            .join(" || ");
          // أعد rejectWithValue مع تفاصيل مفيدة
          return rejectWithValue({ status: err.response.status, message: messages, raw: serverData });
        }
        // حالة أخرى: أعد العنوان أو النص الخام
        return rejectWithValue({ status: err.response.status, message: serverData?.title ?? JSON.stringify(serverData), raw: serverData });
      }

      return rejectWithValue({ message: err?.message ?? String(err) });
    }
  }
);


const initialState = {
  content: null,
  loading: false,
  error: null,
  saving: false,
  saveError: null,
};

const editableContentSlice = createSlice({
  name: "editableContent",
  initialState,
  reducers: {
    setContentField(state, action) {
      if (!state.content) state.content = {};
      const { field, value } = action.payload;
      state.content[field] = value;
    },
    clearContent(state) {
      state.content = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContentById.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload;
      })
      .addCase(fetchContentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })
      .addCase(updateContentById.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateContentById.fulfilled, (state, action) => {
        state.saving = false;
        state.content = action.payload || state.content;
      })
      .addCase(updateContentById.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || action.error?.message;
      });
  },
});

export const { setContentField, clearContent } = editableContentSlice.actions;
export default editableContentSlice.reducer;







