'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Monta Haddeji',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2022-05-09T09:15:04.904Z',
    '2022-05-10T10:17:24.185Z',
    '2022-05-14T13:11:59.604Z',
    '2022-05-15T17:01:17.194Z',
    '2022-05-16T20:36:17.929Z',
    '2022-05-17T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'GBP',
  locale: 'en-GB',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// GLOBAL VARIABLES
let currentUser;
let balance;
let isSorted = false;
let logoutInt;

// TRANSFORM
const addZero = (n) => (n < 10 ? `0${n}` : n);

// MOVEMENTS DATE
const movDate = (dateStr, locale) => {
  const date = new Date(dateStr);
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    // weekday: 'short',
  };
  return new Intl.DateTimeFormat(locale, options).format(new Date());
};

// CALCULATE PASSED DAYS
const calcPassedDays = (date1, date2) =>
  Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);

// GET THE MOVEMENT DAY
const movDay = (date) => {
  const passDays = Math.floor(calcPassedDays(new Date(), new Date(date)));
  return passDays === 0
    ? 'Today'
    : passDays === 1
    ? 'Yesterday'
    : passDays <= 7
    ? `${passDays} Days Ago`
    : movDate(date, currentUser.locale);
};

// FORMAT CURRENCIES
const formatCurrencies = (money) => {
  const options = {
    style: 'currency',
    currency: currentUser.currency,
  };
  return new Intl.NumberFormat(currentUser.locale, options).format(money);
};

// DISPLAY ALL TRANSACTIONS
const diplayMovements = (movements) => {
  containerMovements.innerHTML = '';
  movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const movRow = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}
          }">${i + 1} ${type}</div>
          <div class="movements__date">${movDay(
            currentUser.movementsDates[i]
          )}</div>
          <div class="movements__value">${formatCurrencies(mov)}</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', movRow);
  });
};

// CALCULATE & SHOW BALANCE
const calculateBalance = (movements) => {
  balance = movements.reduce((v, c) => v + c, 0);
  labelBalance.innerText = formatCurrencies(balance);
};

// CALCULATE SUMMARY (IN, OUT, INTEREST)
const calculateSummary = (movements, interestRate) => {
  const [inMoney, outMoney, interest] = movements.reduce(
    (v, c) => {
      c > 0
        ? (v[0] += c) &&
          (c * interestRate) / 100 >= 1 &&
          (v[2] += (c * 1.2) / 100)
        : (v[1] += c);
      return [v[0], v[1], v[2]];
    },
    [0, 0, 0]
  );
  labelSumIn.innerText = formatCurrencies(inMoney);
  labelSumOut.innerText = formatCurrencies(outMoney);
  labelSumInterest.innerText = formatCurrencies(interest);
};

// CREATE USERNAME
const createUserName = (accounts) =>
  accounts.forEach(
    (account) =>
      (account.userName = account.owner
        .toLowerCase()
        .split(' ')
        .map((el) => el[0])
        .join(''))
  );
createUserName(accounts);

// UPDATE UI
const updateUI = (movements, interestRate) => {
  diplayMovements(movements);
  calculateBalance(movements);
  calculateSummary(movements, interestRate);
};

// DISPLAY CONNECTION DATE
const displayDate = () => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
  };
  labelDate.innerText = new Intl.DateTimeFormat(
    currentUser.locale,
    options
  ).format(new Date());
};

// LOGOUT COUNTDOWN
const logoutTime = () => {
  window.clearInterval(logoutInt);
  const sessionTime = new Date().getTime() + 60000 * 5;
  logoutInt = setInterval(() => {
    const resTime = sessionTime - new Date().getTime();
    const restMins = Math.trunc(resTime / 60000);
    const restSecs = Math.trunc((resTime / 1000) % 60);
    labelTimer.innerText = `${addZero(restMins)}:${addZero(restSecs)}`;
    if (resTime <= 0) {
      window.clearInterval(logoutInt);
      containerApp.style.opacity = 0;
      labelWelcome.innerText = 'Log in to get started';
    }
  }, 1000);
};

// EVENTS
btnLogin.addEventListener('click', login);
btnTransfer.addEventListener('click', transferMoney);
btnClose.addEventListener('click', closeAccount);
btnLoan.addEventListener('click', getLoan);
btnSort.addEventListener('click', sortMovements);

// HANDLERS

function login(e) {
  e.preventDefault();
  const userName = inputLoginUsername.value;
  const userPIN = inputLoginPin.value;
  currentUser = accounts.find(
    (account) =>
      account.userName === userName.toLowerCase() &&
      account.pin === Number(userPIN)
  );
  if (currentUser) {
    const { movements, owner, interestRate } = currentUser;
    // UPDATE UI
    updateUI(movements, interestRate);
    // SHOW UI
    containerApp.style.opacity = 1;
    labelWelcome.innerText = `Welcome back, ${owner.split(' ')[0]}`;
    inputLoginUsername.blur();
    inputLoginPin.blur();
    // DISPLAY CONNECTION DATE
    displayDate();
    // LOGOUT COUNTDOWN
    logoutTime();
  } else {
    console.log(`Username: ${userName} Or PIN: ${userPIN}, Is Inccorect`);
    inputLoginUsername.focus();
  }
  inputLoginUsername.value = inputLoginPin.value = '';
  // CLEAN TRANSFER && CLOSE INPUTS
  inputTransferAmount.value = inputTransferTo.value = '';
  inputCloseUsername.value = inputClosePin.value = '';
}

function sortMovements(e) {
  e.preventDefault();
  isSorted = !isSorted;
  isSorted
    ? diplayMovements([...currentUser.movements].sort((a, b) => a - b))
    : diplayMovements(currentUser.movements);
}

function transferMoney(e) {
  e.preventDefault();
  // RESET LOGOUT COUNTDOWN
  logoutTime();
  const amount = Number(inputTransferAmount.value);
  const transferToAccount = accounts.find(
    (account) => account.userName === inputTransferTo.value
  );
  if (
    transferToAccount &&
    transferToAccount !== currentUser &&
    amount >= 10 &&
    balance >= amount
  ) {
    transferToAccount.movements.push(amount);
    transferToAccount.movementsDates.push(new Date().toISOString());
    currentUser.movements.push(-amount);
    currentUser.movementsDates.push(new Date().toISOString());
    // UPDATE UI
    updateUI(currentUser.movements, currentUser.interestRate);
  }
  inputTransferAmount.value = inputTransferTo.value = '';
}

function getLoan(e) {
  e.preventDefault();
  // RESET LOGOUT COUNTDOWN
  logoutTime();
  const loanAmount = Math.floor(inputLoanAmount.value);
  if (
    currentUser.movements.some((mov) => mov >= loanAmount * 0.1) &&
    loanAmount > 10
  ) {
    setTimeout(() => {
      currentUser.movements.push(loanAmount);
      currentUser.movementsDates.push(new Date().toISOString());
      // UPDATE UI
      updateUI(currentUser.movements, currentUser.interestRate);
    }, 2000);
  }
  inputLoanAmount.value = '';
}

function closeAccount(e) {
  e.preventDefault();
  if (
    currentUser.userName === inputCloseUsername.value &&
    currentUser.pin === Number(inputClosePin.value)
  ) {
    const currentUserIndex = accounts.findIndex(
      (account) => account === currentUser
    );
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
    accounts.splice(currentUserIndex, 1);
  }
  inputCloseUsername.value = inputClosePin.value = '';
}
