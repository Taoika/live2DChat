import { useRef, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { setNeedRender } from "../../store/slice/userInfo";
import { AppContext } from "../../App";

const useHandleOffer = () => {

    const dispatch = useAppDispatch();
    const { userId, needRender } = useAppSelector((state)=>state.userInfo)

    const { peerRef, socketRef } = useContext(AppContext)!
    const userModelRef = useRef(needRender)
    
    const handleOffer = async (offer: any) => { // 收到offer的处理
        const peer = peerRef.current

        await peer?.setRemoteDescription(offer); // 设置远端描述信息

        const answer = await peer?.createAnswer(); // 生成answer
        await peer?.setLocalDescription(answer); // 设置本地描述信息
        socketRef.current?.send(JSON.stringify({// 发送answer
            userId: userId.toString(),
            username: 'KKT',
            event: 'answer',
            data: JSON.stringify(answer)
        }))
        console.log('发送answer');
    }

    const handleCandidate = (candidate: any) => { // 收到candidate的处理
        peerRef.current?.addIceCandidate(candidate); // 添加candidate
    }

    const handleEnterRoom = (data: any) => { // 处理 用户进入房间
        dispatch(setNeedRender([...userModelRef.current, { // 添加需要未渲染的模型
            userId: data.userId,
            modelUrl: data.modelUrl
        }]))
    }

    const handleListUser = (data: any) => { // 最初所有用户信息的处理
        if(!data) return;
        const userModelList = data
            .map((value: any) => ({userId: value.userId, modelUrl: value.modelUrl})) // 格式化
            .filter((value: any) => value.userId != '') // 过滤空userId

        if(!userModelList[0]) return; // 一个新模型都没有

        dispatch(setNeedRender([...userModelRef.current, ...userModelList]))
    }

    return { handleOffer, handleCandidate, handleEnterRoom, handleListUser } 
}

export default useHandleOffer;