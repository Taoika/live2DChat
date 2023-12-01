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
    dispatch(setUserId(new Date().getTime()));
    
  },[])

  return (
    <div className='App'>
      <Home></Home>
    </div>
  )
}

export default App
