import './index.scss'
import usePixi from '../../hooks/usePixi';
import useFace from '../../hooks/useFace';


const modelUrl = "/src/assets/models/hiyori/hiyori_pro_t10.model3.json"; // 运行时文件夹下面的model3文件，如果是自己的记得要调整预设动作
const modelUrl2 = "/src/assets/models/SYR/SYR.model3.json"

export default function Home() {

	const { canvasRef, models } = usePixi([modelUrl, modelUrl2])
	const { videoRef, guideRef } = useFace(models)


	const joinRoom = () => {

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
