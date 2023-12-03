import { useEffect, useContext, useRef } from "react";
import { useAppSelector } from "../store/hook";
import { AppContext } from "../App";

/**
 * peer socket 的初始化
 * @returns peer socket
 */
const usePeer = () => {
    
    const { userId, inRoom } = useAppSelector((state)=>state.userInfo)
	const { peerRef, socketRef } = useContext(AppContext)!
    const remoteAudioRef = useRef<HTMLDivElement>(null);
    const localAudioRef = useRef<HTMLAudioElement>(null)
    
    const createPeer = () => { // peer创建

        const peer = new RTCPeerConnection();

        peer.onicecandidate = (event) => { // 收到自己的candidate
            socketRef.current?.send(JSON.stringify({
                userId: userId.toString(), // 后台说要字符串
                username: 'KKT',
                event: "candidate",
                data: JSON.stringify(event.candidate), // 尝试里面不序列化是否可行
            }))
            console.log('[ws send] 发送candidate');
        }

        peer.ontrack = (event) => { // 收到对方的流轨道
            console.log('收到对方的数据流');
            
            const audio = document.createElement('audio');
            audio.srcObject = event.streams[0];
            audio.autoplay = true,
            audio.controls = false;
            remoteAudioRef.current?.appendChild(audio);

            event.track.onmute = () => { // 静音
                audio.play();
            } 

            event.streams[0].onremovetrack = () => { // 对象移除
                if(audio.parentNode) {
                    audio.parentNode.removeChild(audio);
                }
            }
        }
        return peer;
    }

    const getLocalStream = async () => { // 打开视频音频流
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })
        return stream;
      }

    const handleLocalStream = async () => { // 获取 处理本地音频流
        const stream = await getLocalStream();

		stream.getTracks().forEach((track) => {
			peerRef.current?.addTrack(track, stream);
			console.log('推送本地音频流');
			
		})
    }

    useEffect(()=>{ // 自己进入房间
        if(!inRoom || peerRef.current) return ;

        handleLocalStream()
        peerRef.current = createPeer();
    },[inRoom])

    return { localAudioRef }
}

export default usePeer;