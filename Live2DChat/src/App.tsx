import { useEffect } from 'react';
import './App.css'
import { useAppSelector, useAppDispatch } from './store/hook';
import { setUserId } from './store/slice/userInfo';
import Home from './pages/Home'


function App() {

  const { userId } = useAppSelector((state) => state.userInfo)
  const dispatch = useAppDispatch();

  useEffect(()=>{ // 用户身份验证
    if(userId) return ;

    const userInfoStr = localStorage.getItem('Chat-User');

    if(userInfoStr) { // 存储用户信息
      const userInfo = JSON.parse(userInfoStr);
      dispatch(setUserId(userInfo.userId));
    }
    else {
      const userId = new Date().getTime();
      dispatch(setUserId(userId));
      const userInfo = {
        userId: userId
      }
      localStorage.setItem('Chat-User', JSON.stringify(userInfo))
    }
    
  },[])

  return (
    <div className='App'>
      <Home></Home>
    </div>
  )
}

export default App
