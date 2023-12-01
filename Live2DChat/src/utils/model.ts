import { Application } from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import { Utils } from 'kalidokit'
const { clamp } = Utils

// 创建pixi应用
export const createPixi = (canvas: HTMLCanvasElement | null) => {
    return new Application({
        view: canvas ? canvas : undefined,
        autoStart: true,
        backgroundAlpha: 0,
        backgroundColor: 0xffffff,
        resizeTo: window,
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

    model.on("pointerup", (e: any) => { // 松开
        model.dragging = false;
    });

    model.on("pointermove", (e: any) => { // 移动		
        if (model.dragging) {
            model.position.set(e.data.global.x - model.offsetX, e.data.global.y - model.offsetY);
        }
    });

    model.on('scroll', (e: any) => { // 滚轮
        model.scale.set(clamp(model.scale.x + e.deltaY * -0.001, -0.5, 10)); 
    });
}