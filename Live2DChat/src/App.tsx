import { useEffect, createContext, useRef } from 'react';
import './App.css'
import { useAppSelector, useAppDispatch } from './store/hook';
import { setUserId } from './store/slice/userInfo';
import Home from './pages/Home'
import { ConfigProvider } from 'antd';

export const AppContext = createContext<{
  socketRef: React.MutableRefObject<WebSocket | undefined>,
  peerRef: React.MutableRefObject<RTCPeerConnection | undefined>,
} | null>(null)


function App() {

  const { userId } = useAppSelector((state) => state.userInfo)
  const dispatch = useAppDispatch();

  const socketRef = useRef<WebSocket>()
  const peerRef = useRef<RTCPeerConnection>()

  useEffect(() => { // 用户身份验证
    if (userId) return;
    
  }, [])

  return (
    <AppContext.Provider value={{ socketRef, peerRef }}>
      <div className='App'>
        <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
          <Home></Home>
        </ConfigProvider>
      </div>
    </AppContext.Provider>
  )
}

export default App
