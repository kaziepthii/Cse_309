# Personal Finance Tracker - Functional Requirements

## Functional Requirements Table

| FR ID | Description | Priority | Business Justification | Related User Story |
|-------|-------------|----------|------------------------|-------------------|
| FR-001 | System shall allow user registration with username and password. | High | Enables user onboarding and secure access | US-001 |
| FR-002 | System shall enforce unique username constraint during account creation. | High | Prevents duplicate user accounts | US-001 |
| FR-003 | System shall enforce password policy (minimum 4 characters). | High | Reduces account compromise risk | US-001 |
| FR-004 | System shall authenticate users with username and password. | High | Enables secure session-based access | US-002 |
| FR-005 | System shall redirect authenticated users to dashboard upon login. | High | Provides immediate access to features | US-005 |
| FR-006 | System shall allow user logout. | High | Prevents session misuse after sign-out | US-004 |
| FR-007 | System shall restrict access to protected API endpoints using user_id validation. | High | Enforces data isolation between users | US-007 |
| FR-008 | System shall allow authenticated users to add income transactions. | High | Core feature for tracking earnings | US-008 |
| FR-009 | System shall allow authenticated users to add expense transactions. | High | Core feature for tracking spending | US-009 |
| FR-010 | System shall allow authenticated users to view all their transactions. | High | Provides complete transaction history | US-010 |
| FR-011 | System shall allow authenticated users to edit existing transactions. | High | Enables correction of mistakes | US-011 |
| FR-012 | System shall allow authenticated users to delete transactions. | High | Removes unwanted or duplicate entries | US-012 |
| FR-013 | System shall calculate total income from all income transactions. | High | Provides financial summary | US-013 |
| FR-014 | System shall calculate total expense from all expense transactions. | High | Provides financial summary | US-014 |
| FR-015 | System shall calculate balance as Total Income - Total Expense. | High | Shows current financial health | US-015 |
| FR-016 | System shall display positive balance in green color. | Medium | Provides visual financial health indicator | US-016 |
| FR-017 | System shall display negative balance in red color. | Medium | Provides visual financial health indicator | US-016 |
| FR-018 | System shall allow authenticated users to search transactions by description. | Medium | Enables quick transaction lookup | US-017 |
| FR-019 | System shall filter transactions in real-time as user types. | Medium | Provides immediate search feedback | US-018 |
| FR-020 | System shall display "No transaction found" message when search yields no results. | Low | Provides clear feedback to user | US-019 |
| FR-021 | System shall display current date automatically when adding transaction. | Low | Reduces user input effort | US-020 |

---

## Requirement Notes

- FR IDs are baseline-controlled and referenced consistently across use cases, API design, and test cases.
- All High priority FRs constitute the MVP scope.
- FR-001 through FR-007 are authentication-related.
- FR-008 through FR-012 are transaction management (CRUD operations).
- FR-013 through FR-017 are summary calculation features.
- FR-018 through FR-020 are search features.

---

## SMART Quality Check for Functional Requirements

| SMART Element | Functional Requirement Quality Rule |
|---------------|--------------------------------------|
| **Specific** | Each FR states a clear system behavior with an explicit actor, action, and outcome. |
| **Measurable** | Each FR is testable through acceptance criteria. |
| **Achievable** | FR scope aligns with the approved tech stack and timeline. |
| **Relevant** | Each FR links to at least one user story and a business justification. |
| **Timely** | FR execution is phase-prioritized. |

---

## MoSCoW Mapping for Functional Requirements

| MoSCoW Category | Priority Mapping | FR Coverage |
|-----------------|------------------|-------------|
| **Must Have** | High | FR-001 to FR-015 |
| **Should Have** | Medium | FR-016 to FR-019 |
| **Could Have** | Low | FR-020 to FR-021 |
| **Won't Have** | Not in FR baseline | Advanced analytics, CSV export, budget tracking (future) |

---

## Traceability Matrix

| FR ID | User Story | Acceptance Criteria | Status |
|-------|------------|---------------------|--------|
| FR-001 | US-001 | AC-001 | ✅ Implemented |
| FR-002 | US-001 | AC-002 | ✅ Implemented |
| FR-003 | US-001 | AC-003 | ✅ Implemented |
| FR-004 | US-002 | AC-004 | ✅ Implemented |
| FR-005 | US-005 | AC-005 | ✅ Implemented |
| FR-006 | US-004 | AC-006 | ✅ Implemented |
| FR-007 | US-007 | AC-007 | ✅ Implemented |
| FR-008 | US-008 | AC-008 | ✅ Implemented |
| FR-009 | US-009 | AC-009 | ✅ Implemented |
| FR-010 | US-010 | AC-010 | ✅ Implemented |
| FR-011 | US-011 | AC-011 | ✅ Implemented |
| FR-012 | US-012 | AC-012 | ✅ Implemented |
| FR-013 | US-013 | AC-013 | ✅ Implemented |
| FR-014 | US-014 | AC-014 | ✅ Implemented |
| FR-015 | US-015 | AC-015 | ✅ Implemented |
| FR-016 | US-016 | AC-016 | ✅ Implemented |
| FR-017 | US-016 | AC-017 | ✅ Implemented |
| FR-018 | US-017 | AC-018 | ✅ Implemented |
| FR-019 | US-018 | AC-019 | ✅ Implemented |