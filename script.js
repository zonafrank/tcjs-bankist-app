"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2021-09-24T17:01:17.194Z",
    "2021-09-30T12:36:17.929Z",
    "2021-10-01T08:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

createUserNames(accounts);

let logoutTimerId;
let loggedInUser = localStorage.getItem("loggedInUser");

let currentAccount = loggedInUser
  ? accounts.find((acc) => acc.username === loggedInUser)
  : null;

let sorted = false;

if (loggedInUser) {
  containerApp.style.opacity = 1;
  updateUI(currentAccount);
}

function formatDisplayDate(date, locale, noOptions = true) {
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    weekday: "long",
  };

  if (noOptions) {
    return Intl.DateTimeFormat(locale).format(date);
  }
  return Intl.DateTimeFormat(locale, options).format(date);
}

function formatDisplayNumber(value, locale, curr) {
  const options = {
    style: "currency",
    currency: curr,
  };
  return new Intl.NumberFormat(locale, options).format(value);
}

function startLogoutTimer() {
  let timeRemaining = 120;
  clearInterval(logoutTimerId);
  logoutTimerId = setInterval(() => {
    if (timeRemaining <= 0) {
      localStorage.removeItem("loggedInUser");
      loggedInUser = null;
      currentAccount = null;
      containerApp.style.opacity = 0;
      clearInterval(logoutTimerId);
    }
    const min = `${Math.trunc(timeRemaining / 60)}`.padStart(2, "0");
    const sec = `${timeRemaining % 60}`.padStart(2, "0");

    labelTimer.textContent = `${min}:${sec}`;
    timeRemaining--;
  }, 1000);
}

function getDateComponents(date) {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");
  return [day, month, year, hours, minutes, seconds];
}

function calcDaysPassed(date, locale) {
  const currDate = new Date();
  const daysPassed = Math.abs(currDate - date) / (1000 * 60 * 60 * 24);

  let daysPassedText;

  if (daysPassed < 1) {
    if (date.getDate() === currDate.getDate()) {
      daysPassedText = "Today";
    } else {
      daysPassedText = "YesterDay";
    }
  } else if (daysPassed === 1) {
    daysPassedText = "Yesterday";
  } else if (daysPassed <= 7) {
    daysPassedText = `${Math.ceil(daysPassed)} days ago`;
  } else {
    daysPassedText = formatDisplayDate(date, locale);
  }

  return daysPassedText;
}

const handleSort = function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
};

btnSort.addEventListener("click", handleSort);

const handleLoanRequest = function (e) {
  e.preventDefault();
  const { movements } = currentAccount;
  const loanAmount = Math.round(Number(inputLoanAmount.value));
  const isQualified = movements.some((m) => m >= loanAmount * 0.1);

  if (loanAmount && loanAmount > 0 && isQualified) {
    setTimeout(() => {
      currentAccount.movements.push(loanAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 5000);
    inputLoanAmount.value = "";
  }
};

btnLoan.addEventListener("click", handleLoanRequest);

// Handle login to application
const handleLogin = function (e) {
  e.preventDefault();
  const username = inputLoginUsername.value;
  const pin = inputLoginPin.value;
  currentAccount = accounts.find((account) => account.username === username);
  if (currentAccount?.pin === Number(pin)) {
    clearInterval(logoutTimerId);
    localStorage.setItem("loggedInUser", username);
    // display UI and a welcome message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 1;
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    updateUI(currentAccount);
  }
};

btnLogin.addEventListener("click", handleLogin);

function calcDisplayBalance(account) {
  const { movements } = account;
  account.balance = movements.reduce((acc, val) => {
    return acc + val;
  }, 0);

  const { locale, currency } = account;
  labelBalance.textContent = `${formatDisplayNumber(
    account.balance,
    locale,
    currency
  )}`;
}

const handleTransfer = function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    (acc) => inputTransferTo.value === acc.username
  );

  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAccount &&
    receiverAccount?.username !== currentAccount.userName
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movements.push(amount);
    receiverAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    inputTransferTo.value = "";
    inputTransferAmount.value = "";
  }
};

btnTransfer.addEventListener("click", handleTransfer);

const handleCloseAccount = function (e) {
  e.preventDefault();
  const username = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);
  if (username === currentAccount.username && pin === currentAccount.pin) {
    accounts = accounts.filter((acc) => acc.username !== username);
    containerApp.style.opacity = 0;
    localStorage.removeItem(loggedInUser);
  }
  inputCloseUsername.value = inputClosePin.value = "";
};

btnClose.addEventListener("click", handleCloseAccount);

function calcDisplaySummary(account) {
  const { movements, interestRate } = account;

  const summary = movements.reduce(
    (acc, amount) => {
      if (amount > 0) {
        acc.inflows += amount;
      } else {
        acc.outflows += amount;
      }
      return acc;
    },
    { inflows: 0, outflows: 0 }
  );

  let interestSum = 0;

  movements.forEach((m) => {
    if (m > 0) {
      const interest = (m * currentAccount.interestRate) / 100;
      if (interest >= 1) {
        interestSum += interest;
      }
    }
  });

  const { locale, currency } = currentAccount;

  labelSumIn.textContent = `${formatDisplayNumber(
    summary.inflows,
    locale,
    currency
  )}`;
  labelSumOut.textContent = `${formatDisplayNumber(
    summary.outflows,
    locale,
    currency
  )}`;
  labelSumInterest.textContent = `${formatDisplayNumber(
    interestSum,
    locale,
    currency
  )}`;
}

function createUserNames(accountsArr) {
  accountsArr.forEach((account) => {
    const username = account.owner
      .split(" ")
      .map((n) => n[0].toLowerCase())
      .join("");

    account.username = username;
  });
}

// Display movements
function displayMovements(account, sort = false) {
  const { movements } = account;
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  containerMovements.innerHTML = "";
  movs.forEach((mov, i) => {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const date = new Date(account.movementsDates[i]);
    const daysPassed = calcDaysPassed(date, account.locale);

    const { locale, currency } = currentAccount;
    const formattedMovement = formatDisplayNumber(mov, locale, currency);

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${daysPassed}</div>
          <div class="movements__value">${formattedMovement}</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

function updateUI(account) {
  function updateTime() {
    if (currentAccount) {
      const formattedDate = formatDisplayDate(
        new Date(),
        currentAccount.locale,
        false
      );
      labelDate.textContent = formattedDate;
      setTimeout(() => {
        updateTime();
      }, 1000 * 60);
    }
  }

  updateTime();
  displayMovements(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
  startLogoutTimer();
}
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
/////////////////////////////////////////////////
