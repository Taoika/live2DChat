import { useEffect, useRef } from "react";
import { useAppSelector } from "../store/hook";
import { rigFace } from '../utils/model';


const useDataChannel = (
    peerRef: React.MutableRefObject<RTCPeerConnection | undefined>,
    models: React.MutableRefObject<any[]>
) => {

    const { live2dData } = useAppSelector((state) => state.live2d)
	const { inRoom, userId, rendered } = useAppSelector((state) => state.userInfo)

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
		if(!inRoom || dataChannel.current) return;
		dataChannel.current = createDataChannel();
	},[inRoom])

    useEffect(()=>{ // 监听用户模型数据变更		
		renderedRef.current = rendered
	},[rendered]);
}

export default useDataChannel