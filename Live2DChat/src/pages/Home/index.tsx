import './index.scss'
import usePixi from '../../hooks/usePixi';
import useFace from '../../hooks/useFace';
import usePeer from '../../hooks/usePeer';
import useDataChannel from '../../hooks/useDataChannel';
import useSocket from '../../hooks/socket/useSocket';

import { useAppDispatch, useAppSelector } from "../../store/hook";
import { setInRoom, setUserId } from '../../store/slice/userInfo';
import { Button } from 'antd';
import { notice } from "../../utils/notice"

export default function Home() {

	const dispatch = useAppDispatch();
	const { inRoom } = useAppSelector((state)=> state.userInfo)
	const { localAudioRef } = usePeer()
	useSocket()
	const { canvasRef, models } = usePixi()
	const { videoRef, guideRef } = useFace()

	useDataChannel(models)

	const joinRoom = () => { // 加入房间
		dispatch(setUserId(new Date().getTime())); // 获取用户信息
		dispatch(setInRoom(true));
	}

	const exitRoom = () => { // 退出房间
		dispatch(setInRoom(false));
	}

	const changeModel = async () => { // 模型更换
		if (!inRoom) {
			notice("请加入房间后再更换模型")
			return ;
		}
		exitRoom()
		
		setTimeout(async () => {
			joinRoom()
		}, 1200);
	}

	return (
		<div className='Home'>
			<div className="remoteAudioContainer"></div>
			<audio src="" ref={localAudioRef}></audio>
			<Button type="primary" onClick={joinRoom}>加入房间</Button>
			<Button type="primary" onClick={exitRoom}>退出房间</Button>
			<Button type="primary" onClick={changeModel}>更换模型</Button>
			
			<canvas className='L2Dmodel' ref={canvasRef}></canvas>
			<div className="preview">
				<video className="input_video" ref={videoRef} ></video>
				<canvas className="guides" ref={guideRef}></canvas>
			</div>
			
		</div>
	)
}
