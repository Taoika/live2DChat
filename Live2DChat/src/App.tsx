import { useEffect, createContext, useRef } from 'react';
import './App.css'
import { useAppSelector, useAppDispatch } from './store/hook';
import { setUserId } from './store/slice/userInfo';
import Home from './pages/Home'
import { ConfigProvider } from 'antd';
import { Layout, Space } from 'antd';

const { Header, Footer, Sider, Content } = Layout;
const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 50,
  lineHeight: '64px',
  backgroundColor: '#7dbcea',
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#108ee9',
  backgroundImage: 'url("https://pic-1316520471.cos.ap-guangzhou.myqcloud.com/vs1111111.jpg")',
  backgroundSize: 'cover' ,
};

const siderStyle: React.CSSProperties = {
  textAlign: 'center',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#3ba0e9',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#7dbcea',
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
