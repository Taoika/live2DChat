import { useEffect, useRef, useContext } from "react";
import { useAppSelector } from "../store/hook";
import { AppContext } from "../App";

/**
 * peer socket 的初始化
 * @returns peer socket
 */
const usePeer = () => {
    
    const { userId, inRoom } = useAppSelector((state)=>state.userInfo)
    
	const { peerRef, socketRef } = useContext(AppContext)!
    
    const createPeer = () => { // peer创建

        const peer = new RTCPeerConnection();

        peer.onicecandidate = (event) => { // 收到自己的candidate
            socketRef.current?.send(JSON.stringify({
                userId: userId.toString(), // 后台说要字符串
                username: 'KKT',
                event: "candidate",
                data: JSON.stringify(event.candidate), // 尝试里面不序列化是否可行
            })
        )
        console.log('发送candidate');
        
        }
        return peer;
    }

    useEffect(()=>{ // 自己进入房间
        if(!inRoom || peerRef.current) return ;
        
        peerRef.current = createPeer();
    },[inRoom])



    return { peerRef }
}

export default usePeer;