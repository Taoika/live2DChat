import { TFace } from "kalidokit"
import { live2d } from "../type/Live2d"

export const typeTransform = (face: TFace): live2d => {
    return {
        brow: face.brow,
        eye: face.eye,
        head: {
            degrees: face.head.degrees,
            height: face.head.height,
            normalized: face.head.normalized,
            position: {
                x: face.head.position.x,
                y: face.head.position.y,
                z: face.head.position.z
            },
            width: face.head.width,
            x: face.head.x,
            y: face.head.y,
            z: face.head.z,
        },
        mouth: face.mouth,
        pupil: face.pupil,
    }
}  