document.addEventListener('DOMContentLoaded', () => {
    const display = document.querySelector('.calculator-display');
    const buttons = document.querySelector('.calculator-buttons');

    let currentExpression = '';
    let lastInputWasOperator = false;
    let lastInputWasEquals = false;

    function updateDisplay() {
        display.value = currentExpression === '' ? '0' : currentExpression;
    }

    updateDisplay();

function inputDigit(digit) {
    if (lastInputWasEquals || currentExpression === '0') {
        currentExpression = digit;
        lastInputWasEquals = false;
    } else {
        currentExpression += digit;
    }
    lastInputWasOperator = false;
    updateDisplay();
}


    function inputDecimal(dot) {
        if (lastInputWasEquals) {
            currentExpression = '0.';
            lastInputWasEquals = false;
            lastInputWasOperator = false;
        } else if (currentExpression === '' || lastInputWasOperator) {
            currentExpression += '0.';
            lastInputWasOperator = false;
        } else if (!currentExpression.split(/[\+\-\*\/%]/).pop().includes(dot)) {
            currentExpression += dot;
            lastInputWasOperator = false;
        }
        updateDisplay();
    }

    function evaluateExpression() {
        try {
            let expressionToEvaluate = currentExpression.replace(/x/g, '*');
            const lastChar = expressionToEvaluate.slice(-1);
            if (['+', '-', '*', '/', '%', '.'].includes(lastChar)) {
                expressionToEvaluate = expressionToEvaluate.slice(0, -1);
            }
            const result = eval(expressionToEvaluate);
            if (result === Infinity || result === -Infinity) {
                return 'Error';
            }
            return String(parseFloat(result.toFixed(10)));
        } catch (e) {
            return 'Error';
        }
    }

    function handleOperator(nextOperator) {
        if (nextOperator === 'equals') {
            if (currentExpression === '' || lastInputWasOperator) {
                return;
            }
            const result = evaluateExpression();
            currentExpression = result;
            lastInputWasEquals = true;
            lastInputWasOperator = false;
            updateDisplay();
            return;
        }

        if (lastInputWasOperator) {
            currentExpression = currentExpression.slice(0, -1) + nextOperator;
        } else {
            currentExpression += nextOperator;
        }
        lastInputWasOperator = true;
        lastInputWasEquals = false;
        updateDisplay();
    }

    function resetCalculator() {
        currentExpression = '0';
        lastInputWasOperator = false;
        lastInputWasEquals = false;
        updateDisplay();
    }

    function backspace() {
        if (currentExpression === 'Error' || lastInputWasEquals) {
            currentExpression = '0';
        } else if (currentExpression.length > 1) {
            currentExpression = currentExpression.slice(0, -1);
            const lastCharAfterBackspace = currentExpression.slice(-1);
            if (['+', '-', '*', '/', '%'].includes(lastCharAfterBackspace)) {
                lastInputWasOperator = true;
            } else {
                lastInputWasOperator = false;
            }
        } else {
            currentExpression = '0';
        }
        updateDisplay();
    }

    buttons.addEventListener('click', (event) => {
        const { target } = event;

        if (!target.matches('button')) {
            return;
        }

        if (target.classList.contains('number')) {
            inputDigit(target.textContent);
        } else if (target.classList.contains('operator')) {
            const action = target.dataset.action;

            switch (action) {
                case 'decimal':
                    inputDecimal('.');
                    break;
                case 'clear':
                    resetCalculator();
                    break;
                case 'backspace':
                    backspace();
                    break;
                case 'percentage':
                    try {
                        const parts = currentExpression.split(/([\+\-\*\/])/);
                        let lastNum = parts.pop();
                        let operatorBeforeLastNum = parts.pop();

                        if (lastNum === '' && operatorBeforeLastNum) {
                            lastNum = operatorBeforeLastNum;
                            operatorBeforeLastNum = parts.pop();
                        }

                        const numVal = parseFloat(lastNum);

                        if (!isNaN(numVal) && lastNum !== '') {
                            const percentVal = String(numVal / 100);
                            currentExpression = currentExpression.substring(0, currentExpression.lastIndexOf(lastNum)) + percentVal;
                        } else if (currentExpression !== 'Error' && currentExpression !== '') {
                            const singleNum = parseFloat(currentExpression);
                            if (!isNaN(singleNum)) {
                                currentExpression = String(singleNum / 100);
                            }
                        }
                        updateDisplay();
                    } catch (e) {
                        currentExpression = 'Error';
                        updateDisplay();
                    }
                    lastInputWasOperator = false;
                    break;
                case 'add':
                case 'subtract':
                case 'multiply':
                case 'divide':
                    const symbol = {
                        'add': '+',
                        'subtract': '-',
                        'multiply': 'x',
                        'divide': '/'
                    }[action];
                    handleOperator(symbol);
                    break;
                case 'equals':
                    handleOperator('equals');
                    break;
            }
        }
    });
});
