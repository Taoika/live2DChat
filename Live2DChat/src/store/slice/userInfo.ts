import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..';
import { userModel } from '../../type/Live2d';


const initialState = {
    userId: 0,
    inRoom: false,
    userModel:<userModel[]> []
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
        setUserModel: (state, action: PayloadAction<userModel[]>) => {
            state.userModel = action.payload;
        }
    },
});

export const { setUserId, setUserModel, setInRoom } = userInfoSlice.actions

export const selectLive2dData = (state: RootState) => {
    const { userId, userModel, inRoom } = state.userInfo;
    return { userId, userModel, inRoom };
}

export default userInfoSlice.reducer

