import { Application } from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import { Utils, Face, Vector } from 'kalidokit'
const { clamp } = Utils
const { lerp } = Vector

// 创建pixi应用
export const createPixi = (canvas: HTMLCanvasElement | null) => {
    return new Application({
        view: canvas ? canvas : undefined,
        autoStart: true,
        backgroundAlpha: 0,
        backgroundColor: 0xffffff,
        resizeTo: window,
        transparent: true,
    })
}

// 加载live2d模型
export const createModel = async (modelUrl: string, position: number[], scale: number)=> {
    // 强制转换成Cubism4InternalModel类型
    const model = await Live2DModel.from(modelUrl, { autoInteract: false, autoUpdate: true,});
    model.scale.set(scale); // 规模
    model.interactive = true; // 交互
    model.anchor.set(0.5, 0.5);
    model.position.set(position[0], position[1]);

    // 为L2D模型添加事件监听器 拖动模型功能
    draggable(model);

    return model
}

// 模型拖曳设置
export const draggable = (model: any) => {
    model.on("pointerdown", (e: any) => { // 按下
        model.offsetX = e.data.global.x - model.position.x;
        model.offsetY = e.data.global.y - model.position.y;
        model.dragging = true;
    });

    model.on("pointerup", () => { // 松开
        model.dragging = false;
    });

    model.on("pointermove", (e: any) => { // 移动		 
        if (model.dragging) {
            model.position.set(e.data.global.x - model.offsetX, e.data.global.y - model.offsetY);
        }
    });

    model.on('scroll', async (e: any) => { // 滚轮
        console.log("x = ",model.scale._x, "y =", model.scale._y);
        if (model.scale._x < 0.05) {
            model.scale.set(0.05)
            return 
        }

        if (model.scale._x < 0 || model.scale._y < 0) {
            model.scale.set(0.05)
            return 
        }

        if(model.scale._y > 0.13 || model.scale._x > 0.13) {
            model.scale.set(0.13)
            return 
        }
        
        await model.scale.set(clamp(model.scale.x + e.deltaY * -0.000006, -0.5, 10)); 
    });
}   

// 更新 live2d 模型内部状态
export const rigFace = (result: any, lerpAmount = 0.7, model: any) => {
    if (!model || !result) return;
    // 核心模型 L2D模型对象 用于显示和控制2D动画角色
    const coreModel = model.internalModel.coreModel;

    // 重写动作管理器的update方法 作用是更新模型的动画状态
    model.internalModel.motionManager.update = () => {
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