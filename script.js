"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

let accounts = [account1, account2, account3, account4];

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

let currentAccount;

const handleLoanRequest = function (e) {
  e.preventDefault();
  const { movements } = currentAccount;
  const loanAmount = Number(inputLoanAmount.value);
  const isQualified = movements.some((m) => m >= loanAmount * 0.1);

  if (loanAmount && loanAmount > 0 && isQualified) {
    currentAccount.movements.push(loanAmount);
    inputLoanAmount.value = "";
    updateUI(currentAccount);
  }
};

btnLoan.addEventListener("click", handleLoanRequest);

const handleLogin = function (e) {
  e.preventDefault();
  const username = inputLoginUsername.value;
  const pin = inputLoginPin.value;
  currentAccount = accounts.find((account) => account.username === username);
  if (currentAccount?.pin === Number(pin)) {
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

const calcDisplayBalance = function (account) {
  const { movements } = account;
  account.balance = movements.reduce((acc, val) => {
    return acc + val;
  }, 0);

  labelBalance.textContent = `${account.balance} €`;
};

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
    receiverAccount.movements.push(amount);
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
  }
  inputCloseUsername.value = inputClosePin.value = "";
};

btnClose.addEventListener("click", handleCloseAccount);

const calcDisplaySummary = function (account) {
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
  labelSumIn.textContent = `${summary.inflows} €`;
  labelSumOut.textContent = `${Math.abs(summary.outflows)} €`;
  labelSumInterest.textContent = `${Math.round(interestSum * 100) / 100} €`;
};

function createUserNames(accountsArr) {
  accountsArr.forEach((account) => {
    const username = account.owner
      .split(" ")
      .map((n) => n[0].toLowerCase())
      .join("");

    account.username = username;
  });
}

function displayMovements(account) {
  const { movements } = account;
  containerMovements.innerHTML = "";
  movements.forEach((mov, i) => {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov}</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

function updateUI(account) {
  displayMovements(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
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
