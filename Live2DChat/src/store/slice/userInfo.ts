import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..';

const initialState = {
    userId: 0,
};

// 用户数据
export const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<number>) => {
            state.userId = action.payload;
        },
    },
});

export const { setUserId } = userInfoSlice.actions

export const selectLive2dData = (state: RootState) => {
    const { userId } = state.userInfo;
    return { userId };
}

export default userInfoSlice.reducer

