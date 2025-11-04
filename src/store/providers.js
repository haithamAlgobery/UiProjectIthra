// src/store/providers.jsx
'use client'

import React, { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { store } from './store' // تأكد المسار
import { refreshToken } from '../features/authSlice' // تأكد المسار
import { fetchDataBasic } from '../features/dataBasicSlice'
import SignalRProvider from "../../app/providers/SignalRProvider";

import useAuth from '../hooks/useAuth'
import useNotifications from '../hooks/useNotifications'
import { GoogleOAuthProvider } from '@react-oauth/google'
export function Providers({ children }) {
  return (
    <Provider store={store}>
      <InnerProviders>
      <GoogleOAuthProvider clientId="753674537025-2mesntvvkno91tthb5o0v1btsoe7gk6t.apps.googleusercontent.com">
        <SignalRProvider>
          {children}
          </SignalRProvider>
          </GoogleOAuthProvider>
          </InnerProviders>
    </Provider>
  )
}

function InnerProviders({ children }) {
  const dispatch = useDispatch()
  const { isAuth } = useAuth();
const {loadNotifications}=useNotifications();

  useEffect(() => {
    // محاولة استعادة الجلسة بصمت عند تحميل الصفحة
    dispatch(refreshToken())
    dispatch(fetchDataBasic())
  }, [dispatch])

  useEffect(() => {
    if(isAuth) loadNotifications();
  },[isAuth])



  return <>{children}</>
}
