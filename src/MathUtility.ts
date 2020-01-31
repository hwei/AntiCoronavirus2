import { IVector3 } from "./engine/Object3d";

export function randomPointOnSphere(ud0: number, ud1: number, ud2: number, ud3: number) {
    // http://mathworld.wolfram.com/SpherePointPicking.html
    ud0 = ud0 * 2 - 1;
    ud1 = ud1 * 2 - 1;
    ud2 = ud2 * 2 - 1;
    ud3 = ud3 * 2 - 1;

    const ud02 = ud0 * ud0;
    const ud12 = ud1 * ud1;
    const ud22 = ud2 * ud2;
    const ud32 = ud3 * ud3;
    const m = ud02 + ud12 + ud22 + ud32;
    if (m >= 1)
        return undefined;
    return {
        x: 2 * (ud1 * ud3 + ud0 * ud2) / m,
        y: 2 * (ud2 * ud3 - ud0 * ud1) / m,
        z: (ud02 + ud32 - ud12 - ud22) / m,
    }
}

export function poissonNextTime(ud: number) {
    return -Math.log(1 - ud);
}

export function randomPointInCircle(ud0: number, ud1: number, ud2: number) {
    const t = 2 * Math.PI * ud0;
    const u = ud1 + ud2;
    const r = u > 1 ? 2 - u : u;
    return {
        x: r * Math.cos(t),
        y: r * Math.sin(t),
    }
}
