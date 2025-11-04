import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead, // ✅ أضفنا الدالة الجديدة
  selectAllNotifications,
  selectUnreadCount,
  selectTotalCount,
  selectNotificationsLoading,
  selectNotificationsError
} from "@/src/features/notificationsSlice";

export default function useNotifications() {
  const dispatch = useDispatch();
  const items = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const totalCount = useSelector(selectTotalCount);
  const loading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);

  // 🟢 جلب كل الإشعارات
  const loadNotifications = useCallback(() => {
    return dispatch(fetchNotifications()).unwrap();
  }, [dispatch]);

  // 🟢 تحويل الكل إلى مقروء
  const markAllRead = useCallback(() => {
    return dispatch(markAllNotificationsRead()).unwrap();
  }, [dispatch]);

  // 🟢 تحويل إشعار واحد إلى مقروء
  const markOneRead = useCallback(
    (id) => {
      return dispatch(markNotificationRead(id)).unwrap();
    },
    [dispatch]
  );

  return {
    items,
    unreadCount,
    totalCount,
    loading,
    error,
    loadNotifications,
    markAllRead,
    markOneRead // ✅ الدالة الجديدة
  };
}
