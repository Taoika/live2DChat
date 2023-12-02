import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..';
import { userModel } from '../../type/Live2d';


const initialState = {
    userId: 0,
    inRoom: false,
    needRender:<userModel[]> [], // 尚未渲染的模型
    rendered:<userModel[]> [] // 已经渲染的模型
};

// 用户数据
export const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<number>) => {
            state.userId = action.payload;
        },
        setInRoom: (state, action: PayloadAction<boolean>) => {
            state.inRoom = action.payload;
        }, 
        setNeedRender: (state, action: PayloadAction<userModel[]>) => {
            state.needRender = action.payload;
        },
        setRendered: (state, action: PayloadAction<userModel[]>) => {
            state.rendered = action.payload;
        }
    },
});

export const { setUserId, setNeedRender, setInRoom, setRendered } = userInfoSlice.actions

export const selectLive2dData = (state: RootState) => {
    const { userId, needRender, inRoom, rendered } = state.userInfo;
    return { userId, needRender, inRoom, rendered };
}

export default userInfoSlice.reducer

