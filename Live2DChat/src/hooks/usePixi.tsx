import { useEffect, useRef } from 'react';
import { Point } from 'pixi.js'
import { Application } from 'pixi.js'
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import { createPixi, createModel } from '../utils/model';
import { useAppSelector, useAppDispatch } from '../store/hook';
import { setRendered, setNeedRender } from '../store/slice/userInfo';
import { userModel } from '../type/Live2d';

// 为 Live2DModel 注册 Ticker
Live2DModel.registerTicker(Ticker);

// 为 Application 注册 Ticker
Application.registerPlugin(TickerPlugin);

/**
 * 将模型加载到pixi、放置到屏幕上
 * return: canvasRef 模型渲染的div的ref models 模型数组
 */
const usePixi = () => {

    const dispatch = useAppDispatch()
    const { inRoom, needRender, rendered } = useAppSelector((state) => state.userInfo)

    const canvasRef = useRef<HTMLCanvasElement>(null); // 模型渲染区域
    const models = useRef<any[]>([]); // 模型数组
    const appRef = useRef<Application>()

    const getUrlList = (userModelList: userModel[]) => { // 从用户模型数组中提取模型数组
        return userModelList.map(usermodel => usermodel.modelUrl)
    }

    
    const setPixi = async () => { // pixi初始化
        
        // 创建pixi应用
        const app = createPixi(canvasRef.current);

        updateModel(app)

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

        appRef.current = app; // 更新app
        

    }

    const updateModel = (app: Application) => { // 模型数据更新
        const modelUrlList = getUrlList(needRender)
        
        // 模型
        modelUrlList.forEach(async modelUrl => {
            const model = await createModel(modelUrl, [window.innerWidth * 0.2, window.innerHeight * 0.9], 0.4);
            models.current.push(model)

            // pixi配置模型
            app.stage.addChild(model);
        })

        dispatch(setRendered([...rendered,...needRender])); // 更新已渲染模型
        dispatch(setNeedRender([])); // 更新未渲染模型
    }

    useEffect(()=>{ // 监听是否在房间中 是否有未渲染的模型 
        if(!inRoom || !needRender[0]) return 
        if(!rendered[0]){ // 没有已经渲染的模型            
            setPixi()
        }
        else {
            updateModel(appRef.current!);
        }
        
    },[inRoom, needRender])

    return { canvasRef, models }
}

export default usePixi

