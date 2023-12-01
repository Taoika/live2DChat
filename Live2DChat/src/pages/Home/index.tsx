import { useRef } from 'react';
import './index.scss'
import usePixi from '../../hooks/usePixi';
import useFace from '../../hooks/useFace';

const WS_URL = 'ws://120.24.255.77:30000/websocket'
const modelUrl = "http://120.24.255.77/models/hiyori/hiyori_pro_t10.model3.json"; // 运行时文件夹下面的model3文件，如果是自己的记得要调整预设动作

export default function Home() {

	const socketRef = useRef<WebSocket>()
	const peerRef = useRef<RTCPeerConnection>()
	const dataChannel = useRef<RTCDataChannel>();

	const { canvasRef, models } = usePixi(modelUrl)
	const { videoRef, guideRef } = useFace(models)

	const createPeer = () => { // peer创建
		const peer = new RTCPeerConnection();
	
		peer.onicecandidate = (event) => { // 收到自己的candidate
		  socketRef.current?.send(JSON.stringify({
			event: "candidate",
			data: JSON.stringify(event.candidate), // 尝试里面不序列化是否可行
		  }))
		  console.log('发送candidate');
		  
		}
		return peer;
	}

	const createDataChannel = () => { // dataChannel创建
		const channel = peerRef.current!.createDataChannel("KKTRoom_1");
	
		channel.onopen = () => {
		  console.log("[dataChannel open]");
		}
	
		channel.onmessage = (event) => {
		  console.log("[dataChannel message]", event.data);
		}
	
		channel.onclose = () => {
		  console.log("[dataChannel close]");
		}
	
		return channel
	}

	const createSocket = ()=>{ // socket创建
		if(!socketRef.current){
		  const socket = new WebSocket(WS_URL) // 信令服务器连接
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
				  socketRef.current?.send(JSON.stringify({// 发送answer
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
			}
	
		  };
		  
		  socket.onclose = () => { // 连接关闭
			console.log('[ws close] 连接中断');
		  };
		  
		  socket.onerror = (error) => { // 连接错误
			console.log(`[error] 连接错误 ${error}`);
		  };
	
		  return socket;
		}
	}

	const joinRoom = () => { // 加入房间
		peerRef.current = createPeer();
		dataChannel.current = createDataChannel();
		socketRef.current = createSocket();
	}

	const senMsg = () => { // 信息发送

		const  now = new Date();
		const  minute = now.getMinutes();
		const  second = now.getSeconds();
	
		// 拼接成yyyymmddhhmmss的格式
		const formattedTime = minute + second;
	
		dataChannel.current?.send(`北京时间: ${formattedTime}`)
	}

	return (
		<div className='Home'>
			<button onClick={joinRoom}>加入房间</button>
			<button onClick={senMsg}>发送信息</button>
			<canvas className='L2Dmodel' ref={canvasRef}></canvas>
			<div className="preview">
				<video className="input_video" ref={videoRef}></video>
				<canvas className="guides" ref={guideRef}></canvas>
			</div>
		</div>
	)
}
