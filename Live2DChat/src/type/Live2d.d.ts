export type _Vctor = {
    x: number,
    y: number,
    z: number,
} 

export type live2d = {
    brow: number,
    eye: {
        l: number,
        r: number,
    },
    head: {
        degrees: {
            x: number,
            y: number,
            z: number
        },
        height: number,
        normalized: {
            x: number,
            y: number,
            z: number
        },
        position: {
            x: number,
            y: number,
            z: number
        },
        width: number,
        x: number,
        y: number,
        z: number,
    },
    mouth: {
        shape: {
            A: number,
            E: number,
            I: number,
            O: number,
            U: number,
        },
        x: number,
        y: number
    },
    pupil: {
        x: number,
        y: number
    }
}