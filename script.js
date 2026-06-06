 const resultEl = document.getElementById('result');
  const expressionEl = document.getElementById('expression');

  let current = '0';
  let previous = null;
  let operator = null;
  let shouldReset = false;
  let activeOpBtn = null;

  function updateDisplay(val) {
    // Format number nicely
    let display = val;
    if (!isNaN(val) && val !== '' && val !== '-') {
      const num = parseFloat(val);
      if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
        display = num.toExponential(5).replace(/\.?0+e/, 'e');
      } else {
        // Add commas to integer part
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        display = parts.join('.');
      }
    }

    resultEl.textContent = display;

    // Adjust font size based on length
    const len = display.length;
    resultEl.className = 'result';
    if (len > 11) resultEl.classList.add('smaller');
    else if (len > 8) resultEl.classList.add('small');
  }

  function setActiveOp(btn) {
    if (activeOpBtn) activeOpBtn.classList.remove('active');
    activeOpBtn = btn;
    if (btn) btn.classList.add('active');
  }

  function clearActiveOp() {
    if (activeOpBtn) activeOpBtn.classList.remove('active');
    activeOpBtn = null;
  }

  function calculate(a, b, op) {
    a = parseFloat(a);
    b = parseFloat(b);
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 'Error' : a / b;
    }
  }

  function formatResult(n) {
    if (n === 'Error') return 'Error';
    // Avoid floating point weirdness
    const str = parseFloat(n.toPrecision(12)).toString();
    return str;
  }

  document.querySelector('.buttons').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const value = btn.dataset.value;

    switch (action) {
      case 'digit': {
        clearActiveOp();
        if (shouldReset) {
          current = value;
          shouldReset = false;
        } else {
          current = current === '0' ? value : current + value;
        }
        updateDisplay(current);
        // Change AC to C
        document.querySelector('[data-action="clear"]').textContent = 'C';
        break;
      }

      case 'decimal': {
        clearActiveOp();
        if (shouldReset) { current = '0.'; shouldReset = false; }
        else if (!current.includes('.')) current += '.';
        updateDisplay(current);
        break;
      }

      case 'operator': {
        if (operator && !shouldReset) {
          const res = calculate(previous, current, operator);
          const formatted = formatResult(res);
          expressionEl.textContent = `${previous} ${operator} ${current}`;
          previous = formatted;
          current = formatted;
          updateDisplay(formatted);
        } else {
          previous = current;
        }
        operator = value;
        shouldReset = true;
        expressionEl.textContent = `${previous} ${operator}`;
        setActiveOp(btn);
        break;
      }

      case 'equals': {
        clearActiveOp();
        if (!operator || previous === null) break;
        const res = calculate(previous, current, operator);
        const formatted = formatResult(res);
        expressionEl.textContent = `${previous} ${operator} ${current} =`;
        updateDisplay(formatted);
        current = formatted;
        previous = null;
        operator = null;
        shouldReset = true;
        break;
      }

      case 'clear': {
        clearActiveOp();
        if (btn.textContent === 'C') {
          current = '0';
          updateDisplay('0');
          btn.textContent = 'AC';
        } else {
          current = '0';
          previous = null;
          operator = null;
          shouldReset = false;
          expressionEl.textContent = '';
          updateDisplay('0');
        }
        break;
      }

      case 'sign': {
        clearActiveOp();
        if (current !== '0') {
          current = current.startsWith('-') ? current.slice(1) : '-' + current;
          updateDisplay(current);
        }
        break;
      }

      case 'percent': {
        clearActiveOp();
        const pct = parseFloat(current) / 100;
        current = formatResult(pct);
        updateDisplay(current);
        break;
      }
    }
  });

  // Keyboard support
  document.addEventListener('keydown', e => {
    const map = {
      '0':'0','1':'1','2':'2','3':'3','4':'4',
      '5':'5','6':'6','7':'7','8':'8','9':'9',
      '+':'+','-':'−','*':'×','/':'÷',
      'Enter':'=','=':'=','Backspace':'back',
      '.':'.','Escape':'AC','%':'%'
    };
    const action = map[e.key];
    if (!action) return;
    e.preventDefault();

    if (action === 'back') {
      if (!shouldReset && current.length > 1) current = current.slice(0, -1);
      else current = '0';
      updateDisplay(current);
    } else {
      // Find matching button and click it
      let selector;
      if ('0123456789'.includes(action)) selector = `[data-value="${action}"]`;
      else if ('÷×−+'.includes(action)) selector = `[data-value="${action}"]`;
      else if (action === '=') selector = `[data-action="equals"]`;
      else if (action === '.') selector = `[data-action="decimal"]`;
      else if (action === 'AC' || action === '%') selector = `[data-action="${action === 'AC' ? 'clear' : 'percent'}"]`;

      if (selector) {
        const el = document.querySelector(selector);
        if (el) el.click();
      }
    }
  });

  updateDisplay('0');