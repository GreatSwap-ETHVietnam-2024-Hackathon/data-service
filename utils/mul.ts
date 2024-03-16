export function mulFixed10(a: string, b: string) {
    return (Math.round(+a * +b * 1e10) / 1e10).toString();
}