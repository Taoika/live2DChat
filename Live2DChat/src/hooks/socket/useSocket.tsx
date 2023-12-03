import { useEffect, useRef, useContext } from "react";
import { useAppSelector } from "../../store/hook";
import { AppContext } from "../../App";
import useSocketHandle from "./useSocketHandle";

// const WS_URL = 'ws://120.24.255.77:30000/websocket'
const WS_URL = 'wss://qgailab.com/websocket'

const useSocket = () => {

    const { userId, inRoom, needRender } = useAppSelector((state)=>state.userInfo)

    const { socketRef } = useContext(AppContext)!
    const userModelRef = useRef(needRender)

    const { handleOffer, handleCandidate, handleEnterRoom, handleListUser }  = useSocketHandle();

    const createSocket = ()=>{ // socket创建

        if(!socketRef.current){
        const socket = new WebSocket(`${WS_URL}?userId=${userId}`) // 信令服务器连接
        socket.onopen = () => { // 连接建立
            console.log("[ws open] 连接已建立");
        };
        
        socket.onmessage = async (event) => { // 接收到服务器的信息
            const msg = JSON.parse(event.data)

            switch(msg.event){
                case 'offer':
                    console.log('[ws message] 收到offer');
                    handleOffer(JSON.parse(msg.data))
                    break;
                case 'candidate':
                    console.log('[ws message] 收到candidate');
                    handleCandidate(JSON.parse(msg.data))
                    break;
                case 'enterRoom':
                    const data = msg.data;
                    console.log(`[ws message] 用户${data.userId}加入房间`);
                    handleEnterRoom(data)
                    break;
                case 'listUser':
                    console.log(`[ws message] 收到房间中的用户信息`);
                    handleListUser(msg.data);
                    break;
            }
                
        };
        
        socket.onclose = () => { // 连接关闭
            console.log('[ws close] 连接中断');
            socketRef.current = undefined
        };
        
        socket.onerror = (error) => { // 连接错误
            console.log(`[error] 连接错误 `, error);
        };

        return socket;
        }
    }

    useEffect(()=>{ // 自己进入房间
        if(!inRoom || socketRef.current) return ;
        
		socketRef.current = createSocket();
    },[inRoom])

    useEffect(()=>{
        userModelRef.current = needRender
        
    },[needRender])

    return { socketRef }
}

export default useSocket