// src/features/favorites.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

const DEFAULT_TAKE = 5;

// ---------------------- fetchFavorites ----------------------
// يدعم reset و lazy load (skip) عبر spik
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (payload = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const take = payload.take ?? state.favorites.take ?? DEFAULT_TAKE;
      const spik =
        typeof payload.spik === "number"
          ? payload.spik
          : payload.reset
          ? 0
          : state.favorites.spik ?? 0;

      const body = { take, spik };
      // يمكنك إضافة فلاتر إضافية هنا إن لزم
      const resp = await api.post("/favorite/filter", body);
      const items = resp.data ?? [];
      return { items, reset: !!payload.reset, returnedCount: items.length, take, spik };
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      throw err;
    }
  }
);

// ---------------------- reactOnFavorite ----------------------
// نفس endpoint التفاعل العام (مثل /reaction)
export const reactOnFavorite = createAsyncThunk(
  "favorites/reactOnFavorite",
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
// عند النجاح: يُعاد من السيرفر data - لو كان الإجراء إلغاء المفضلة على العنصر الموجود، سنقوم بإزالته من القائمة
export const toggleFavoriteOnFavoriteList = createAsyncThunk(
  "favorites/toggleFavoriteOnFavoriteList",
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
  items: [], // array of favorite items (may be wrapped as { content: {...} } or plain)
  loading: false,
  loadingMore: false,
  error: null,
  spik: 0, // backend term from API
  take: DEFAULT_TAKE,
  hasMore: true,
  optimisticSnapshots: {}, // store snapshot for rollback, keyed by contentId
};

// ---------------------- slice ----------------------
const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    resetFavorites(state) {
      state.items = [];
      state.spik = 0;
      state.hasMore = true;
      state.error = null;
      state.optimisticSnapshots = {};
    },

    // تحديث متفائل لتفاعل (like/notlike)
    applyOptimisticReactionForFavorite(state, action) {
      const { contentId, reactionType } = action.payload;
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx === -1) return;

      if (!state.optimisticSnapshots[contentId]) {
        state.optimisticSnapshots[contentId] = JSON.parse(JSON.stringify({ idx, item: state.items[idx] }));
      }

      const item = state.items[idx];
      item.interactiveCounts = item.interactiveCounts || { likeCount: 0, notLikeCount: 0, showCount: 0, commentCount: 0 };
      item.myInterActive = item.myInterActive || { isLike: false, isNotLike: false, isLove: true }; // في المفضلات غالبًا isLove = true

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

    // تحديث متفائل لإلغاء المفضلة — سنزيل العنصر محليًا (مع الاحتفاظ بصنابشوت للـ rollback)
    applyOptimisticRemoveFavorite(state, action) {
      const { contentId } = action.payload;
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx === -1) return;

      if (!state.optimisticSnapshots[contentId]) {
        state.optimisticSnapshots[contentId] = JSON.parse(JSON.stringify({ idx, item: state.items[idx] }));
      }

      // إزالة العنصر من القائمة فورياً
      state.items.splice(idx, 1);
      // تصحيح spik وskip/hasMore: ننقص spik بمقدار واحد لأن عنصر تم حذفه من الصفحة الحالية
      state.spik = Math.max(0, (state.spik || 0) - 1);
    },

    // rollback لـ أي عملية متفائلة
    rollbackFavoriteOptimistic(state, action) {
      const { contentId } = action.payload;
      const snap = state.optimisticSnapshots[contentId];
      if (!snap) return;

      // إذا كان snapshot يحتوي idx & item → نعيد العنصر لمكانه
      const { idx, item } = snap;
      // تأكد ألا يكون موجوداً الآن
      const exists = state.items.find((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (!exists) {
        // إذا idx أكبر من الطول نضعه في النهاية
        const insertAt = Math.min(idx, state.items.length);
        state.items.splice(insertAt, 0, item);
      }
      delete state.optimisticSnapshots[contentId];
    },
  },

  extraReducers: (builder) => {
    // FETCH
    builder
      .addCase(fetchFavorites.pending, (state, action) => {
        const isReset = action.meta.arg && action.meta.arg.reset;
        if (isReset) {
          state.loading = true;
          state.loadingMore = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        const { items, reset, returnedCount, take, spik } = action.payload;
        if (reset) {
          state.items = items;
          state.spik = returnedCount;
        } else {
          state.items = [...state.items, ...items];
          state.spik = (state.spik || 0) + returnedCount;
        }
        state.hasMore = returnedCount === take;
        state.loading = false;
        state.loadingMore = false;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.error = action.payload || action.error.message || "فشل جلب المفضلات";
        state.loading = false;
        state.loadingMore = false;
      });

    // REACTION success -> نحدث البند بالـ data المعادة و نمسح snapshot إن وجد
    builder.addCase(reactOnFavorite.fulfilled, (state, action) => {
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

    // REACTION rejected -> rollback أو استخدم الحمولة من السيرفر إذا متوفرة
    builder.addCase(reactOnFavorite.rejected, (state, action) => {
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
          const exists = state.items.find((it) => (it.content ? it.content.id === contentId : it.id === contentId));
          if (!exists) {
            const insertAt = Math.min(snap.idx, state.items.length);
            state.items.splice(insertAt, 0, snap.item);
          }
          delete state.optimisticSnapshots[contentId];
        }
      }
      state.error = action.payload || action.error?.message || "فشل التفاعل";
    });

    // TOGGLE FAVORITE fulfilled -> عادةً عند نجاح إلغاء المفضلة، سيرفر قد يعيد myInterActive مع isLove=false
    // ما نفعله هنا: إذا السيرفر أعاد أن العنصر لم يعد في المفضلات -> نزيله نهائياً
    builder.addCase(toggleFavoriteOnFavoriteList.fulfilled, (state, action) => {
      const { contentId, data } = action.payload;
      // تحديث إن تبقى (مثلاً لتحديث interactiveCounts) أو إزالة إن لم يعد love
      const idx = state.items.findIndex((it) => (it.content ? it.content.id === contentId : it.id === contentId));
      if (idx !== -1) {
        const serverMyActive = data && data.myInterActive;
        // إذا السيرفر أشار isLove === false => إلغاء المفضلة — نزيل العنصر
        if (serverMyActive && serverMyActive.isLove === false) {
          // حذف العنصر
          state.items.splice(idx, 1);
          // ضبط spik لان عنصر اختفى من القائمة
          state.spik = Math.max(0, (state.spik || 0) - 1);
        } else {
          // خلاف ذلك نحدث counts/myInterActive
          state.items[idx] = {
            ...state.items[idx],
            ...(data.interactiveCounts ? { interactiveCounts: data.interactiveCounts } : {}),
            ...(data.myInterActive ? { myInterActive: data.myInterActive } : {}),
          };
        }
      }
      if (state.optimisticSnapshots[contentId]) delete state.optimisticSnapshots[contentId];
    });

    // TOGGLE FAVORITE rejected -> rollback snapshot أو استخدم payload من السيرفر
    builder.addCase(toggleFavoriteOnFavoriteList.rejected, (state, action) => {
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
          // إعادة العنصر إلى مكانه
          const exists = state.items.find((it) => (it.content ? it.content.id === contentId : it.id === contentId));
          if (!exists) {
            const insertAt = Math.min(snap.idx, state.items.length);
            state.items.splice(insertAt, 0, snap.item);
          }
          delete state.optimisticSnapshots[contentId];
        }
      }
      state.error = action.payload || action.error?.message || "فشل تغيير المفضلة";
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
  resetFavorites,
  applyOptimisticReactionForFavorite,
  applyOptimisticRemoveFavorite,
  rollbackFavoriteOptimistic,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;

