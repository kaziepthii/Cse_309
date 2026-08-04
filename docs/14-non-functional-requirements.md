# Personal Finance Tracker - Non-Functional Requirements

## Non-Functional Requirements Table

| NFR ID | Category | Requirement (Measurable Target) | Related FR |
|--------|----------|--------------------------------|------------|
| NFR-001 | Performance | P95 API response time for all read endpoints (transactions list, summary) shall be <= 500 ms under normal load. | FR-010, FR-013 |
| NFR-002 | Performance | P95 API response time for all write endpoints (add, edit, delete transactions) shall be <= 700 ms under normal load. | FR-008, FR-009, FR-011 |
| NFR-003 | Performance | Dashboard page initial load shall complete within <= 2 seconds on a standard broadband connection. | All FRs |
| NFR-004 | Availability | Monthly service availability shall be >= 99.5% during the academic project lifecycle. | All FRs |
| NFR-005 | Availability | Planned maintenance windows shall not exceed 2 hours per week during development. | All FRs |
| NFR-006 | Reliability | All database writes shall be acknowledged before returning a success response to the client. | FR-008, FR-009, FR-011 |
| NFR-007 | Security | All API endpoints except registration and login shall require valid user authentication. | FR-004..FR-008 |
| NFR-008 | Security | User passwords shall be hashed or stored securely; no plaintext password shall be stored or logged. | FR-001, FR-003 |
| NFR-009 | Security | User data shall be isolated at the query layer — a user shall never see another user's transactions. | FR-010 |
| NFR-010 | Usability | A new user shall be able to complete registration, login, and add a transaction within <= 3 minutes in usability testing. | FR-001, FR-008 |
| NFR-011 | Usability | All forms shall display validation errors within 500 ms of submission failure. | FR-001, FR-008 |
| NFR-012 | Usability | All UI components shall be responsive and usable on screens >= 375 px wide (mobile-first). | All FRs |
| NFR-013 | Maintainability | Frontend code shall be clean and well-organized with proper component structure. | All FRs |
| NFR-014 | Maintainability | Backend code shall have clear separation of concerns (API, database, business logic). | All FRs |
| NFR-015 | Maintainability | All API endpoints shall be documented in the SRS. | All FRs |
| NFR-016 | Maintainability | All environment-specific configuration shall be stored in environment variables, not hardcoded. | All FRs |
| NFR-017 | Portability | The application shall run consistently in a local development environment using a documented setup procedure. | All FRs |
| NFR-018 | Portability | The database schema shall be managed through code; no manual schema changes. | All FRs |
| NFR-019 | Observability | The application shall log request method, path, status code, and response time for all API calls. | All FRs |

---

## NFR Verification Approach

| Category | Verification Method |
|----------|---------------------|
| **Performance** | Manual load testing with realistic data volumes; Chrome DevTools network monitoring |
| **Availability** | Uptime monitoring during development; documented downtime incidents |
| **Reliability** | Database rollback tests; error handling verification |
| **Security** | Manual auth bypass testing; role isolation testing |
| **Usability** | Peer usability walkthrough; mobile responsiveness check in Chrome DevTools |
| **Maintainability** | Code review for clean separation; API doc completeness review |
| **Portability** | Fresh-environment setup test from README |
| **Observability** | Log output review during development and testing |

---

## NFR Summary by Priority

| Priority | NFR IDs | Description |
|----------|---------|-------------|
| **High** | NFR-001, NFR-002, NFR-003 | Performance: Fast API response and page load |
| **High** | NFR-007, NFR-008, NFR-009 | Security: Authentication and data isolation |
| **High** | NFR-010, NFR-011, NFR-012 | Usability: Easy to use, responsive |
| **Medium** | NFR-004, NFR-005, NFR-006 | Availability and Reliability |
| **Medium** | NFR-013, NFR-014, NFR-015 | Maintainability |
| **Low** | NFR-016, NFR-017, NFR-018, NFR-019 | Portability and Observability |