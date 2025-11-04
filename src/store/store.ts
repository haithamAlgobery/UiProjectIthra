// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../features/category"; // موجود عندك
import filtersReducer from "../features/filters";
import optionsReducer from "../features/options";
import typesReducer from "../features/typecontent";
import contentReducer from "../features/content";
import file from "../features/file";
import resource from "../features/resource";
import viewContent from "../features/viewContentSlice";
import authReducer from "../features/authSlice";
import commentsReducer  from "../features/commentsSlice";
import relatedReducer from "../features/relatedSlice";
import dataBasicReducer from "../features/dataBasicSlice"
import profileReducer   from "../features/profileSlice"
import accountReducer   from "../features/accountSlice"
import favoritesSlice   from "../features/favoritesSlice"
import notificationsSlice   from "../features/notificationsSlice"
import reportTypesReducer from "../features/reportTypesSlice";
import reportsReducer from "../features/reportsSlice";
import tagsReducer  from "../features/tagsSlice";
import editableContentReducer  from "../features/editableContentSlice"; 
import viewSlice from "../features/viewSlice"; 
export const store = configureStore({
  reducer: {
    category: categoryReducer,
    filters: filtersReducer,       // القسم، النوع، الفرز الأولي محفوظ في redux
    options: optionsReducer,       // ترتيب (sort options)
    types: typesReducer,           // أنواع المحتوى (post/research)
    content: contentReducer,       // قائمة المنشورات + جلب المزيد + تفاعل
    file:file,
    resource:resource,
    viewContent:viewContent,
    auth:authReducer,
    comments: commentsReducer,
    related: relatedReducer,
    dataBasic:dataBasicReducer,
    profile: profileReducer,
    account:accountReducer,
    favorites:favoritesSlice,
    notifications:notificationsSlice,
    reportTypes: reportTypesReducer,
    reports: reportsReducer,
    tags: tagsReducer,
  editableContent: editableContentReducer,
  views:viewSlice

  },
});
// الآن بعد أن الـ store جاهز، نربط interceptors
import { attachInterceptors } from "../lib/axiosInstance";
try {
  attachInterceptors(store);
} catch (e) {
  console.error("Failed to attach axios interceptors:", e);
}

// Types for TS files
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
