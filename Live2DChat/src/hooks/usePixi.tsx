import { useEffect, useRef } from 'react';
import { Point } from 'pixi.js'
import { Application } from 'pixi.js'
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import { createPixi, createModel } from '../utils/model';

// 为 Live2DModel 注册 Ticker
Live2DModel.registerTicker(Ticker);

// 为 Application 注册 Ticker
Application.registerPlugin(TickerPlugin);

/***
 * 将模型加载到pixi、放置到屏幕上
 * 
 * 参数: modelList 存放模型model3文件路径的数组
 * 
 * 返回值: canvasRef 模型渲染的div的ref models 模型数组
 */
const usePixi = (model: string) => {

    const canvasRef = useRef<HTMLCanvasElement>(null); // 模型渲染区域
    const models = useRef<any[]>([]); // 模型数组

    // pixi配置
    const setPixi = async () => {
        
        // 创建pixi应用
        const app = createPixi(canvasRef.current);

        // 模型
        const model1 = await createModel(model, [window.innerWidth * 0.2, window.innerHeight * 0.9], 0.4);
        models.current = [model1]

        // pixi配置模型
        app.stage.addChild(model1);

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

    useEffect(()=>{
        setPixi();
    },[])

    return { canvasRef, models }
}

export default usePixi

