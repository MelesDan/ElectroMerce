import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartService } from '@services/cartService'
import toast from 'react-hot-toast'

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(productId, quantity)
      toast.success('Added to cart!')
      return response
    } catch (error) {
      toast.error('Failed to add to cart')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await cartService.removeCartItem(itemId)
      toast.success('Removed from cart')
      return response
    } catch (error) {
      toast.error('Failed to remove')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart()
      toast.success('Cart cleared')
      return response
    } catch (error) {
      toast.error('Failed to clear cart')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  isLoading: false,
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.items = []
      state.totalItems = 0
      state.subtotal = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items || []
        state.totalItems = action.payload.total_items || 0
        state.subtotal = action.payload.subtotal || 0
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.totalItems = action.payload.total_items || 0
        state.subtotal = action.payload.subtotal || 0
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.totalItems = action.payload.total_items || 0
        state.subtotal = action.payload.subtotal || 0
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.totalItems = action.payload.total_items || 0
        state.subtotal = action.payload.subtotal || 0
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
        state.totalItems = 0
        state.subtotal = 0
      })
  },
})

export const { clearCartState } = cartSlice.actions
export default cartSlice.reducer