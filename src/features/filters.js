// src/features/filters.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoryId: "", // افتراضي عرض الكل
  type: "",       // افتراضي الكل
  sort: "Newest", // افتراضي الاحدث
userName:"",
search:""

};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setCategory(state, action) {
      state.categoryId = action.payload;
    },
    setType(state, action) {
      state.type = action.payload;
    },
    setSort(state, action) {
      state.sort = action.payload;
    },
    setUserName(state, action) {
      state.userName = action.payload;
    },
    setSearch(state, action) {
      state.search = action.payload;
    },
  
    resetFilters(state) {
      state.categoryId = "";
      state.type = "";
      state.sort = "Newest";
      state.userName="";
      state.search=""
    },
  },
});

export const { setCategory, setType, setSort, resetFilters ,setUserName,setSearch} = filtersSlice.actions;
export default filtersSlice.reducer;
