# Web-based Financial & Growth Management System for Artisans

## Overview

This project is a web-based financial and growth management system tailored for artisans. It helps artisans track earnings, manage expenses, and receive data-driven recommendations to improve financial health and grow their small businesses.

## Key Users

- Artisans (primary users)
- Administrators (optional, for support and analytics)

## 3.3.1 Functional Requirements

Below are the core features and actions the system will support once implemented.

1. User Registration and Authentication
- The system shall allow artisans to create user accounts.
- The system shall enable users to securely log in and log out.
- Password recovery functionality shall be provided.

2. Earnings Management
- Users shall be able to add records of their earnings with details such as date, amount, and source.
- Users shall be able to view a summary of their earnings over selectable time periods.

3. Expense Management
- Users shall be able to record expenses with details including date, amount, and purpose.
- The system shall allow users to view expense summaries and history.

4. Financial Dashboard and Reporting
- The system shall provide an overview dashboard showing total earnings, expenses, and net savings.
- Users shall be able to generate reports (daily, weekly, monthly) summarizing their financial activities.

5. Financial Growth Recommendations
- Based on user data, the system shall provide tailored recommendations to improve financial management and savings.
- Recommendations shall be updated dynamically as new data is entered.

6. User Profile Management
- Users shall be able to update their personal information and preferences.

## Suggested Database Tables

- users: id, name, email, password_hash, created_at, updated_at
- earnings: id, user_id, date, amount, source, notes, created_at
- expenses: id, user_id, date, amount, purpose, notes, created_at
- recommendations: id, user_id, recommendation_text, generated_at, source_data_snapshot

## Acceptance Criteria

- Users can register, login, logout, and recover passwords.
- Users can create, view, edit, and delete earnings and expense records.
- The dashboard reflects accurate aggregated totals and time-range filtering.
- Recommendations change as new earnings/expenses are recorded.

## Next Steps

- Design UI wireframes for key flows (registration, dashboard, add record, reports).
- Choose tech stack for backend and database (e.g., Next.js + Supabase or PostgreSQL).
- Implement authentication and database migrations.
- Build API routes and frontend pages.

## Notes

- Keep user data privacy in mind; never log or expose passwords.
- Consider currency and localization support for artisans in different regions.
