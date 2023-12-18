import { createContext, useRef } from 'react';
import './App.css'
import Home from './pages/Home'
import { ConfigProvider } from 'antd';

export const AppContext = createContext<{
  socketRef: React.MutableRefObject<WebSocket | undefined>,
  peerRef: React.MutableRefObject<RTCPeerConnection | undefined>,
} | null>(null)


function App() {

  const socketRef = useRef<WebSocket>()
  const peerRef = useRef<RTCPeerConnection>()

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
