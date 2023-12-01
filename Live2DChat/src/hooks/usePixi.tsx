import { useEffect, useRef } from 'react';
import { Point } from 'pixi.js'
import { Application } from 'pixi.js'
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import { createPixi, createModel } from '../utils/model';
import { userModel } from '../type/Live2d';
import { useAppSelector } from '../store/hook';

// 为 Live2DModel 注册 Ticker
Live2DModel.registerTicker(Ticker);

// 为 Application 注册 Ticker
Application.registerPlugin(TickerPlugin);

/***
 * 将模型加载到pixi、放置到屏幕上
 * 
 * 参数: 
 * 
 * 返回值: canvasRef 模型渲染的div的ref models 模型数组
 */
const usePixi = () => {

    const { inRoom, userModel } = useAppSelector((state) => state.userInfo)

    const canvasRef = useRef<HTMLCanvasElement>(null); // 模型渲染区域
    const models = useRef<any[]>([]); // 模型数组

    // pixi配置
    const setPixi = async () => {
        
        // 创建pixi应用
        const app = createPixi(canvasRef.current);

        const modelUrlList = userModel.map(usermodel => usermodel.modelUrl)

        console.log(modelUrlList);
        
        // 模型
        modelUrlList.forEach(async modelUrl => {
            const model = await createModel(modelUrl, [window.innerWidth * 0.2, window.innerHeight * 0.9], 0.4);
            models.current.push(model)

            // pixi配置模型
            app.stage.addChild(model);
        })


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
        if(!inRoom || !userModel) return 
        setPixi();
    },[inRoom, userModel])

    return { canvasRef, models }
}

export default usePixi

