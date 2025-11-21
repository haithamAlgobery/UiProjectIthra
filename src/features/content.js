// src/features/content.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

const DEFAULT_TAKE = 8;

// ---------------------- createContent (NEW) ----------------------
export const createContent = createAsyncThunk(
  "content/createContent",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append("title", payload.title ?? "");
      fd.append("Description", payload.description ?? "");
      fd.append("details", payload.details ?? "");
      fd.append("CategoryId", payload.categoryId ?? "");
      fd.append("TypeCode", payload.typeCode ?? "research");

      // append tags: backend may accept multiple Tags entries
      if (Array.isArray(payload.tags)) {
        payload.tags.forEach((t) => {
          fd.append("Tags", t);
        });
      }

      // file
      if (payload.file) {
        fd.append("FileFromTypeImageOrVido", payload.file);
      }

      const resp = await api.post("/Content", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const created = resp?.data?.data ?? resp?.data ?? null;
      return created;
      
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      throw err;
    }
  }
);

// ---------------------- fetchContent ----------------------
export const fetchContent = createAsyncThunk(
  "content/fetchContent",
  async (payload = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const take = payload.take ?? state.content.take ?? DEFAULT_TAKE;
      const skip =
        typeof payload.skip === "number"
          ? payload.skip
          : payload.reset
          ? 0
          : state.content.skip ?? 0;

      const body = { take, Skip: skip, sort: payload.sort ?? state.filters?.sort ?? "Newest" };
      if (payload.categoryId) body.categoryId = payload.categoryId;
      if (payload.type) body.type = payload.type;
      if (payload.userName) body.userName = payload.userName;
      if (payload.search) body.searchKey = payload.search;

      const resp = await api.post("/content/browse", body);
      const items = resp.data ?? [];
   
      return { items, reset: !!payload.reset, returnedCount: items.length, take };
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      throw err;
    }
  }
);


export const fetchRelatedContent = createAsyncThunk(
  "content/fetchRelated",
  async ({ contentId, take = 4, spik = 0 }, { rejectWithValue }) => {
    try {
      const resp = await api.post("/content/suggestions", { contentId, take, spik });
      return resp.data || [];
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Fetch Related Error");
    }
  }
);


// ---------------------- reactOnContent ----------------------
export const reactOnContent = createAsyncThunk(
  "content/reactOnContent",
  async ({ contentId, reactionType }, { rejectWithValue }) => {
    try {
      const resp = await api.post("/reaction", { contentId, reactionType });
      return { contentId, data: resp.data };
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      throw err;
    }
  }
);

// ---------------------- toggleFavorite ----------------------
export const toggleFavorite = createAsyncThunk(
  "content/toggleFavorite",
  async ({ contentId }, { rejectWithValue }) => {
    try {
      const resp = await api.post("/favorite", { contentId });
      return { contentId, data: resp.data };
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      throw err;
    }
  }
);

// ---------------------- deleteContent ----------------------
export const deleteContent = createAsyncThunk(
  "content/deleteContent",
  async (contentId, { rejectWithValue }) => {
    try {
      await api.delete(`/content/${contentId}`);
      return contentId;
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue(err.message || "Delete Error");
    }
  }
);

// ---------------------- initial state ----------------------
const initialState = {
  items: [],
  loading: false,
  loadingMore: false,
  error: null,
  skip: 0,
  take: DEFAULT_TAKE,
  hasMore: true,
  optimisticSnapshots: {},


};

