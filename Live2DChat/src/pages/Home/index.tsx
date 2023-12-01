import { useEffect, useRef } from 'react';
import './index.scss'
import usePixi from '../../hooks/usePixi';
import useFace from '../../hooks/useFace';
import { rigFace } from '../../utils/model';
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { setInRoom } from '../../store/slice/userInfo';
import usePeer from '../../hooks/usePeer';

export default function Home() {

	const dispatch = useAppDispatch();
	const { live2dData } = useAppSelector((state) => state.live2d)
	const { inRoom } = useAppSelector((state) => state.userInfo)

	const dataChannel = useRef<RTCDataChannel>();

	const { peerRef } = usePeer()
	const { canvasRef, models } = usePixi()
	const { videoRef, guideRef } = useFace(models)

	const createDataChannel = () => { // dataChannel创建
		const channel = peerRef.current!.createDataChannel("KKTRoom_0");
	
		channel.onopen = () => {
		  console.log("[dataChannel open]");
		  
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
		dispatch(setInRoom(true));
	}

	useEffect(()=>{ // 监听L2D数据更改
		if(!live2dData || dataChannel.current?.readyState != 'open') return ;		
		dataChannel.current?.send(JSON.stringify(live2dData))
		
	},[live2dData])

	useEffect(()=>{
		if(!inRoom || dataChannel.current) return;
		dataChannel.current = createDataChannel();
	},[inRoom])

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
