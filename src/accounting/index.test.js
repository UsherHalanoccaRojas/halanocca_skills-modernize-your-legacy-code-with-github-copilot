const {
  formatMoney,
  parseAmountToCents,
  dataProgram,
  operations,
  resetBalance,
  getBalance,
  setBalance,
  INITIAL_BALANCE_CENTS,
  MAX_BALANCE_CENTS,
} = require('./index');

// Mock readline for testing operations
jest.mock('node:readline/promises', () => {
  return {
    createInterface: jest.fn(() => ({
      question: jest.fn(),
      close: jest.fn(),
    })),
  };
});

const readline = require('node:readline/promises');
let mockOutput = '';

// Mock stdout.write to capture output
const originalStdoutWrite = process.stdout.write;
beforeEach(() => {
  mockOutput = '';
  process.stdout.write = jest.fn((str) => {
    mockOutput += str;
    return true;
  });
  resetBalance();
});

afterEach(() => {
  process.stdout.write = originalStdoutWrite;
});

describe('Account Management System Tests', () => {
  // ===== Helper Function Tests =====
  describe('Helper Functions', () => {
    describe('formatMoney()', () => {
      test('TC-004: Should format cents to money format (1000.00)', () => {
        expect(formatMoney(100000)).toBe('1000.00');
      });

      test('Should format money with proper decimal places', () => {
        expect(formatMoney(50)).toBe('0.50');
        expect(formatMoney(150)).toBe('1.50');
        expect(formatMoney(0)).toBe('0.00');
      });

      test('TC-008: Should handle fractional cents correctly', () => {
        expect(formatMoney(5035)).toBe('50.35');
      });

      test('TC-007: Should handle large amounts', () => {
        expect(formatMoney(99999999)).toBe('999999.99');
      });
    });

    describe('parseAmountToCents()', () => {
      test('Should parse valid whole amounts', () => {
        expect(parseAmountToCents('100')).toBe(10000);
        expect(parseAmountToCents('1000')).toBe(100000);
      });

      test('TC-008: Should parse amounts with decimals', () => {
        expect(parseAmountToCents('50.35')).toBe(5035);
        expect(parseAmountToCents('100.00')).toBe(10000);
      });

      test('TC-006: Should handle zero amount', () => {
        expect(parseAmountToCents('0.00')).toBe(0);
      });

      test('TC-007: Should parse maximum allowed amount', () => {
        expect(parseAmountToCents('999999.99')).toBe(99999999);
      });

      test('TC-003: Should handle non-numeric input gracefully', () => {
        expect(parseAmountToCents('A')).toBeNull();
        expect(parseAmountToCents('abc')).toBeNull();
      });

      test('Should reject invalid formats', () => {
        expect(parseAmountToCents('100.000')).toBeNull(); // too many decimals
        expect(parseAmountToCents('-100')).toBeNull(); // negative
        expect(parseAmountToCents('100.5.5')).toBeNull(); // multiple dots
      });

      test('Should trim whitespace', () => {
        expect(parseAmountToCents('  100.00  ')).toBe(10000);
      });
    });
  });

  // ===== Data Program Tests =====
  describe('Data Program (Storage Operations)', () => {
    test('TC-004: Should initialize with correct balance', () => {
      resetBalance();
      const balance = dataProgram('READ');
      expect(balance).toBe(INITIAL_BALANCE_CENTS); // $1000.00
    });

    test('TC-021: Data consistency - READ operation returns stored value', () => {
      resetBalance();
      const balance = dataProgram('READ');
      expect(formatMoney(balance)).toBe('1000.00');
    });

    test('TC-022: Data consistency - WRITE operation updates storage', () => {
      resetBalance();
      const newBalance = 150000; // $1500.00
      dataProgram('WRITE', newBalance);
      const readBack = dataProgram('READ');
      expect(readBack).toBe(150000);
    });

    test('TC-023: Multiple WRITE operations - last write wins', () => {
      resetBalance();
      dataProgram('WRITE', 150000); // $1500.00
      dataProgram('WRITE', 80000); // $800.00
      const finalBalance = dataProgram('READ');
      expect(finalBalance).toBe(80000);
    });

    test('Should throw error for unsupported operation', () => {
      expect(() => dataProgram('INVALID')).toThrow('Unsupported data operation: INVALID');
    });
  });

  // ===== Balance Management Tests =====
  describe('Balance Management Functions', () => {
    test('Should reset balance to initial value', () => {
      setBalance(50000);
      resetBalance();
      expect(getBalance()).toBe(INITIAL_BALANCE_CENTS);
    });

    test('Should set and get balance', () => {
      setBalance(250000);
      expect(getBalance()).toBe(250000);
    });
  });

  // ===== View Balance Operation Tests =====
  describe('Operations - TOTAL (View Balance)', () => {
    test('TC-004: View balance - display initial balance', async () => {
      resetBalance();
      const rl = { question: jest.fn(), close: jest.fn() };
      
      await operations('TOTAL ', rl);
      
      expect(mockOutput).toContain('Current balance: 1000.00');
    });

    test('Should display updated balance after transactions', async () => {
      setBalance(150000); // $1500.00
      const rl = { question: jest.fn(), close: jest.fn() };
      
      await operations('TOTAL ', rl);
      
      expect(mockOutput).toContain('Current balance: 1500.00');
    });

    test('Should display zero balance correctly', async () => {
      setBalance(0);
      const rl = { question: jest.fn(), close: jest.fn() };
      
      await operations('TOTAL ', rl);
      
      expect(mockOutput).toContain('Current balance: 0.00');
    });
  });

  // ===== Credit Operation Tests =====
  describe('Operations - CREDIT', () => {
    test('TC-005: Credit account - valid amount increases balance', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('100.00'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(110000); // $1100.00
      expect(mockOutput).toContain('Amount credited');
      expect(mockOutput).toContain('1100.00');
    });

    test('TC-006: Credit account - zero amount rejected', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('0.00'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(INITIAL_BALANCE_CENTS); // Balance unchanged
      expect(mockOutput).toContain('Invalid amount');
    });

    test('TC-007: Credit account - large amount', async () => {
      setBalance(0); // Start with zero balance to allow large credit
      const rl = {
        question: jest.fn().mockResolvedValue('999999.99'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(99999999); // $999,999.99 (max allowed)
      expect(mockOutput).toContain('Amount credited');
    });

    test('TC-008: Credit account - fractional cents', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('50.35'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(105035); // $1050.35
      expect(mockOutput).toContain('1050.35');
    });

    test('Should reject invalid amount input', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('abc'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(INITIAL_BALANCE_CENTS); // Balance unchanged
      expect(mockOutput).toContain('Invalid amount');
    });

    test('Should reject negative amounts', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('-100'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(INITIAL_BALANCE_CENTS); // Balance unchanged
      expect(mockOutput).toContain('Invalid amount');
    });

    test('TC-029: Credit operation - maximum amount test prevents overflow', async () => {
      resetBalance();
      // Set balance very close to max to test overflow prevention
      setBalance(99949999); // Set to a very high balance close to max
      
      const rl = {
        question: jest.fn().mockResolvedValue('100000.00'), // Try to add a large amount
        close: jest.fn(),
      };

      await operations('CREDIT', rl);

      // Should be rejected because it would exceed max
      expect(mockOutput).toContain('Credit rejected');
      expect(mockOutput).toContain('Maximum balance');
    });

    test('TC-019: Balance persistence after credit transaction', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('100.00'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);
      
      // Verify the balance persists in storage
      const persistedBalance = dataProgram('READ');
      expect(persistedBalance).toBe(110000);
      
      // Simulate re-reading the balance
      let readOutput = '';
      process.stdout.write = jest.fn((str) => {
        readOutput += str;
        return true;
      });
      
      await operations('TOTAL ', rl);
      expect(readOutput).toContain('1100.00');
    });
  });

  // ===== Debit Operation Tests =====
  describe('Operations - DEBIT', () => {
    test('TC-009: Debit account - valid amount (sufficient funds)', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('200.00'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(80000); // $800.00
      expect(mockOutput).toContain('Amount debited');
      expect(mockOutput).toContain('800.00');
    });

    test('TC-010: Debit account - exact balance amount', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('1000.00'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(0); // $0.00
      expect(mockOutput).toContain('Amount debited');
      expect(mockOutput).toContain('0.00');
    });

    test('TC-011: Debit account - insufficient funds', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('1500.00'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(INITIAL_BALANCE_CENTS); // Balance unchanged
      expect(mockOutput).toContain('Insufficient funds');
    });

    test('TC-012: Debit account - zero amount rejected', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('0.00'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(INITIAL_BALANCE_CENTS); // Balance unchanged
      expect(mockOutput).toContain('Invalid amount');
    });

    test('TC-013: Debit account - fractional cents (sufficient)', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('75.50'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(92450); // $924.50
      expect(mockOutput).toContain('924.50');
    });

    test('TC-014: Debit account - amount greater than balance', async () => {
      setBalance(50000); // $500.00
      const rl = {
        question: jest.fn().mockResolvedValue('501.00'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(50000); // Balance unchanged
      expect(mockOutput).toContain('Insufficient funds');
    });

    test('TC-026: Debit operation - boundary test (balance = amount)', async () => {
      setBalance(50000); // $500.00
      const rl = {
        question: jest.fn().mockResolvedValue('500.00'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(0);
    });

    test('TC-027: Debit operation - boundary test (amount < balance by 1 cent)', async () => {
      setBalance(50000); // $500.00
      const rl = {
        question: jest.fn().mockResolvedValue('499.99'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(1); // $0.01
      expect(mockOutput).toContain('0.01');
    });

    test('TC-028: Debit operation - boundary test (amount > balance by 1 cent)', async () => {
      setBalance(50000); // $500.00
      const rl = {
        question: jest.fn().mockResolvedValue('500.01'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(50000); // Balance unchanged
      expect(mockOutput).toContain('Insufficient funds');
    });

    test('Should reject invalid amount input', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('xyz'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(INITIAL_BALANCE_CENTS); // Balance unchanged
      expect(mockOutput).toContain('Invalid amount');
    });

    test('Should reject negative amounts', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('-100'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);

      const newBalance = dataProgram('READ');
      expect(newBalance).toBe(INITIAL_BALANCE_CENTS); // Balance unchanged
      expect(mockOutput).toContain('Invalid amount');
    });

    test('TC-020: Balance persistence after debit transaction', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('100.00'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);
      
      // Verify the balance persists in storage
      const persistedBalance = dataProgram('READ');
      expect(persistedBalance).toBe(90000);
      
      // Simulate re-reading the balance
      let readOutput = '';
      process.stdout.write = jest.fn((str) => {
        readOutput += str;
        return true;
      });
      
      await operations('TOTAL ', rl);
      expect(readOutput).toContain('900.00');
    });
  });

  // ===== Sequential Transaction Tests =====
  describe('Sequential Transactions', () => {
    test('TC-015: Sequential credit transactions', async () => {
      resetBalance();
      const rl = { question: jest.fn(), close: jest.fn() };

      // First credit: 100.00
      rl.question.mockResolvedValueOnce('100.00');
      await operations('CREDIT', rl);
      expect(dataProgram('READ')).toBe(110000);

      // Second credit: 200.00
      rl.question.mockResolvedValueOnce('200.00');
      await operations('CREDIT', rl);
      expect(dataProgram('READ')).toBe(130000);

      // View balance
      mockOutput = '';
      await operations('TOTAL ', rl);
      expect(mockOutput).toContain('1300.00');
    });

    test('TC-016: Sequential debit transactions', async () => {
      resetBalance();
      const rl = { question: jest.fn(), close: jest.fn() };

      // First debit: 100.00
      rl.question.mockResolvedValueOnce('100.00');
      await operations('DEBIT ', rl);
      expect(dataProgram('READ')).toBe(90000);

      // Second debit: 200.00
      rl.question.mockResolvedValueOnce('200.00');
      await operations('DEBIT ', rl);
      expect(dataProgram('READ')).toBe(70000);

      // View balance
      mockOutput = '';
      await operations('TOTAL ', rl);
      expect(mockOutput).toContain('700.00');
    });

    test('TC-017: Mixed credit and debit transactions', async () => {
      resetBalance();
      const rl = { question: jest.fn(), close: jest.fn() };

      // Credit: 500.00
      rl.question.mockResolvedValueOnce('500.00');
      await operations('CREDIT', rl);
      expect(dataProgram('READ')).toBe(150000);

      // Debit: 300.00
      rl.question.mockResolvedValueOnce('300.00');
      await operations('DEBIT ', rl);
      expect(dataProgram('READ')).toBe(120000);

      // View balance
      mockOutput = '';
      await operations('TOTAL ', rl);
      expect(mockOutput).toContain('1200.00');
    });
  });

  // ===== Integration Tests =====
  describe('Program Integration', () => {
    test('TC-030: Operations program receives correct operation type for TOTAL', async () => {
      resetBalance();
      const rl = { question: jest.fn(), close: jest.fn() };

      // This test verifies that TOTAL operation is processed correctly
      await operations('TOTAL ', rl);
      expect(mockOutput).toContain('Current balance:');
    });

    test('TC-030: Operations program receives correct operation type for CREDIT', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('100.00'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);
      expect(mockOutput).toContain('Amount credited');
    });

    test('TC-030: Operations program receives correct operation type for DEBIT', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('100.00'),
        close: jest.fn(),
      };

      await operations('DEBIT ', rl);
      expect(mockOutput).toContain('Amount debited');
    });

    test('Should handle unsupported operation types gracefully', async () => {
      resetBalance();
      const rl = { question: jest.fn(), close: jest.fn() };

      await operations('UNKNOWN', rl);
      expect(mockOutput).toContain('Unsupported operation type');
    });
  });

  // ===== Edge Cases and Error Handling =====
  describe('Edge Cases and Error Handling', () => {
    test('Should handle amounts with extra decimal places', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('100.999'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);
      expect(mockOutput).toContain('Invalid amount');
      expect(dataProgram('READ')).toBe(INITIAL_BALANCE_CENTS);
    });

    test('Should handle whitespace in amounts', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('  100.00  '),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);
      expect(mockOutput).toContain('Amount credited');
      expect(dataProgram('READ')).toBe(110000);
    });

    test('Should handle empty input', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue(''),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);
      expect(mockOutput).toContain('Invalid amount');
      expect(dataProgram('READ')).toBe(INITIAL_BALANCE_CENTS);
    });

    test('Should handle very large valid amounts', async () => {
      resetBalance();
      const rl = {
        question: jest.fn().mockResolvedValue('999999.99'),
        close: jest.fn(),
      };

      await operations('CREDIT', rl);
      const newBalance = dataProgram('READ');
      expect(newBalance).toBeLessThanOrEqual(MAX_BALANCE_CENTS);
    });
  });

  // ===== Constants Test =====
  describe('Constants', () => {
    test('Should have correct initial balance', () => {
      expect(INITIAL_BALANCE_CENTS).toBe(100000); // $1000.00
    });

    test('Should have correct maximum balance', () => {
      expect(MAX_BALANCE_CENTS).toBe(99999999); // $999999.99
    });
  });
});
