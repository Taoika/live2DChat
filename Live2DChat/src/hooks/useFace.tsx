import { useRef, useEffect } from 'react';
import { FaceMesh, FACEMESH_TESSELATION } from '@mediapipe/face_mesh';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Camera } from '@mediapipe/camera_utils';
import { Face, Results } from 'kalidokit'
import { rigFace } from '../utils/animateL2D';

const useFace = (models: React.MutableRefObject<any[]>) => {

    const videoRef = useRef<HTMLVideoElement>(null); // 视频标签
	const guideRef = useRef<HTMLCanvasElement>(null); // 视频所在
	let facemesh: FaceMesh;

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

    return { videoRef, guideRef }

}

export default useFace;