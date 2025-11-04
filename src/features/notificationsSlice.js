import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance";

// 🟢 جلب كل الإشعارات
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user-notifications");
      return res.data; // متوقع مصفوفة
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🟢 تحويل كل الإشعارات إلى مقروءة
export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.patch("/user-notifications/read-all");
      return res.data ?? true;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🟢 تحويل إشعار واحد إلى مقروءة
export const markNotificationRead = createAsyncThunk(
  "notifications/markOneRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/user-notifications/${id}/read`);
      return { id, data: res.data ?? true };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  items: [],
  loading: "idle",
  error: null,
  lastFetch: null
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // إضافة أو تحديث إشعار واحد (مفيد لاحقًا لـ WebSocket)
    upsertNotification(state, action) {
      const n = action.payload;
      const idx = state.items.findIndex(i => i.id === n.id);
      if (idx === -1) state.items.unshift(n);
      else state.items[idx] = n;
    },
    // تعيين كل الإشعارات كمقروءة محلياً
    markAllReadLocal(state) {
      state.items = state.items.map(i => ({ ...i, isRead: true }));
    },
    clearNotifications(state) {
      state.items = [];
      state.loading = "idle";
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // 🔹 جلب الإشعارات
      .addCase(fetchNotifications.pending, state => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || action.error.message;
      })

      // 🔹 تحويل الكل إلى مقروء
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map(i => ({ ...i, isRead: true }));
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // 🔹 تحويل إشعار واحد إلى مقروء
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const { id } = action.payload;
        const idx = state.items.findIndex(i => i.id === id);
        if (idx !== -1) {
          state.items[idx].isRead = true;
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  }
});

export const { upsertNotification, markAllReadLocal, clearNotifications } =
  notificationsSlice.actions;

// 🔹 Selectors
export const selectAllNotifications = state => state.notifications.items;
export const selectUnreadCount = state =>
  state.notifications.items.filter(n => !n.isRead).length;
export const selectTotalCount = state => state.notifications.items.length;
export const selectNotificationsLoading = state => state.notifications.loading;
export const selectNotificationsError = state => state.notifications.error;

export default notificationsSlice.reducer;
