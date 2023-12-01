import { useEffect, useRef } from 'react';
import './index.scss'
import usePixi from '../../hooks/usePixi';
import useFace from '../../hooks/useFace';
import { rigFace } from '../../utils/model';
import { useAppSelector } from "../../store/hook";
import usePeer from '../../hooks/usePeer';

const modelUrl = "http://120.24.255.77/models/hiyori/hiyori_pro_t10.model3.json"; // 运行时文件夹下面的model3文件，如果是自己的记得要调整预设动作

export default function Home() {

	const { live2dData } = useAppSelector((state) => state.live2d)
	const { userId } = useAppSelector((state) => state.userInfo)


	const dataChannel = useRef<RTCDataChannel>();
	const userIdRef = useRef(userId);
	const InRoom = useRef(false);

	const { canvasRef, models } = usePixi(modelUrl)
	const { videoRef, guideRef } = useFace(models)
	const { peerRef } = usePeer(userIdRef, InRoom)

	const createDataChannel = () => { // dataChannel创建
		console.log('peerRef.current->', peerRef.current);
		
		const channel = peerRef.current!.createDataChannel("KKTRoom_0");
	
		channel.onopen = () => {
		  console.log("[dataChannel open]");
		  
		}
	
		channel.onmessage = (event) => {
			console.log(event.data);
			
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
		InRoom.current = true;
	}

	useEffect(()=>{ // 监听L2D数据更改
		if(!live2dData || dataChannel.current?.readyState != 'open') return ;		
		dataChannel.current?.send(JSON.stringify(live2dData))
		
	},[live2dData])

	useEffect(()=>{
		if(!InRoom.current || dataChannel.current) return;
		dataChannel.current = createDataChannel();
	},[InRoom.current])

	return (
		<div className='Home'>
			<button onClick={joinRoom}>加入房间</button>
			<canvas className='L2Dmodel' ref={canvasRef}></canvas>
			<div className="preview">
				<video className="input_video" ref={videoRef}></video>
				<canvas className="guides" ref={guideRef}></canvas>
			</div>
		</div>
	)
}
