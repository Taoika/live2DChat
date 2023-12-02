import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../store/hook";
import { setNeedRender } from "../store/slice/userInfo";
const WS_URL = 'ws://120.24.255.77:30000/websocket'

/**
 * pper socket 的初始化
 */
const usePeer = () => {

    const dispatch = useAppDispatch();
    const { userId, inRoom, needRender } = useAppSelector((state)=>state.userInfo)

    const socketRef = useRef<WebSocket>()
	const peerRef = useRef<RTCPeerConnection>()
    const userModelRef = useRef(needRender)

    const createPeer = () => { // peer创建

        const peer = new RTCPeerConnection();

        peer.onicecandidate = (event) => { // 收到自己的candidate
        socketRef.current?.send(JSON.stringify({
            userId: userId.toString(), // 后台说要字符串
            username: 'KKT',
            event: "candidate",
            data: JSON.stringify(event.candidate), // 尝试里面不序列化是否可行
        }))
        console.log('发送candidate');
        
        }
        return peer;
    }

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
                    const offer = JSON.parse(msg.data);
                    const peer = peerRef.current

                    await peer?.setRemoteDescription(offer); // 设置远端描述信息

                    const answer = await peer?.createAnswer(); // 生成answer
                    await peer?.setLocalDescription(answer); // 设置本地描述信息
                    socket.send(JSON.stringify({// 发送answer
                        userId: userId.toString(),
                        username: 'KKT',
                        event: 'answer',
                        data: JSON.stringify(answer)
                    }))
                    console.log('发送answer');
                    break;
                case 'candidate':
                    console.log('[ws message] 收到candidate');
                    const candidate = JSON.parse(msg.data);
                    peerRef.current?.addIceCandidate(candidate);
                    break;
                case 'enterRoom':
                    const data = msg.data;
                    console.log(`[ws message] 用户${data.userId}加入房间`);
                    
                    dispatch(setNeedRender([...userModelRef.current, {
                        userId: data.userId,
                        modelUrl: data.modelUrl
                    }]))
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
        if(!inRoom || peerRef.current || socketRef.current) return ;
        
        peerRef.current = createPeer();
		socketRef.current = createSocket();
    },[inRoom])

    useEffect(()=>{
        userModelRef.current = needRender
    },[needRender])

    return { socketRef, peerRef }
}

export default usePeer;