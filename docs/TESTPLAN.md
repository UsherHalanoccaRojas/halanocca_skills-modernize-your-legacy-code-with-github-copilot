# Account Management System - Test Plan

**System:** Account Management System (COBOL)  
**Purpose:** Validate account operations including balance viewing, credit transactions, and debit transactions  
**Initial Balance:** $1,000.00  

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Display main menu successfully | System initialized | 1. Run the main program | Menu displays with all 4 options: 1. View Balance, 2. Credit Account, 3. Debit Account, 4. Exit | | | |
| TC-002 | Handle invalid menu choice - number out of range | Main menu displayed | 1. Enter choice "5"<br>2. Verify error message<br>3. Menu redisplays | Error message "Invalid choice, please select 1-4." displays and menu reappears for re-entry | | | |
| TC-003 | Handle invalid menu choice - non-numeric input | Main menu displayed | 1. Enter choice "A"<br>2. Verify system behavior | System should handle gracefully, either reject input or convert to 0 | | | |
| TC-004 | View balance - read initial balance | System initialized, no transactions performed | 1. Select option "1" (View Balance)<br>2. Observe displayed balance | Balance displays as "1000.00" (or "1000" depending on display format) | | | |
| TC-005 | Credit account - valid amount | Balance is 1000.00 | 1. Select option "2" (Credit Account)<br>2. Enter amount "100.00"<br>3. Verify new balance displayed | New balance displays as "1100.00" and confirmation message shown | | | |
| TC-006 | Credit account - zero amount | Balance is 1000.00 | 1. Select option "2" (Credit Account)<br>2. Enter amount "0.00"<br>3. Verify balance after operation | Balance remains "1000.00" | | | |
| TC-007 | Credit account - large amount | Balance is 1000.00 | 1. Select option "2" (Credit Account)<br>2. Enter amount "999999.99" (max allowed)<br>3. Verify new balance | New balance displays as "1000999.99" | | | |
| TC-008 | Credit account - fractional cents | Balance is 1000.00 | 1. Select option "2" (Credit Account)<br>2. Enter amount "50.35"<br>3. Verify new balance with proper decimal handling | New balance displays as "1050.35" | | | |
| TC-009 | Debit account - valid amount (sufficient funds) | Balance is 1000.00 | 1. Select option "3" (Debit Account)<br>2. Enter amount "200.00"<br>3. Verify new balance displayed | New balance displays as "800.00" and debit confirmation shown | | | |
| TC-010 | Debit account - exact balance amount | Balance is 1000.00 | 1. Select option "3" (Debit Account)<br>2. Enter amount "1000.00"<br>3. Verify operation result | Balance becomes "0.00", debit succeeds | | | |
| TC-011 | Debit account - insufficient funds | Balance is 1000.00 | 1. Select option "3" (Debit Account)<br>2. Enter amount "1500.00"<br>3. Verify error handling | Error message "Insufficient funds for this debit." displays, balance remains "1000.00" | | | |
| TC-012 | Debit account - zero amount | Balance is 1000.00 | 1. Select option "3" (Debit Account)<br>2. Enter amount "0.00"<br>3. Verify balance after operation | Balance remains "1000.00" | | | |
| TC-013 | Debit account - fractional cents (sufficient) | Balance is 1000.00 | 1. Select option "3" (Debit Account)<br>2. Enter amount "75.50"<br>3. Verify new balance | New balance displays as "924.50" with proper decimal handling | | | |
| TC-014 | Debit account - amount greater than balance | Balance is 500.00 | 1. Select option "3" (Debit Account)<br>2. Enter amount "501.00"<br>3. Verify insufficient funds message | Error message "Insufficient funds for this debit." displays, balance remains "500.00" | | | |
| TC-015 | Sequential credit transactions | Balance is 1000.00 | 1. Credit account with 100.00 (new balance: 1100.00)<br>2. Credit account with 200.00 (new balance: 1300.00)<br>3. View balance | Final balance displays as "1300.00", each transaction updates correctly | | | |
| TC-016 | Sequential debit transactions | Balance is 1000.00 | 1. Debit account with 100.00 (new balance: 900.00)<br>2. Debit account with 200.00 (new balance: 700.00)<br>3. View balance | Final balance displays as "700.00", each transaction updates correctly | | | |
| TC-017 | Mixed credit and debit transactions | Balance is 1000.00 | 1. Credit account with 500.00 (new balance: 1500.00)<br>2. Debit account with 300.00 (new balance: 1200.00)<br>3. View balance | Final balance displays as "1200.00" | | | |
| TC-018 | Exit program successfully | Program running, any menu state | 1. Select option "4" (Exit)<br>2. Verify program terminates | Message "Exiting the program. Goodbye!" displays and program exits cleanly | | | |
| TC-019 | Balance persistence after credit transaction | Balance is 1000.00 | 1. Credit account with 100.00<br>2. Verify balance is updated in persistent storage<br>3. Re-read balance to confirm persistence | New balance is 1100.00 and persists across operations (integration with DataProgram) | | | |
| TC-020 | Balance persistence after debit transaction | Balance is 1000.00 | 1. Debit account with 100.00<br>2. Verify balance is updated in persistent storage<br>3. Re-read balance to confirm persistence | New balance is 900.00 and persists across operations (integration with DataProgram) | | | |
| TC-021 | Data consistency - READ operation | Balance in storage is 1000.00 | 1. Call DataProgram with READ operation<br>2. Verify returned balance matches storage value | DataProgram returns balance of 1000.00 | | | |
| TC-022 | Data consistency - WRITE operation | Initial balance is 1000.00 | 1. Call DataProgram with WRITE operation and new balance 1500.00<br>2. Call READ operation<br>3. Verify returned balance | DataProgram correctly updates storage and returns 1500.00 on subsequent read | | | |
| TC-023 | Data consistency - multiple WRITE operations | Storage balance is 1000.00 | 1. WRITE 1500.00 to storage<br>2. WRITE 800.00 to storage<br>3. READ from storage | Final stored balance is 800.00 (last write value) | | | |
| TC-024 | Menu loop continues after valid transaction | Main menu displayed, no errors | 1. Perform credit transaction (valid)<br>2. Verify main menu redisplays<br>3. Perform another operation | Main menu continuously displays after each transaction, allowing multiple operations | | | |
| TC-025 | Menu loop continues after invalid input | Main menu displayed | 1. Enter invalid choice "9"<br>2. Verify error message and menu redisplay<br>3. Enter valid choice "1" | Error message displays, menu reappears, valid choice is processed correctly | | | |
| TC-026 | Debit operation - boundary test (balance = amount) | Balance is 500.00 | 1. Debit account with exactly 500.00 | Operation succeeds, balance becomes 0.00 | | | |
| TC-027 | Debit operation - boundary test (amount < balance by 1 cent) | Balance is 500.00 | 1. Debit account with 499.99 | Operation succeeds, balance becomes 0.01 | | | |
| TC-028 | Debit operation - boundary test (amount > balance by 1 cent) | Balance is 500.00 | 1. Debit account with 500.01 | Operation fails with insufficient funds message, balance remains 500.00 | | | |
| TC-029 | Credit operation - maximum amount test | Balance is 1000.00 | 1. Credit account with maximum allowed amount (999999.99)<br>2. Verify system can handle large numbers | Balance updates to 1000999.99 without overflow or rounding errors | | | |
| TC-030 | Operations program receives correct operation type | Main program passes operation to Operations program | 1. Select View Balance, Credit, or Debit<br>2. Verify correct operation type passed (TOTAL, CREDIT, DEBIT) | Operations program processes correct operation type based on user selection | | | |

