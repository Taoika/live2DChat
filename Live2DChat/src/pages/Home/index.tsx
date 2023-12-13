import './index.scss'
import usePixi from '../../hooks/usePixi';
import useFace from '../../hooks/useFace';
import usePeer from '../../hooks/usePeer';
import useDataChannel from '../../hooks/useDataChannel';
import useSocket from '../../hooks/socket/useSocket';

import { useAppDispatch } from "../../store/hook";
import { setInRoom, setUserId } from '../../store/slice/userInfo';
import { Button } from 'antd';
import {notice} from "../../utils/notice"
import { useRef} from 'react';

export default function Home() {

	const dispatch = useAppDispatch();
	const { localAudioRef } = usePeer()
	useSocket()
	const { canvasRef, models } = usePixi()
	const { videoRef, guideRef } = useFace()
	const ifInRoom = useRef<Boolean>(false)

	useDataChannel(models)

	const joinRoom = async () => { // 加入房间
		ifInRoom.current = true
		dispatch(setInRoom(true));
	}

	const exitRoom = async () => { // 退出房间
		ifInRoom.current = false
		dispatch(setInRoom(false));
	}

	const changeModel = async () => { // 退出房间
		try {
			if (!ifInRoom.current) {
				notice("请加入房间后再更换模型")
				return 
			}
			await exitRoom()
			dispatch(setUserId(new Date().getTime()));
			setTimeout(async () => {
				joinRoom()
			}, 1200);

		} catch (error) {
			console.error('发生错误:', error);
		}
	}

	return (
		<div className='Home'>
			<div className="remoteAudioContainer"></div>
			<audio src="" ref={localAudioRef}></audio>
			{/* <Input style={{ width: '120px' }} value={inputTempUserId} onChange={handleInputChange} /> */}
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
