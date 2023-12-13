import { useEffect, useContext } from "react";
import { useAppSelector } from "../../store/hook";
import { AppContext } from "../../App";
import useSocketHandle from "./useSocketHandle";

// const WS_URL = 'ws://120.24.255.77:30000/websocket'
const WS_URL = 'wss://qgailab.com/websocket'

const useSocket = () => {

    const { userId, inRoom } = useAppSelector((state) => state.userInfo)
    const { handleOffer, handleCandidate, handleEnterRoom, handleListUser, handleExitRoom } = useSocketHandle(); // ws处理函数
    const { socketRef } = useContext(AppContext)!

    let heartTimer = 0; // 心跳定时器 ID

    const heartCheck = (socket: WebSocket) => { // 心跳检查
        clearInterval(heartTimer); // 先清除之前的定时器

        heartTimer = setInterval(() => {
            socket.send(JSON.stringify({ "event": "heartBeat" }));
        }, 30000);
    }


    const createSocket = () => { // socket创建

        if (socketRef.current) return;

        const socket = new WebSocket(`${WS_URL}?userId=${userId}`) // 信令服务器连接
        socket.onopen = () => { // 连接建立
            console.log("[ws open] 连接已建立");
            heartCheck(socket);// 心跳处理
        };

        socket.onmessage = async (event) => { // 接收到服务器的信息
            const msg = JSON.parse(event.data)
            switch (msg.event) {
                case 'offer':
                    handleOffer(JSON.parse(msg.data))
                    break;
                case 'candidate':
                    handleCandidate(JSON.parse(msg.data))
                    break;
                case 'enterRoom':
                    console.log(`[ws message] 用户${msg.data.userId}加入房间`);
                    handleEnterRoom(msg.data)
                    break;
                case 'listUser':
                    console.log(`[ws message] 收到房间中的用户信息`);
                    handleListUser(msg.data);
                    break;
                case 'exitRoom':
                    console.log(`[ws message] 用户${msg.data.userId}退出房间`);
                    handleExitRoom(msg.data)
                    break;
            }

        };

        socket.onclose = () => { // 连接关闭
            console.log('[ws close] 连接中断');
            socketRef.current = undefined
            clearInterval(heartTimer); // 清除定时器
        };

        socket.onerror = (error) => { // 连接错误
            console.log(`[error] 连接错误 `, error);
        };

        return socket;
    }

    useEffect(() => { // 监听房间
        if (inRoom && !socketRef.current) { // 刚进入房间
            socketRef.current = createSocket();
            return;
        }
        if (!inRoom && socketRef.current) { // 退出房间
            socketRef.current?.send(JSON.stringify({ type: 'exitRoom' }));
            socketRef.current.close();
            socketRef.current = undefined;
            console.log('[exit Room] socket清空');
            return;
        }
    }, [inRoom])



    return { socketRef }
}

export default useSocket