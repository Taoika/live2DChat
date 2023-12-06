import { useEffect, createContext, useRef } from 'react';
import './App.css'
import { useAppSelector, useAppDispatch } from './store/hook';
import { setUserId } from './store/slice/userInfo';
import Home from './pages/Home'
import { ConfigProvider } from 'antd';
import { Layout, Space } from 'antd';

const { Content } = Layout;

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#108ee9',
  backgroundImage: 'url("https://pic-1316520471.cos.ap-guangzhou.myqcloud.com/vs1111111.jpg")',
  backgroundSize: 'cover' ,
};

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
    dispatch(setUserId(new Date().getTime()));

  }, [])

  return (
    <AppContext.Provider value={{ socketRef, peerRef }}>
      <div className='App'>
        <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
          <Space direction="vertical" style={{ width: '100%' }} size={[0, 48]}>
            <Layout>
              <Layout hasSider>
                <Content style={contentStyle}><Home></Home></Content>
                {/* <Sider style={siderStyle}>Sider</Sider> */}
              </Layout>
            </Layout>
          </Space>

        </ConfigProvider>
      </div>
    </AppContext.Provider>
  )
}

export default App
