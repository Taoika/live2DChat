import { Camera as _Camera } from '@mediapipe/camera_utils';
const win = window as any;
const Camera = _Camera || win.Camera;

// 使用MediaPipe Face Mesh库来启动一个摄像头，并在一个视频元素上实时显示人脸的3D网格
export const startCamera = (facemesh: any, videoElement: HTMLVideoElement | null) => {
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