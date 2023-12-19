import { useEffect, useRef, useContext } from "react";
import { useAppSelector } from "../store/hook";
import { rigFace } from '../utils/model';
import { AppContext } from "../App";

/**
 * 数据通道初始化
 * @param peerRef peer
 * @param models 模型数组
 */
const useDataChannel = (
    models: React.MutableRefObject<any[]>
) => {

    const { live2dData } = useAppSelector((state) => state.live2d)
	const { inRoom, userId, rendered } = useAppSelector((state) => state.userInfo)

    const { peerRef } = useContext(AppContext)!
    const dataChannel = useRef<RTCDataChannel>();
    const renderedRef = useRef(rendered);

	const createDataChannel = () => { // dataChannel创建
		const channel = peerRef.current!.createDataChannel("myDataChannel66666666_1395212519");
	
		channel.onopen = () => {
		  console.log("[dataChannel open]");
		}
	
		channel.onmessage = (event) => {
			const { live2dData, userId } = JSON.parse(event.data);
			let index = -1;					
			renderedRef.current.forEach((value, i)=>{ // 判断用户在userModel中的索引值
				if(value.userId == userId){
					index = i;
					return ;
				}
			})
			if(index != -1){ // 能找到对应的用户
				rigFace(live2dData, 0.5, models.current[index])
			}
		}
	 
		channel.onclose = () => {
		  console.log("[dataChannel close]");
		}
	
		return channel
	}

    useEffect(()=>{ // 监听L2D数据更改
		if(!live2dData || dataChannel.current?.readyState != 'open') return ;				
		dataChannel.current?.send(JSON.stringify({live2dData, userId}))
	},[live2dData])

	useEffect(()=>{ // 监听用户是否在房间中
        if(inRoom && !dataChannel.current){ // 刚进入房间
            dataChannel.current = createDataChannel();
            return ;
        }
        if(!inRoom && dataChannel.current) { // 退出房间
            dataChannel.current.close();
            dataChannel.current = undefined;
            console.log('[exit Room] channel清空');
            return;
        }
		
	},[inRoom])

    useEffect(()=>{ // 监听用户模型数据变更		
		renderedRef.current = rendered
	},[rendered]);
}

export default useDataChannel