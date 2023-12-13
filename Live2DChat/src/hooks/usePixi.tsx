import { useEffect, useRef } from 'react';
import { Point } from 'pixi.js'
import { Application } from 'pixi.js'
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import { createPixi, createModel } from '../utils/model';
import { useAppSelector, useAppDispatch } from '../store/hook';
import { setRendered, setNeedRender, setNeedUnist } from '../store/slice/userInfo';
import { userModel } from '../type/Live2d';

// 为 Live2DModel 注册 Ticker
Live2DModel.registerTicker(Ticker);

// 为 Application 注册 Ticker
Application.registerPlugin(TickerPlugin);

/**
 * 将模型加载到pixi、放置到屏幕上
 * @returns  canvasRef 模型渲染的div的ref models 模型数组
 */
const usePixi = () => {

    const dispatch = useAppDispatch()
    const { inRoom, needRender, rendered, needUninst } = useAppSelector((state) => state.userInfo)

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

        const length = models.current.length
        
        // 模型
        var index = 1;
        modelUrlList.forEach(async modelUrl => {
            
            var width = (length + index++) * 0.2 * window.innerWidth // 模型大小适配各端
            var scale = 0.1
            var height = window.innerHeight * 0.5
            if (window.screen.width < 480) {
                scale = 0.05
                height = window.innerHeight * 0.2
            }
            const model = await createModel(modelUrl, [width, height], scale);
            models.current.push(model);
            // pixi配置模型
            app.stage.addChild(model);
        })

        dispatch(setRendered([...rendered,...needRender])); // 更新已渲染模型
        dispatch(setNeedRender([])); // 更新未渲染模型
    }

    useEffect(()=>{ // 监听是否在房间中 是否有未渲染的模型 

        if(!inRoom && appRef.current){ // 退出房间 模型移除 结束
            appRef.current?.stage.removeChildren()
            appRef.current = undefined;
            console.log('[exit Room] app清空');

            models.current = [];
            console.log('[exit Room] model清空');

            dispatch(setRendered([]))
            console.log('[exit Room] rendered清空');
            
            
            return ;
        }
        if(!needRender[0]) return  // 没有需要渲染的模型 结束

        if(!rendered[0]){ // 没有已经渲染的模型      
            setPixi() // 初始化
        }
        else {
            updateModel(appRef.current!); // 模型更新
        }
        
    },[inRoom, needRender])

    useEffect(()=>{ // 监听 needUninst

        if(!needUninst[0]) return;

        needUninst.forEach(uni => { // 遍历 uni
            rendered.forEach((ren, index) => { // 遍历ren
                if(ren.userId == uni.userId){ // 相同id
                    
                    appRef.current?.stage.removeChild(models.current[index]); // app模型卸载
                    models.current.splice(index, 1); // models 删除指定索引值
                    
                    dispatch(setRendered(rendered.slice(0, index).concat(rendered.slice(index+1)))); // 已渲染模型更新
                    return;
                }
            })
        })

        dispatch(setNeedUnist([])); // 需要卸载模型 清空
    },[needUninst]);

    return { canvasRef, models }
}

export default usePixi

