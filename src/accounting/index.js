const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const INITIAL_BALANCE_CENTS = 100000;
const MAX_BALANCE_CENTS = 99999999;

let storageBalanceCents = INITIAL_BALANCE_CENTS;

function formatMoney(cents) {
  return (cents / 100).toFixed(2);
}

function parseAmountToCents(rawAmount) {
  const normalized = rawAmount.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [wholePart, decimalPart = ''] = normalized.split('.');
  const decimalNormalized = `${decimalPart}00`.slice(0, 2);
  const cents = Number(wholePart) * 100 + Number(decimalNormalized);

  if (!Number.isSafeInteger(cents)) {
    return null;
  }

  return cents;
}

function resetBalance() {
  storageBalanceCents = INITIAL_BALANCE_CENTS;
}

function getBalance() {
  return storageBalanceCents;
}

function setBalance(cents) {
  storageBalanceCents = cents;
}

function dataProgram(operationType, balanceCents = 0) {
  if (operationType === 'READ') {
    return storageBalanceCents;
  }

  if (operationType === 'WRITE') {
    storageBalanceCents = balanceCents;
    return storageBalanceCents;
  }

  throw new Error(`Unsupported data operation: ${operationType}`);
}

async function operations(operationType, rl) {
  if (operationType === 'TOTAL ') {
    const finalBalanceCents = dataProgram('READ');
    output.write(`Current balance: ${formatMoney(finalBalanceCents)}\n`);
    return;
  }

  if (operationType === 'CREDIT') {
    const amountInput = await rl.question('Enter credit amount: ');
    const amountCents = parseAmountToCents(amountInput);

    if (amountCents === null || amountCents <= 0) {
      output.write('Invalid amount. Please enter a positive number with up to 2 decimals.\n');
      return;
    }

    const finalBalanceCents = dataProgram('READ');
    const updatedBalanceCents = finalBalanceCents + amountCents;

    if (updatedBalanceCents > MAX_BALANCE_CENTS) {
      output.write(`Credit rejected. Maximum balance is ${formatMoney(MAX_BALANCE_CENTS)}.\n`);
      return;
    }

    dataProgram('WRITE', updatedBalanceCents);
    output.write(`Amount credited. New balance: ${formatMoney(updatedBalanceCents)}\n`);
    return;
  }

  if (operationType === 'DEBIT ') {
    const amountInput = await rl.question('Enter debit amount: ');
    const amountCents = parseAmountToCents(amountInput);

    if (amountCents === null || amountCents <= 0) {
      output.write('Invalid amount. Please enter a positive number with up to 2 decimals.\n');
      return;
    }

    const finalBalanceCents = dataProgram('READ');

    if (finalBalanceCents >= amountCents) {
      const updatedBalanceCents = finalBalanceCents - amountCents;
      dataProgram('WRITE', updatedBalanceCents);
      output.write(`Amount debited. New balance: ${formatMoney(updatedBalanceCents)}\n`);
      return;
    }

    output.write('Insufficient funds for this debit.\n');
    return;
  }

  output.write('Unsupported operation type.\n');
}

async function mainProgram() {
  const rl = readline.createInterface({ input, output });
  let continueFlag = 'YES';

  try {
    while (continueFlag !== 'NO') {
      output.write('--------------------------------\n');
      output.write('Account Management System\n');
      output.write('1. View Balance\n');
      output.write('2. Credit Account\n');
      output.write('3. Debit Account\n');
      output.write('4. Exit\n');
      output.write('--------------------------------\n');

      const choiceInput = await rl.question('Enter your choice (1-4): ');
      const userChoice = Number(choiceInput.trim());

      if (!Number.isInteger(userChoice)) {
        output.write('Invalid choice, please select 1-4.\n');
        continue;
      }

      if (userChoice === 1) {
        await operations('TOTAL ', rl);
      } else if (userChoice === 2) {
        await operations('CREDIT', rl);
      } else if (userChoice === 3) {
        await operations('DEBIT ', rl);
      } else if (userChoice === 4) {
        continueFlag = 'NO';
      } else {
        output.write('Invalid choice, please select 1-4.\n');
      }
    }

    output.write('Exiting the program. Goodbye!\n');
  } finally {
    rl.close();
  }
}

// Only run mainProgram if this is not being imported as a module for tests
if (require.main === module) {
  mainProgram().catch((error) => {
    console.error('Unexpected error:', error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  formatMoney,
  parseAmountToCents,
  dataProgram,
  operations,
  mainProgram,
  resetBalance,
  getBalance,
  setBalance,
  INITIAL_BALANCE_CENTS,
  MAX_BALANCE_CENTS,
};
