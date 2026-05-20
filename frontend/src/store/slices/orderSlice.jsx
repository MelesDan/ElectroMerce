import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderService } from '@services/orderService'
import toast from 'react-hot-toast'

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      const response = await orderService.createOrder(orderData)
      toast.success('Order created successfully!')
      dispatch({ type: 'cart/clearCartState' })
      return response
    } catch (error) {
      toast.error('Failed to create order')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload.order
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setCurrentOrder } = orderSlice.actions
export default orderSlice.reducer