# School Accounting System - COBOL Documentation

## Overview

This school accounting system is a COBOL-based application designed to manage student account balances. The system allows administrators to view account balances, record credits (payments/refunds), and process debits (charges). The application follows a modular architecture with clear separation of concerns.

---

## COBOL File Structure

### 1. **main.cob** - Program Controller & Menu Interface

#### Purpose
`main.cob` serves as the primary entry point and user interface controller for the accounting system. It is responsible for:
- Displaying an interactive menu to the user
- Capturing user input for navigation
- Routing user requests to the appropriate operations module
- Managing the program flow and session lifecycle

#### Key Functions
- **Menu Display**: Presents a user-friendly interface with numbered options
- **Input Handling**: Accepts user choices (1-4) for various account operations
- **Request Routing**: Calls the `Operations` module with appropriate parameters based on user selection
- **Session Management**: Maintains a loop that continues until the user chooses to exit

#### Program Flow
1. Display the main menu with four options
2. Accept user input (choice 1-4)
3. Route the selection to the appropriate operation:
   - Option 1: View account balance
   - Option 2: Credit the account
   - Option 3: Debit the account
   - Option 4: Exit the program
4. Repeat until the user selects exit
5. Display exit message and terminate

#### Business Rules
- Only accepts numeric input values 1-4
- Provides user-friendly error messages for invalid selections
- Maintains session continuity through a loop mechanism

---

### 2. **data.cob** - Data Management & Persistence Layer

#### Purpose
`data.cob` is the data persistence module responsible for managing the student account balance storage and retrieval. It acts as a database interface for the accounting system, ensuring data consistency and controlled access to account information.

#### Key Functions
- **READ Operation**: Retrieves the current account balance from storage
- **WRITE Operation**: Updates the account balance with new values
- **Balance Storage**: Maintains the current account balance with precision to cents
- **Data Validation**: Accepts and processes balance updates from business logic operations

#### Data Structure
- **STORAGE-BALANCE**: A numeric field storing the account balance
  - Format: `PIC 9(6)V99` (6 digits with 2 decimal places)
  - Initial Value: $1,000.00
  - Maximum Value: $999,999.99
  - Represents: Total account balance including cents

#### Program Interface
The module operates through a linkage section that accepts:
- **PASSED-OPERATION**: Type of operation (READ or WRITE)
- **BALANCE**: The balance value to read or write

#### Business Rules
- Initial account balance for new students: $1,000.00
- Balance precision: Two decimal places (cents)
- Maximum account balance: $999,999.99
- READ operations do not modify stored data
- WRITE operations update the persisted balance value

#### Data Persistence
Currently uses in-memory storage (`STORAGE-BALANCE`). This would typically be enhanced to interface with:
- Database systems (DB2, MySQL, etc.)
- File-based storage systems
- Account management databases

---

### 3. **operations.cob** - Business Logic & Transaction Processing

#### Purpose
`operations.cob` implements the core business logic for student account transactions. It processes account inquiries and transactions, managing credits and debits while enforcing business rules and data integrity.

#### Key Functions

##### A. **TOTAL Operation** - Balance Inquiry
- Retrieves the current account balance
- Displays the balance to the user
- Does not modify account data

##### B. **CREDIT Operation** - Account Credit (Add Funds)
- Prompts the user to enter the credit amount
- Retrieves the current balance
- Adds the credit amount to the balance
- Persists the updated balance
- Displays the new balance to the user
- **Use Cases**: Student payments, refunds, scholarships, financial aid deposits

##### C. **DEBIT Operation** - Account Debit (Charge)
- Prompts the user to enter the debit amount
- Retrieves the current balance
- Validates sufficient funds before processing
- Only processes the debit if funds are available
- Persists the updated balance
- Displays the new balance or insufficient funds message
- **Use Cases**: Tuition charges, fees, book purchases, on-campus purchases

#### Transaction Processing Logic

```
CREDIT Transaction Flow:
1. Accept credit amount from user
2. Retrieve current balance (READ)
3. Add amount to balance
4. Write updated balance to storage (WRITE)
5. Display confirmation with new balance

DEBIT Transaction Flow:
1. Accept debit amount from user
2. Retrieve current balance (READ)
3. Check if balance >= debit amount
4. If sufficient funds:
   - Subtract amount from balance
   - Write updated balance to storage (WRITE)
   - Display confirmation with new balance
5. If insufficient funds:
   - Reject transaction
   - Display error message
   - Balance remains unchanged
```

