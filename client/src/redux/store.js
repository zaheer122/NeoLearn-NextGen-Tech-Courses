import { combineReducers,configureStore } from '@reduxjs/toolkit'
import authSlice from "./authSlice.js"
import courseSlice from './courseSlice.js'
import lectureSlice from './lectureSlice.js'
import screenTimeSlice from './screenTimeSlice.js'
import {
  
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
  }

const rootReducer = combineReducers({
    auth: authSlice,
    course: courseSlice,
    lecture: lectureSlice,
    screenTime: screenTimeSlice
})


const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})




export default store;  