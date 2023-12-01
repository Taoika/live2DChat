import { useEffect, useRef } from 'react';
import './index.scss'
import usePixi from '../../hooks/usePixi';
import useFace from '../../hooks/useFace';
import { rigFace } from '../../utils/model';
import { useAppSelector } from "../../store/hook";
import { createPeer, createSocket } from '../../utils/peer';

const modelUrl = "http://120.24.255.77/models/hiyori/hiyori_pro_t10.model3.json"; // 运行时文件夹下面的model3文件，如果是自己的记得要调整预设动作

export default function Home() {

	const { live2dData } = useAppSelector((state) => state.live2d)

	const socketRef = useRef<WebSocket>()
	const peerRef = useRef<RTCPeerConnection>()
	const dataChannel = useRef<RTCDataChannel>();
	const userIdRef = useRef<number | null>();

	const { canvasRef, models } = usePixi(modelUrl)
	const { videoRef, guideRef } = useFace(models)

	useEffect(()=>{ // 监听L2D数据更改
		if(!live2dData || dataChannel.current?.readyState != 'open') return ;

		dataChannel.current?.send(JSON.stringify(live2dData))
	},[live2dData])

	const createDataChannel = () => { // dataChannel创建
		const channel = peerRef.current!.createDataChannel("KKTRoom_0");
	
		channel.onopen = () => {
		  console.log("[dataChannel open]");
		  userIdRef.current = channel.id; // 打开之后才有id
		  
		}
	
		channel.onmessage = (event) => {
		  models.current.forEach(model=>{
			rigFace(JSON.parse(event.data), 0.5, model);
		})
		}
	 
		channel.onclose = () => {
		  console.log("[dataChannel close]");
		}
	
		return channel
	}

	const joinRoom = () => { // 加入房间
		peerRef.current = createPeer(socketRef, userIdRef);
		dataChannel.current = createDataChannel();
		socketRef.current = createSocket(socketRef, userIdRef, peerRef);
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
