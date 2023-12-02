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
	const { inRoom, userId, rendered } = useAppSelector((state) => state.userInfo)

	const dataChannel = useRef<RTCDataChannel>();
	const renderedRef = useRef(rendered);

	const { peerRef } = usePeer()
	const { canvasRef, models } = usePixi()
	const { videoRef, guideRef } = useFace()
	

	const createDataChannel = () => { // dataChannel创建
		const channel = peerRef.current!.createDataChannel("myDataChannel66666666_1395212519");
	
		channel.onopen = () => {
		  console.log("[dataChannel open]");
		}
	
		channel.onmessage = (event) => {
			const { live2dData, userId } = JSON.parse(event.data);
			let index = -1;			
			renderedRef.current.forEach((value, i)=>{ // 判断用户在userModel中的索引值
				if(value.userId == userId){
					index = i;
					return ;
				}
			})
			if(index != -1){ // 找不到对应的用户
				rigFace(live2dData, 0.5, models.current[index])
			}
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
		dataChannel.current?.send(JSON.stringify({live2dData, userId}))
	},[live2dData])

	useEffect(()=>{ // 监听用户是否在房间中
		if(!inRoom || dataChannel.current) return;
		dataChannel.current = createDataChannel();
	},[inRoom])

	useEffect(()=>{ // 监听用户模型数据变更		
		renderedRef.current = rendered
	},[rendered]);

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
