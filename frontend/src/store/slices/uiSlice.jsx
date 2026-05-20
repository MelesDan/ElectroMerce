import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoading: false,
  sidebarOpen: false,
  cartDrawerOpen: false,
  searchModalOpen: false,
  notification: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    toggleCartDrawer: (state) => {
      state.cartDrawerOpen = !state.cartDrawerOpen
    },
    setCartDrawerOpen: (state, action) => {
      state.cartDrawerOpen = action.payload
    },
    toggleSearchModal: (state) => {
      state.searchModalOpen = !state.searchModalOpen
    },
    setNotification: (state, action) => {
      state.notification = action.payload
    },
    clearNotification: (state) => {
      state.notification = null
    },
  },
})

export const {
  setLoading,
  toggleSidebar,
  toggleCartDrawer,
  setCartDrawerOpen,
  toggleSearchModal,
  setNotification,
  clearNotification,
} = uiSlice.actions

export default uiSlice.reducer