// src/features/relatedSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

const DEFAULT_TAKE = 5;

// ---------------------- fetchRelated ----------------------
// payload: { contentId, take?, spik?, reset? }
export const fetchRelated = createAsyncThunk(
  "related/fetchRelated",
  async (payload = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const contentId = payload.contentId ?? state.related.lastContentId;
      if (!contentId) throw new Error("contentId required for fetchRelated");

      const take = payload.take ?? state.related.take ?? DEFAULT_TAKE;
      const spik =
        typeof payload.spik === "number"
          ? payload.spik
          : payload.reset
          ? 0
          : state.related.spik ?? 0;

      const body = { contentId, take, spik };
      const resp = await api.post("/content/suggestions", body);
      const items = resp.data ?? [];
      return { items, reset: !!payload.reset, returnedCount: items.length, take, spik, contentId };
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      throw err;
    }
  }
);

// reuse the existing reaction endpoint (if same as favorites)
export const reactOnRelated = createAsyncThunk(
  "related/reactOnRelated",
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

// toggle favorite (server-side) — we call same /favorite endpoint
export const toggleFavoriteOnRelatedList = createAsyncThunk(
  "related/toggleFavoriteOnRelatedList",
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

const initialState = {
  items: [] ,
  loading: false,
  loadingMore: false,
  error: null ,
  spik: 0,
  take: DEFAULT_TAKE,
  hasMore: true,
  lastContentId: null,
  optimisticSnapshots: {} ,
};

const relatedSlice = createSlice({
  name: "related",
  initialState,
  reducers: {
    resetRelated(state) {
      state.items = [];
      state.spik = 0;
      state.hasMore = true;
      state.error = null;
      state.optimisticSnapshots = {};
      state.lastContentId = null;
    },

    // تحديث متفائل للتفاعل (like/notLike)
    applyOptimisticReactionForRelated(state, action) {
      const { contentId, reactionType } = action.payload;
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx === -1) return;

      if (!state.optimisticSnapshots[contentId]) {
        state.optimisticSnapshots[contentId] = JSON.parse(JSON.stringify({ idx, item: state.items[idx] }));
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

    // تحديث متفائل لزر الحفظ (save) — لا نزيل العنصر، فقط نغيّر isLove
    applyOptimisticToggleSaveForRelated(state, action) {
      const { contentId } = action.payload;
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx === -1) return;

      if (!state.optimisticSnapshots[contentId]) {
        state.optimisticSnapshots[contentId] = JSON.parse(JSON.stringify({ idx, item: state.items[idx] }));
      }

      const item = state.items[idx];
      item.myInterActive = item.myInterActive || { isLike: false, isNotLike: false, isLove: false };
      item.myInterActive.isLove = !item.myInterActive.isLove; // toggle locally
      state.items[idx] = { ...item };
    },

    rollbackRelatedOptimistic(state, action) {
      const { contentId } = action.payload;
      const snap = state.optimisticSnapshots[contentId];
      if (!snap) return;
      const { idx, item } = snap;
      // replace if exists
      const existsIdx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (existsIdx !== -1) {
        state.items[existsIdx] = item;
      } else {
        const insertAt = Math.min(idx, state.items.length);
        state.items.splice(insertAt, 0, item);
      }
      delete state.optimisticSnapshots[contentId];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchRelated.pending, (state, action) => {
        const isReset = action.meta.arg && action.meta.arg.reset;
        if (isReset) {
          state.loading = true;
          state.loadingMore = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchRelated.fulfilled, (state, action) => {
        const { items, reset, returnedCount, take, spik, contentId } = action.payload;
        if (reset) {
          state.items = items;
          state.spik = returnedCount;
          state.lastContentId = contentId;
        } else {
          state.items = [...state.items, ...items];
          state.spik = (state.spik || 0) + returnedCount;
        }
        state.hasMore = returnedCount === take;
        state.loading = false;
        state.loadingMore = false;
      })
      .addCase(fetchRelated.rejected, (state, action) => {
        state.error = action.payload || action.error?.message || "فشل جلب المحتوى المشابه";
        state.loading = false;
        state.loadingMore = false;
      });

    // REACTION fulfilled -> نحدث البند بالـ data المعادة و نمسح snapshot إن وجد
    builder.addCase(reactOnRelated.fulfilled, (state, action) => {
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

    builder.addCase(reactOnRelated.rejected, (state, action) => {
      const contentId = action.meta.arg && action.meta.arg.contentId;
      const snap = state.optimisticSnapshots[contentId];
      if (snap) {
        const exists = state.items.find((it) => (it.content ? it.content.id === contentId : it.id === contentId));
        if (!exists) {
          const insertAt = Math.min(snap.idx, state.items.length);
          state.items.splice(insertAt, 0, snap.item);
        } else {
          // restore the snapshot item
          const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
          if (idx !== -1) state.items[idx] = snap.item;
        }
        delete state.optimisticSnapshots[contentId];
      }
      state.error = action.payload || action.error?.message || "فشل التفاعل";
    });

    // toggleFavoriteOnRelatedList fulfilled -> لا نقوم بإزالة العنصر من القائمة هنا (لأن هذه feed ليست قائمة مفضلات)
    builder.addCase(toggleFavoriteOnRelatedList.fulfilled, (state, action) => {
      const { contentId, data } = action.payload;
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx !== -1) {
        // فقط حدّث myInterActive/interativeCounts إن أعادها السيرفر
        state.items[idx] = {
          ...state.items[idx],
          ...(data.interactiveCounts ? { interactiveCounts: data.interactiveCounts } : {}),
          ...(data.myInterActive ? { myInterActive: data.myInterActive } : {}),
        };
      }
      if (state.optimisticSnapshots[contentId]) delete state.optimisticSnapshots[contentId];
    });

    builder.addCase(toggleFavoriteOnRelatedList.rejected, (state, action) => {
      const contentId = action.meta.arg && action.meta.arg.contentId;
      const snap = state.optimisticSnapshots[contentId];
      if (snap) {
        // rollback
        const existsIdx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
        if (existsIdx !== -1) {
          state.items[existsIdx] = snap.item;
        }
        delete state.optimisticSnapshots[contentId];
      }
      state.error = action.payload || action.error?.message || "فشل تغيير المفضلة";
    });
  },
});

export const {
  resetRelated,
  applyOptimisticReactionForRelated,
  applyOptimisticToggleSaveForRelated,
  rollbackRelatedOptimistic,
} = relatedSlice.actions;

export default relatedSlice.reducer;
