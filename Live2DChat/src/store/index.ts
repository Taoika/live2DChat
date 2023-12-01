import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import live2d from './slice/live2d'

export const store = configureStore({
  reducer: {
    live2d,
  },
})

// 返回store的方法getState的类型
export type RootState = ReturnType<typeof store.getState>

// 拿到store的dispatch方法的类型
export type AppDispatch = typeof store.dispatch