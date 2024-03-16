export function chunk<T>(arr: T[], chunkSize: number) {
    const R = [];
    for (var i = 0; i < arr.length; i += chunkSize)
        R.push(arr.slice(i, i + chunkSize));
    return R;
}

export function max<T>(arr: T[], gt: (a: T, b: T) => boolean) {
    if (arr.length === 0) throw new Error("Array is empty");
    let idMax = 0;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (gt(arr[i], max)) {
            max = arr[i]
            idMax = i;
        }
    }
    return { index: idMax, value: max };
}