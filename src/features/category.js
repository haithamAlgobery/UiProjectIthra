import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../lib/axiosInstance"

const initialState = {
  data: [],
  loading: false,
  error: null,
}

// جلب البيانات من API
export const fetchCategories = createAsyncThunk(
    "category/fetchCategories",
    async () => {
      const response = await api.get("/category/hierarchy") // لاحظ: كتبنا فقط الجزء الأخير
      return response.data
    }
  )
  
const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "خطأ غير متوقع"
      })
  },
})

export default categorySlice.reducer