// ---------------------- slice ----------------------
const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    resetContent(state) {
      state.items = [];
      state.skip = 0;
      state.hasMore = true;
      state.error = null;
      state.optimisticSnapshots = {};
 
    },

    applyOptimisticReaction(state, action) {
      const { contentId, reactionType } = action.payload;
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx === -1) return;

      if (!state.optimisticSnapshots[contentId]) {
        state.optimisticSnapshots[contentId] = JSON.parse(JSON.stringify(state.items[idx]));
      }

      const item = state.items[idx];
      item.interactiveCounts = item.interactiveCounts || { likeCount: 0, notLikeCount: 0, showCount: 0, commentCount: 0 };
      item.myInterActive = item.myInterActive || { isLike: false, isNotLike: false, isLove: false };

      if (reactionType === true) {
        if (item.myInterActive.isLike) {
          item.myInterActive.isLike = false;
          item.interactiveCounts.likeCount = Math.max(0, (item.interactiveCounts.likeCount || 0) - 1);
        } else {
          item.myInterActive.isLike = true;
          item.interactiveCounts.likeCount = (item.interactiveCounts.likeCount || 0) + 1;
          if (item.myInterActive.isNotLike) {
            item.myInterActive.isNotLike = false;
            item.interactiveCounts.notLikeCount = Math.max(0, (item.interactiveCounts.notLikeCount || 0) - 1);
          }
        }
      } else {
        if (item.myInterActive.isNotLike) {
          item.myInterActive.isNotLike = false;
          item.interactiveCounts.notLikeCount = Math.max(0, (item.interactiveCounts.notLikeCount || 0) - 1);
        } else {
          item.myInterActive.isNotLike = true;
          item.interactiveCounts.notLikeCount = (item.interactiveCounts.notLikeCount || 0) + 1;
          if (item.myInterActive.isLike) {
            item.myInterActive.isLike = false;
            item.interactiveCounts.likeCount = Math.max(0, (item.interactiveCounts.likeCount || 0) - 1);
          }
        }
      }

      state.items[idx] = { ...item };
    },

    applyOptimisticFavorite(state, action) {
      const { contentId } = action.payload;
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx === -1) return;

      if (!state.optimisticSnapshots[contentId]) {
        state.optimisticSnapshots[contentId] = JSON.parse(JSON.stringify(state.items[idx]));
      }

      const item = state.items[idx];
      item.myInterActive = item.myInterActive || { isLike: false, isNotLike: false, isLove: false };
      item.myInterActive.isLove = !item.myInterActive.isLove;
      state.items[idx] = { ...item };
    },

    rollbackOptimistic(state, action) {
      const { contentId } = action.payload;
      const snap = state.optimisticSnapshots[contentId];
      if (snap) {
        const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
        if (idx !== -1) {
          state.items[idx] = snap;
        }
        delete state.optimisticSnapshots[contentId];
      }
    },
  },

  extraReducers: (builder) => {
    // FETCH
    builder
      .addCase(fetchContent.pending, (state, action) => {
        const isReset = action.meta.arg && action.meta.arg.reset;
        if (isReset) {
          state.loading = true;
          state.loadingMore = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        const { items, reset, returnedCount, take,params } = action.payload;
        if (reset) {
          state.items = items;
          state.skip = returnedCount;
        } else {
          state.items = [...state.items, ...items];
          state.skip = state.skip + returnedCount;
        }
        state.hasMore = returnedCount === take;
        state.loading = false;
        state.loadingMore = false;

     
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.error = action.payload || action.error.message || "فشل جلب المحتوى";
        state.loading = false;
        state.loadingMore = false;
      });

    // REACTION success -> replace item with server returned data & clear snapshot
    builder.addCase(reactOnContent.fulfilled, (state, action) => {
      const { contentId, data } = action.payload;
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx !== -1) {
        if (data && (data.interactiveCounts || data.myInterActive || data.content || data.category)) {
          state.items[idx] = {
            ...state.items[idx],
            ...(data.content ? { content: data.content } : {}),
            ...(data.interactiveCounts ? { interactiveCounts: data.interactiveCounts } : {}),
            ...(data.myInterActive ? { myInterActive: data.myInterActive } : {}),
            ...(data.shortDetailsUser ? { shortDetailsUser: data.shortDetailsUser } : {}),
            ...(data.category ? { category: data.category } : {}),
          };
        }
      }
      if (state.optimisticSnapshots[contentId]) delete state.optimisticSnapshots[contentId];
    });

    // REACTION rejected -> try to restore from server payload or rollback snapshot
    builder.addCase(reactOnContent.rejected, (state, action) => {
      const contentId = action.meta.arg && action.meta.arg.contentId;
      if (action.payload && action.payload.interactiveCounts) {
        const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            interactiveCounts: action.payload.interactiveCounts || state.items[idx].interactiveCounts,
            myInterActive: action.payload.myInterActive || state.items[idx].myInterActive,
          };
        }
        if (state.optimisticSnapshots[contentId]) delete state.optimisticSnapshots[contentId];
      } else {
        const snap = state.optimisticSnapshots[contentId];
        if (snap) {
          const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
          if (idx !== -1) state.items[idx] = snap;
          delete state.optimisticSnapshots[contentId];
        }
      }
      state.error = action.payload || action.error?.message || "فشل التفاعل";
    });

    // FAVORITE fulfilled -> replace with server data & clear snapshot
    builder.addCase(toggleFavorite.fulfilled, (state, action) => {
      const { contentId, data } = action.payload;
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx !== -1) {
        state.items[idx] = {
          ...state.items[idx],
          ...(data.interactiveCounts ? { interactiveCounts: data.interactiveCounts } : {}),
          ...(data.myInterActive ? { myInterActive: data.myInterActive } : {}),
        };
      }
      if (state.optimisticSnapshots[contentId]) delete state.optimisticSnapshots[contentId];
    });

    // FAVORITE rejected -> rollback to snapshot or use server payload
    builder.addCase(toggleFavorite.rejected, (state, action) => {
      const contentId = action.meta.arg && action.meta.arg.contentId;
      if (action.payload && (action.payload.interactiveCounts || action.payload.myInterActive)) {
        const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            interactiveCounts: action.payload.interactiveCounts || state.items[idx].interactiveCounts,
            myInterActive: action.payload.myInterActive || state.items[idx].myInterActive,
          };
        }
      } else {
        const snap = state.optimisticSnapshots[contentId];
        if (snap) {
          const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
          if (idx !== -1) state.items[idx] = snap;
          delete state.optimisticSnapshots[contentId];
        }
      }
      state.error = action.payload || action.error?.message || "فشل الحفظ";
    });

    // CREATE handlers
    builder
      .addCase(createContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContent.fulfilled, (state, action) => {
        const created = action.payload;
        if (created) {
          // ensure shortDetailsUser exists with requested defaults
          if (!created.shortDetailsUser) {
            created.shortDetailsUser = {
              urlImage: "", // empty for now; you will set real user image after adding auth
              firstName: "انت",
              lastName: "الناشر",
            };
          } else {
            // ensure the expected keys exist (fill defaults if missing)
            created.shortDetailsUser.urlImage = created.shortDetailsUser.urlImage ?? "";
            created.shortDetailsUser.firstName = created.shortDetailsUser.firstName ?? "انت";
            created.shortDetailsUser.lastName = created.shortDetailsUser.lastName ?? "الناش";
          }

          // add to items (respect wrapper shape if present)
          const expectWrapped = state.items.length > 0 && state.items[0] && state.items[0].content;
          if (expectWrapped) {
            state.items = [{ content: created }, ...state.items];
          } else {
            state.items = [created, ...state.items];
          }
          state.skip = (state.skip ?? 0) + 1;
        }
        state.loading = false;
      })
      .addCase(createContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "فشل إنشاء المنشور";
      });
        builder
          .addCase(fetchRelatedContent.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(fetchRelatedContent.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload || [];
          })
          .addCase(fetchRelatedContent.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error?.message || "Fetch Related Failed";
          });

           // DELETE content handlers
    builder
    .addCase(deleteContent.pending, (state, action) => {
      const contentId = action.meta.arg;
      // إضافة حالة مؤقتة "قيد الحذف"
      const idx = state.items.findIndex(
        (it) => (it.content ? it.content.id === contentId : it.id === contentId)
      );
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], deleting: true };
      }
    })
    .addCase(deleteContent.fulfilled, (state, action) => {
      const contentId = action.payload;
      // إزالة العنصر من القائمة بعد نجاح الحذف
      state.items = state.items.filter(
        (it) => (it.content ? it.content.id !== contentId : it.id !== contentId)
      );
      // إزالة أي snapshot مؤقت
      if (state.optimisticSnapshots[contentId]) delete state.optimisticSnapshots[contentId];
    })
    .addCase(deleteContent.rejected, (state, action) => {
      const contentId = action.meta.arg;
      // إزالة حالة "قيد الحذف" عند الفشل
      const idx = state.items.findIndex(
        (it) => (it.content ? it.content.id === contentId : it.id === contentId)
      );
      if (idx !== -1) {
        const item = { ...state.items[idx] };
        delete item.deleting;
        state.items[idx] = item;
      }
      state.error = action.payload || action.error?.message || "فشل الحذف";
    });

  },
});

export const {
  resetContent,
  applyOptimisticReaction,
  applyOptimisticFavorite,
  rollbackOptimistic,
} = contentSlice.actions;

export default contentSlice.reducer;
