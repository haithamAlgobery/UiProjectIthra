import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../lib/axiosInstance"

const initialState = {
  data:null,
  loading: false,
  error: null,
}

// جلب البيانات من API
export const fetchDataBasic = createAsyncThunk(
    "category/fetchDataBasic",
    async () => {
      const response = await api.get("/databasic") // لاحظ: كتبنا فقط الجزء الأخير
      return response.data
    }
  )
  
const dataBasicSlice = createSlice({
  name: "dataBasic",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataBasic.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDataBasic.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchDataBasic.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "خطأ غير متوقع"
      })
  },
})

export default dataBasicSlice.reducer
