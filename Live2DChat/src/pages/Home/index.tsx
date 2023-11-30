import { useRef, useEffect } from 'react';
import './index.scss'
import { Application } from 'pixi.js'
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import { FaceMesh, FACEMESH_TESSELATION } from '@mediapipe/face_mesh';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Camera } from '@mediapipe/camera_utils';
import { Face, Results, Vector } from 'kalidokit'
const { lerp } = Vector

import usePixi from '../../hooks/usePixi';

// 为 Live2DModel 注册 Ticker
Live2DModel.registerTicker(Ticker);

// 为 Application 注册 Ticker
Application.registerPlugin(TickerPlugin);

const modelUrl = "/src/assets/models/hiyori/hiyori_pro_t10.model3.json"; // 运行时文件夹下面的model3文件，如果是自己的记得要调整预设动作
const modelUrl2 = "/src/assets/models/SYR/SYR.model3.json"

export default function Home() {

	const videoRef = useRef<HTMLVideoElement>(null); // 视频标签
	const guideRef = useRef<HTMLCanvasElement>(null); // 视频所在
	let facemesh: FaceMesh;

	const { canvasRef, models } = usePixi([modelUrl, modelUrl2])

/************************************************* 将人脸数据填入模型 *********************************************************** */

	// 创建配置facemesh
	const createFaceMesh = () => {
		// 创建Mediapipe Face Mesh实例对象
		facemesh = new FaceMesh({
			locateFile: (file) => { // 指定文件的位置
				return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
			},
		});

		// facemesh 设置
		facemesh.setOptions({
			maxNumFaces: 1, // 最大人脸数 1~4
			refineLandmarks: true, // 是否精细化关键点
			minDetectionConfidence: 0.5, // 最小检测置信度数值
			minTrackingConfidence: 0.5, // 最小跟踪置信度数值
		});

		// 为MediaPipe Face Mesh对象传入回调函数
		facemesh.onResults(onResults);
	}

	// 结果回调函数
	const onResults = (results: any) => {
		drawResults(results.multiFaceLandmarks[0]); // 在网页上绘制人脸网格效果 参数:包含468个人脸网格关键点的数组 每个关键点是一个包含xyz坐标的对象 
		animateLive2DModel(results.multiFaceLandmarks[0]); // 将人脸网格的数据转换为L2D模型的动画参数
	};

	// 在输出画布上绘制人脸的网格和瞳孔
	const drawResults = (points: any) => { // 参数 人脸的468个网格点的数组
		const guideCanvas = guideRef.current;
		const videoElement = videoRef.current;

		if (!guideCanvas || !videoElement || !points) return;
		guideCanvas.width = videoElement.videoWidth;
		guideCanvas.height = videoElement.videoHeight;
		let canvasCtx = guideCanvas.getContext("2d");

		if(!canvasCtx) return ;
		canvasCtx.save();
		canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
		// 用于在画布上绘制人脸网格的线条 MediaPipe提供该函数
		drawConnectors(canvasCtx, points, FACEMESH_TESSELATION, { // FACEMESH_TESSELATION 人脸网格连接图 
			color: "#C0C0C070",
			lineWidth: 1,
		});
		if (points && points.length === 478) {
			// 绘制人脸网格的点 MediaPipe提供
			drawLandmarks(canvasCtx, [points[468], points[468 + 5]], { // 左右瞳孔
				color: "#ffe603",
				lineWidth: 2,
			});
		}
	};

	// 3D转L2D
	const animateLive2DModel = (points: Results) => {
		const videoElement = videoRef.current
		if (!models.current[0] || !points || !videoElement) return;
	
		// 存储人脸的动画参数
		let riggedFace: any;
	
		if (points) {
			// L2D结构化数据
			riggedFace = Face.solve(points, {
				runtime: "mediapipe", // 使用Mediapipe库的人脸网络模型
				video: videoElement,
			});
			
			models.current.forEach(model=>{
				rigFace(riggedFace, 0.5, model);
			})
		}
	};

	// 更新 live2d 模型内部状态
	const rigFace = (result: any, lerpAmount = 0.7, model: any) => {
		if (!model || !result) return;
		// 核心模型 L2D模型对象 用于显示和控制2D动画角色
		const coreModel = model.internalModel.coreModel;

		// 重写动作管理器的update方法 作用是更新模型的动画状态
		model.internalModel.motionManager.update = (...args: any) => {
			// 禁用默认的眨眼动画
			model.internalModel.eyeBlink = undefined;

			// 根据人脸的表情和姿态来控制模型的动画效果
			// 眼球
			coreModel.setParameterValueById(
				"ParamEyeBallX",
				// 线性插值函数lerp lerpAmount是插值比例 0~1 控制插值的速度和平滑度
				// 参数 瞳孔x轴 模型眼球x轴数值
				lerp(result.pupil.x, coreModel.getParameterValueById("ParamEyeBallX"), lerpAmount)
			);
			coreModel.setParameterValueById(
				"ParamEyeBallY",
				lerp(result.pupil.y, coreModel.getParameterValueById("ParamEyeBallY"), lerpAmount)
			);

			// X 轴和 Y 轴旋转交换为 Live2D 参数 因为它是一个 2D 系统而 KalidoKit 是一个 3D 系统
			coreModel.setParameterValueById(
				"ParamAngleX",
				lerp(result.head.degrees.y, coreModel.getParameterValueById("ParamAngleX"), lerpAmount)
			);
			coreModel.setParameterValueById(
				"ParamAngleY",
				lerp(result.head.degrees.x, coreModel.getParameterValueById("ParamAngleY"), lerpAmount)
			);
			coreModel.setParameterValueById(
				"ParamAngleZ",
				lerp(result.head.degrees.z, coreModel.getParameterValueById("ParamAngleZ"), lerpAmount)
			);

			// 身体
			const dampener = 0.3; // 身体旋转幅度的衰减系数
			coreModel.setParameterValueById(
				"ParamBodyAngleX", // 取值范围是-10~10
				lerp(result.head.degrees.y * dampener, coreModel.getParameterValueById("ParamBodyAngleX"), lerpAmount)
			);
			coreModel.setParameterValueById(
				"ParamBodyAngleY",
				lerp(result.head.degrees.x * dampener, coreModel.getParameterValueById("ParamBodyAngleY"), lerpAmount)
			);
			coreModel.setParameterValueById(
				"ParamBodyAngleZ",
				lerp(result.head.degrees.z * dampener, coreModel.getParameterValueById("ParamBodyAngleZ"), lerpAmount)
			);

			// 稳定左右眼睛的眨眼延迟和眨眼效果 参数是左右眼睛的值 和result对象中头部的y值
			let stabilizedEyes = Face.stabilizeBlink(
				{
					l: lerp(result.eye.l, coreModel.getParameterValueById("ParamEyeLOpen"), 0.7),
					r: lerp(result.eye.r, coreModel.getParameterValueById("ParamEyeROpen"), 0.7),
				},
				result.head.y
			);
			// 眨眼
			coreModel.setParameterValueById("ParamEyeLOpen", stabilizedEyes.l);
			coreModel.setParameterValueById("ParamEyeROpen", stabilizedEyes.r);

			// 嘴巴
			coreModel.setParameterValueById(
				"ParamMouthOpenY",
				lerp(result.mouth.y, coreModel.getParameterValueById("ParamMouthOpenY"), 0.3)
			);
			// 将 0.3 添加到 ParamMouthForm 以使默认值更像“微笑”
			coreModel.setParameterValueById(
				"ParamMouthForm",
				0.3 + lerp(result.mouth.x, coreModel.getParameterValueById("ParamMouthForm"), 0.3)
			);

			return true;
		};
	};

/************************************************* 开启摄像头 *********************************************************** */

	// 使用MediaPipe Face Mesh库来启动一个摄像头，并在一个视频元素上实时显示人脸的3D网格
	const startCamera = () => {
		const videoElement = videoRef.current;
		if(!videoElement) return;
		const camera = new Camera(videoElement, {
			onFrame: async () => { // 用于在每一帧视频时调用 
				await facemesh.send({ image: videoElement }); // 将视频元素作为图像输入 进行人脸网格的检测和渲染
			},
			width: 640,
			height: 480,
		});
		camera.start();
	};

	useEffect(()=>{
		// 人脸网格创建
		createFaceMesh();
		// 相机
		startCamera();
	},[])

	return (
		<div className='Home'>
			<canvas className='L2Dmodel' ref={canvasRef}></canvas>
			<div className="preview">
				<video className="input_video" ref={videoRef}></video>
				<canvas className="guides" ref={guideRef}></canvas>
			</div>
		</div>
	)
}