#### Key Fields
- **OPERATION-TYPE**: Determines which transaction type to execute (TOTAL, CREDIT, DEBIT)
- **AMOUNT**: Transaction amount entered by user (format: up to $999,999.99)
- **FINAL-BALANCE**: Current or updated account balance

#### Business Rules

1. **Credit Rule**: Any positive amount can be credited to the account without limits
2. **Debit Rule**: A debit transaction is only allowed if the current balance is greater than or equal to the debit amount
3. **Precision Rule**: All amounts are maintained to two decimal places (cents)
4. **Atomicity Rule**: Balance updates are performed as atomic operations through the DataProgram module
5. **Overdraft Prevention**: The system prevents negative balances by rejecting debits that would exceed available funds
6. **Audit Trail**: Each transaction (when implemented in future versions) should record:
   - Transaction type (CREDIT/DEBIT)
   - Amount
   - Timestamp
   - Previous and new balance
   - Student/account identifier

---

## System Architecture

```
┌─────────────────────────────────────┐
│        main.cob (Controller)        │
│     Menu Interface & Routing        │
└──────────────────┬──────────────────┘
                   │
                   ├─→ 'TOTAL '
                   ├─→ 'CREDIT'
                   └─→ 'DEBIT '
                   │
┌──────────────────▼──────────────────┐
│    operations.cob (Business Logic)  │
│  Transaction Processing & Validation│
└──────────────────┬──────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
   'READ' (View) (Credit) (Debit)
        │          │          │
└──────────────────▼──────────────────┐
│     data.cob (Data Layer)           │
│   Storage & Persistence Management  │
└─────────────────────────────────────┘
```

---

## Business Rules Summary

### Account Management Rules
1. **Minimum Balance**: No minimum balance requirement (system prevents negative balances)
2. **Maximum Balance**: $999,999.99 per account
3. **Precision**: All amounts rounded and stored to 2 decimal places
4. **Initial Balance**: New accounts start with $1,000.00

### Transaction Rules
1. **Credits**: Unlimited amounts can be added to an account
2. **Debits**: Only allowed if sufficient funds are available
3. **Validation**: All transactions are validated before execution
4. **Atomicity**: Each transaction is atomic (all-or-nothing)

### Operational Rules
1. **Menu-Driven**: User interacts through a simple numbered menu
2. **Error Handling**: Invalid inputs are rejected with user-friendly messages
3. **Session Management**: Program continues until user explicitly exits
4. **Feedback**: Each operation provides confirmation or error messages

---

## Future Enhancements

### Recommended Modernization Priorities
1. **Database Integration**: Replace in-memory storage with persistent database
2. **Authentication**: Add user authentication and authorization
3. **Audit Logging**: Implement comprehensive transaction logging
4. **Reporting**: Add account history and reconciliation reports
5. **Error Handling**: Enhanced exception handling and recovery
6. **Validation**: Input validation for amounts (prevent negative, non-numeric entries)
7. **Multi-Account**: Support multiple student accounts
8. **API Layer**: Expose functionality through REST/SOAP interfaces
9. **Batch Processing**: Support batch credit/debit operations
10. **Interest Calculation**: For future loan/payment plan features

---

## Technical Specifications

### Data Types
- **Balance**: `PIC 9(6)V99` (Numeric, 6 digits with 2 decimals)
- **Operation Type**: `PIC X(6)` (Character, 6 bytes)
- **Amount**: `PIC 9(6)V99` (Numeric, 6 digits with 2 decimals)
- **User Choice**: `PIC 9` (Single digit numeric)

### Linkage & Dependencies
- `main.cob` calls `operations.cob` module
- `operations.cob` calls `data.cob` module
- Bidirectional data flow through linkage sections

### Error Conditions
1. **Insufficient Funds**: Debit rejected with error message
2. **Invalid Menu Choice**: Error message displayed, menu repeats
3. **Invalid Amount Input**: Handled by ACCEPT statement validation

---

## Conclusion

The school accounting system demonstrates a well-structured COBOL application with clear separation between user interface (main), business logic (operations), and data management (data) layers. This modular design makes it suitable for maintenance and future enhancements, particularly in modernization efforts to integrate with contemporary database systems and web interfaces.
