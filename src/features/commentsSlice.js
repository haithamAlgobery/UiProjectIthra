// src/features/commentsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

export const fetchCommentsByContent = createAsyncThunk(
  "comments/fetchByContent",
  async ({ contentId }, { rejectWithValue }) => {
    try {
      const resp = await api.get(`/comment/by-contentid?contentId=${contentId}`);
      return resp.data || [];
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Fetch Comments Error");
    }
  }
);

export const postComment = createAsyncThunk(
  "comments/post",
  async ({ contentId, commentText }, { rejectWithValue }) => {
    try {
      const resp = await api.post("/comment", { contentId, commentText });
      
    
      return resp.data; // نتوقع تعليقاً واحداً أو status
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Post Comment Error");
    }
  }
);
export const editComment = createAsyncThunk(
  "comments/edit",
  async ({ commentId, commentText }, { rejectWithValue }) => {
    try {
    
      const resp = await api.put(`/comment/${commentId}`, {commentText,commentId});
      return resp.data || { id: commentId, commentText };
    } catch (err) {
      // طباعة تفصيلية للـ response من السيرفر
      if (err.response) {
        // إن كان هناك أخطاء ModelState نخرجها كنص واضح
        const serverData = err.response.data;
        if (serverData && serverData.errors) {
          // حوّل أخطاء ModelState إلى رسالة واحدة مفهومة
          const messages = Object.entries(serverData.errors)
            .map(([field, arr]) => `${field}: ${arr.join(" ; ")}`)
            .join(" || ");
          return rejectWithValue({ status: err.response.status, message: messages, raw: serverData });
        }
        return rejectWithValue({ status: err.response.status, message: serverData.title || JSON.stringify(serverData) });
      } else {
        return rejectWithValue(err.message || "Edit Comment Error");
      }
    }
  }
);

// حذف تعليق: DELETE /comment/{id}
export const deleteComment = createAsyncThunk(
  "comments/delete",
  async ({ commentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/comment/${commentId}`);
      // نعيد الـ id لكي نستطيع تحديث المصفوفة محلياً
      return { commentId };
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Delete Comment Error");
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    items: [],
    loading: false,
    posting: false,
    error: null,
    postError: null,
    editError: null,
    deleteError: null,
    editing: false,
    deleting: false,
  },
  reducers: {
    clearComments(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
    prependComment(state, action) {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCommentsByContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsByContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchCommentsByContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Fetch Comments Failed";
      })

      // post
      .addCase(postComment.pending, (state) => {
        state.posting = true;
        state.postError = null;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.posting = false;
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(postComment.rejected, (state, action) => {
        state.posting = false;
        state.postError = action.payload || action.error?.message || "Post Comment Failed";
      })

      // edit
      .addCase(editComment.pending, (state) => {
        state.editing = true;
        state.editError = null;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        state.editing = false;
        const updated = action.payload;
        // updated قد يكون كائن التعليق المحدث أو { id, commentText }
        const id = updated?.id || updated?.commentId || updated?.commentID || updated?._id;
        // إن لم يكن موجوداً، حاول أخذ id من خواص شبيهة:
        // أحياناً API يرجع معروفة مختلفة؛ لكن إذا لم نجد id نأخذ commentId من action.meta.arg
        const fallbackId = action.meta?.arg?.commentId;
        const targetId = id ?? fallbackId;

        if (targetId == null) return; // لا نغير شيء إن لم نجد id

        const idx = state.items.findIndex((c) => {
          // التأكد من مقاربة مع حقول id شائعة
          return c?.id === targetId || c?._id === targetId || c?.commentId === targetId;
        });

        if (idx !== -1) {
          // ندمج الحقول التي وصلت مع العنصر الحالي بحيث لا نخسر خصائص أخرى
          state.items[idx] = { ...state.items[idx], ...updated };
        } else {
          // إن لم يوجد العنصر في المصفوفة، نضيفه في البداية كاحتياط
          state.items.unshift(updated);
        }
      })
      .addCase(editComment.rejected, (state, action) => {
        state.editing = false;
        state.editError = action.payload || action.error?.message || "Edit Comment Failed";
      })

      // delete
      .addCase(deleteComment.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.deleting = false;
        // action.payload { commentId } كما رُجع أعلاه
        const commentId = action.payload?.commentId ?? action.meta?.arg?.commentId;
        if (commentId == null) return;
        state.items = state.items.filter(
          (c) => !(c?.id === commentId || c?._id === commentId || c?.commentId === commentId)
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || action.error?.message || "Delete Comment Failed";
      });
  },
});

export const { clearComments, prependComment } = commentsSlice.actions;
export default commentsSlice.reducer;