## Test Summary

| Category | Count | Notes |
|---|---|---|
| Menu & Navigation Tests | 5 | TC-001, TC-002, TC-003, TC-024, TC-025 |
| View Balance Tests | 1 | TC-004 |
| Credit Operation Tests | 5 | TC-005, TC-006, TC-007, TC-008, TC-029 |
| Debit Operation Tests | 10 | TC-009, TC-010, TC-011, TC-012, TC-013, TC-014, TC-026, TC-027, TC-028, TC-031 |
| Sequential/Mixed Transaction Tests | 3 | TC-015, TC-016, TC-017 |
| Exit Tests | 1 | TC-018 |
| Data Persistence Tests | 4 | TC-019, TC-020, TC-021, TC-022 |
| Data Consistency Tests | 1 | TC-023 |
| Program Integration Tests | 1 | TC-030 |
| **Total Test Cases** | **30** | Comprehensive coverage of all business logic |

## Key Business Logic Covered

### 1. Menu Navigation
- Valid menu choice handling (options 1-4)
- Invalid menu choice handling
- Menu loop continuation

### 2. View Balance (Operation: TOTAL)
- Display current account balance from persistent storage

### 3. Credit Account (Operation: CREDIT)
- Accept credit amount from user
- Read current balance
- Add amount to balance
- Write updated balance to storage
- Display new balance

### 4. Debit Account (Operation: DEBIT)
- Accept debit amount from user
- Read current balance
- Validate sufficient funds (balance >= amount)
- If sufficient: subtract amount and write to storage
- If insufficient: display error and maintain balance

### 5. Data Management
- Balance initialization (default: $1,000.00)
- Read operation (retrieve balance from persistent storage)
- Write operation (update balance in persistent storage)
- Data persistence across transactions

## Notes for Implementation

- Tests should verify both happy path and error scenarios
- All monetary amounts use 2 decimal places (cents)
- Maximum balance field capacity: 999,999.99
- Initial balance: 1,000.00
- Test execution should validate both display output and data state changes
- Integration tests should verify inter-program communication (Main → Operations → DataProgram)

