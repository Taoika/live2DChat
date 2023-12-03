import './index.scss'
import usePixi from '../../hooks/usePixi';
import useFace from '../../hooks/useFace';
import usePeer from '../../hooks/usePeer';
import useDataChannel from '../../hooks/useDataChannel';
import useSocket from '../../hooks/useSocket';

import { useAppDispatch } from "../../store/hook";
import { setInRoom } from '../../store/slice/userInfo';



export default function Home() {

	const dispatch = useAppDispatch();

	usePeer()
	useSocket()
	const { canvasRef, models } = usePixi()
	const { videoRef, guideRef } = useFace()
	useDataChannel(models)

	const joinRoom = () => { // 加入房间
		dispatch(setInRoom(true));
	}

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
