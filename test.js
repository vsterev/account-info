function solve(...params) {
    let operationsMap = {
        "+": (x, y) => x + y,
        "-": (x, y) => x - y,
        "*": (x, y) => x * y,
        "/": (x, y) => x / y,
        "%": (x, y) => x % y,
        "**": (x, y) => x ** y,
    };
    let operator = params.pop();
   console.log( params
        .reduce((a, b) =>
            operationsMap[operator](a, +b), +params.shift()));
}
solve(2, '2', '3', '*');
