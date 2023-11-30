import { useEffect, useRef } from 'react';
import { Application, Point } from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import { Utils } from 'kalidokit'
const { clamp } = Utils

/***
 * 将模型加载到pixi、放置到屏幕上
 * 
 * 参数: modelList 存放模型model3文件路径的数组
 * 
 * 返回值: canvasRef 模型渲染的div的ref models 模型数组
 */
const usePixi = (modelList: string[]) => {

    const canvasRef = useRef<HTMLCanvasElement>(null); // 模型渲染区域
    const models = useRef<any[]>([]); // 模型数组

    // pixi配置
    const setPixi = async () => {
        
        // 创建pixi应用
        const app = createPixi();

        // 模型
        const model1 = await createModel(modelList[0], [window.innerWidth * 0.2, window.innerHeight * 0.9], 0.4);
        const model2 = await createModel(modelList[1], [window.innerWidth * 0.5, window.innerHeight * 0.9], 0.2);
        models.current = [model1, model2]

        // pixi配置模型
        app.stage.addChild(model1, model2);

        // 交互配置
        const mousePosition = new Point();

        app.view.addEventListener('mousewheel', (ev: any) => { // 滚轮事件
            mousePosition.set(ev.clientX, ev.clientY);
            
            const found = app.renderer.plugins.interaction.hitTest(
                mousePosition,
                app.stage
            );
        
            if (found) { 
                found.emit('scroll', ev); 
            }
        });

    }

    // 创建pixi应用
    const createPixi = () => {
        return new Application({
            view: canvasRef.current ? canvasRef.current : undefined,
            autoStart: true,
            backgroundAlpha: 0,
            backgroundColor: 0xffffff,
            resizeTo: window,
        })
    }

    // 加载live2d模型
    const createModel = async (modelUrl: string, position: number[], scale: number)=> {
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
    const draggable = (model: any) => {
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

    useEffect(()=>{
        setPixi();
    },[])

    return { canvasRef, models }
}

export default usePixi

