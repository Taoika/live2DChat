import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { live2d } from '../../type/Live2d'
import { RootState } from '..';

interface initialState {
    live2dData: live2d | null,
};

const initialState: initialState = {
    live2dData: null,
};

// live2d数据
export const live2dSlice = createSlice({
    name: 'live2d',
    initialState,
    reducers: {
        setLive2dData: (state, action: PayloadAction<live2d>) => {
            state.live2dData = action.payload;
        },
    },
});

export const { setLive2dData } = live2dSlice.actions

export const selectLive2dData = (state: RootState) => {
    const { live2dData } = state.live2d;
    return { live2dData };
}

export default live2dSlice.reducer

