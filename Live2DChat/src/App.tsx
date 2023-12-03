import { useEffect, createContext, useRef } from 'react';
import './App.css'
import { useAppSelector, useAppDispatch } from './store/hook';
import { setUserId } from './store/slice/userInfo';
import Home from './pages/Home'

export const AppContext = createContext<{
  socketRef: React.MutableRefObject<WebSocket | undefined>,
  peerRef: React.MutableRefObject<RTCPeerConnection | undefined>,
} | null>(null)


function App() {

  const { userId } = useAppSelector((state) => state.userInfo)
  const dispatch = useAppDispatch();

  const socketRef = useRef<WebSocket>()
  const peerRef = useRef<RTCPeerConnection>()

  useEffect(()=>{ // 用户身份验证
    if(userId) return ;
    dispatch(setUserId(new Date().getTime()));
    
  },[])

  return (
    <AppContext.Provider value={{socketRef, peerRef}}>
      <div className='App'>
        <Home></Home>
      </div>
    </AppContext.Provider>
  )
}

export default App
