function intToString(timeStamp: number): string {
    const date = new Date(timeStamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function now(): Date {
    return new Date();
}

function dateToString(date: Date) {
    const year: number = date.getFullYear();
    const month: number = date.getMonth() + 1;
    const day: number = date.getDate();
    const hour: number = date.getHours();
    const minute: number = date.getMinutes();
    const second: number = date.getSeconds();
    return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")} ${hour}:${minute}:${second}`;
}

export { intToString, now, dateToString };
