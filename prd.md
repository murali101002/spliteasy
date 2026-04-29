# SplitEasy - Product Requirements Document

## 1. Project Overview & Goals

### 1.1 Product Vision
SplitEasy is a web-based expense splitting application designed to simplify shared expenses among groups of people. Whether splitting dinner bills, managing household expenses, or tracking costs during a group trip, SplitEasy provides a clean, intuitive interface for tracking who owes what.

### 1.2 Goals
- **Simplicity**: Minimal, focused feature set that does one thing well
- **Mobile-first**: Optimized for on-the-go expense tracking
- **Debt simplification**: Automatically minimize the number of payments needed to settle up
- **Transparency**: Clear visibility into all expenses and balances

### 1.3 Target Users
- Friend groups splitting recurring expenses
- Roommates sharing household costs
- Travel groups managing trip expenses
- Couples tracking shared spending

### 1.4 Success Metrics
- User registration completion rate > 80%
- Average time to add expense < 30 seconds
- User retention at 30 days > 40%

---

## 2. User Stories

### Authentication
- As a new user, I want to register with my email and password so I can start tracking expenses
- As a registered user, I want to log in securely to access my groups and expenses
- As a user who forgot my password, I want to reset it via email link
- As a logged-in user, I want to update my profile name and picture

### Groups
- As a user, I want to create a new group with a name so I can start tracking shared expenses
- As a group member, I want to generate an invite link to share with friends
- As a user with an invite link, I want to join a group easily
- As a group member, I want to see all members and their current balances
- As a settled member (zero balance), I want to leave a group I no longer need

### Expenses
- As a group member, I want to add an expense with a description, amount, and who paid
- As a group member, I want to split an expense equally among selected members
- As a group member, I want to specify exact amounts each person owes for an expense
- As a group member, I want to see all expenses in my group
- As a group member, I want to edit an expense I created
- As a group member, I want to delete (soft delete) an expense, showing it as strikethrough

### Settlements
- As a user, I want to see suggested payments to settle all debts optimally
- As a user, I want to record a payment I made to another member
- As a user, I want to see my overall balance across all groups

### Dashboard
- As a user, I want to see an overview of my total balance (owed/owing)
- As a user, I want quick access to add an expense
- As a user, I want to see recent activity across my groups

---

## 3. Core Features

### 3.1 Authentication & User Management

#### Registration
- Email and password required
- Password requirements: minimum 8 characters, at least one number
- Email verification not required (simplicity)
- Automatic login after registration

#### Login
- Email + password authentication
- JWT tokens with 7-day expiry
- Refresh token rotation
- Rate limiting: 5 failed attempts triggers 15-minute lockout

#### Password Reset
- User requests reset via email
- System sends email with secure, time-limited link (1 hour expiry)
- User sets new password via link

#### Profile
- Editable fields: name, profile picture (URL)
- Email is read-only after registration
- Profile picture: URL input (external hosting)

### 3.2 Group Management

#### Create Group
- Required: Group name (max 50 characters)
- Creator automatically becomes a member
- Group created with unique 8-character invite code

#### Invite Link
- Format: `{domain}/join/{inviteCode}`
- Invite codes are permanent (don't expire)
- Any member can view/share the invite link
- Regenerate link option (invalidates old link)

#### Group Membership
- Maximum 50 members per group
- All members have equal permissions
- Members can only leave if their balance is $0.00
- No admin roles or special permissions

#### Group Views
- Member list with current balances
- Expense list (chronological, newest first)
- Settle up suggestions

### 3.3 Expense Management

#### Add Expense
- Required fields:
  - Description (max 100 characters)
  - Amount (USD, 2 decimal places)
  - Paid by (single member)
  - Split between (one or more members)
  - Split type (equal or exact amounts)

#### Split Types
1. **Equal Split**: Total divided equally among selected members
   - Handles non-even splits with consistent rounding
   - Rounding difference applied to payer if they're included
2. **Exact Amounts**: Specify precise amount for each participant
   - Amounts must sum to total expense amount

#### Edit Expense
- All fields editable by any group member
- No edit history tracking
- Updates recalculate all affected balances

#### Delete Expense
- Soft delete: expense marked as deleted
- Displayed with strikethrough styling
- Deleted expenses excluded from balance calculations
- No undelete functionality

### 3.4 Balance Calculation

#### Per-Group Balance
- Each member has a balance per group
- Positive balance = owed money
- Negative balance = owes money
- Calculated from all non-deleted expenses and settlements

#### Overall Balance
- Sum of all group balances for a user
- Displayed on dashboard

### 3.5 Debt Simplification

#### Algorithm
When A owes B $10 and B owes C $10:
- Instead of: A→B ($10), B→C ($10)
- Simplified: A→C ($10), B has zero balance

#### Settle Up Suggestions
- System calculates optimal payment paths
- Minimizes total number of transactions
- Displays as actionable suggestions: "Pay $X to [Member]"

### 3.6 Settlement Recording

#### Record Payment
- Select recipient from group members
- Enter amount (USD)
- Creates settlement record
- Updates both parties' balances
- Note: Manual record only, no payment integration

---

## 4. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(uuid())
  email          String    @unique
  passwordHash   String
  name           String
  profilePicture String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Password reset
  resetToken       String?   @unique
  resetTokenExpiry DateTime?

  // Relations
  memberships    GroupMember[]
  paidExpenses   Expense[]     @relation("PaidBy")
  expenseShares  ExpenseShare[]
  paymentsMade   Settlement[]  @relation("PaymentFrom")
  paymentsReceived Settlement[] @relation("PaymentTo")
}

model Group {
  id         String   @id @default(uuid())
  name       String
  inviteCode String   @unique
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  members    GroupMember[]
  expenses   Expense[]
  settlements Settlement[]
}

model GroupMember {
  id        String   @id @default(uuid())
  userId    String
  groupId   String
  joinedAt  DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([userId, groupId])
}

model Expense {
  id          String   @id @default(uuid())
  groupId     String
  paidById    String
  description String
  amount      Decimal  @db.Decimal(10, 2)
  splitType   SplitType
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  group   Group  @relation(fields: [groupId], references: [id], onDelete: Cascade)
  paidBy  User   @relation("PaidBy", fields: [paidById], references: [id])
  shares  ExpenseShare[]
}

model ExpenseShare {
  id        String  @id @default(uuid())
  expenseId String
  userId    String
  amount    Decimal @db.Decimal(10, 2)

  expense Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])

  @@unique([expenseId, userId])
}

model Settlement {
  id        String   @id @default(uuid())
  groupId   String
  fromUserId String
  toUserId   String
  amount    Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())

  group    Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  fromUser User  @relation("PaymentFrom", fields: [fromUserId], references: [id])
  toUser   User  @relation("PaymentTo", fields: [toUserId], references: [id])
}

enum SplitType {
  EQUAL
  EXACT
}
```

### Database Indexes (add via migration)
```sql
CREATE INDEX idx_expense_group ON "Expense"("groupId");
CREATE INDEX idx_expense_paid_by ON "Expense"("paidById");
CREATE INDEX idx_expense_share_user ON "ExpenseShare"("userId");
CREATE INDEX idx_settlement_group ON "Settlement"("groupId");
CREATE INDEX idx_group_member_user ON "GroupMember"("userId");
```

---

## 5. API Endpoints

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://api.spliteasy.app/api`

### Authentication Headers
All protected routes require:
```
Authorization: Bearer <jwt_token>
```

### Rate Limiting
- General: 100 requests per minute per IP
- Auth endpoints: 10 requests per minute per IP

---

### 5.1 Authentication Endpoints

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": null
  },
  "token": "jwt_token"
}
```

**Errors:**
- 400: Invalid input / Password too weak
- 409: Email already registered

---

#### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": "https://example.com/pic.jpg"
  },
  "token": "jwt_token"
}
```

**Errors:**
- 401: Invalid credentials
- 429: Too many attempts

---

#### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists, a reset link has been sent"
}
```

---

#### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newsecurepass123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Errors:**
- 400: Invalid or expired token

---

### 5.2 User Endpoints

#### GET /users/me
Get current user profile.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "profilePicture": "https://example.com/pic.jpg"
}
```

---

#### PATCH /users/me
Update current user profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "profilePicture": "https://example.com/newpic.jpg"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Updated",
  "profilePicture": "https://example.com/newpic.jpg"
}
```

---

#### GET /users/me/balance
Get overall balance across all groups.

**Response (200):**
```json
{
  "totalBalance": 45.50,
  "groupBalances": [
    {
      "groupId": "uuid",
      "groupName": "Roommates",
      "balance": 30.00
    },
    {
      "groupId": "uuid",
      "groupName": "Trip to NYC",
      "balance": 15.50
    }
  ]
}
```

---

### 5.3 Group Endpoints

#### POST /groups
Create a new group.

**Request Body:**
```json
{
  "name": "Roommates"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Roommates",
  "inviteCode": "abc12345",
  "inviteLink": "https://spliteasy.app/join/abc12345",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

#### GET /groups
Get all groups for current user.

**Response (200):**
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "Roommates",
      "memberCount": 4,
      "myBalance": 25.50,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### GET /groups/:id
Get group details.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Roommates",
  "inviteCode": "abc12345",
  "inviteLink": "https://spliteasy.app/join/abc12345",
  "members": [
    {
      "id": "uuid",
      "name": "John Doe",
      "profilePicture": "https://...",
      "balance": 25.50
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Errors:**
- 403: Not a member
- 404: Group not found

---

#### POST /groups/:id/regenerate-invite
Generate new invite code (invalidates old one).

**Response (200):**
```json
{
  "inviteCode": "xyz98765",
  "inviteLink": "https://spliteasy.app/join/xyz98765"
}
```

---

#### POST /groups/join/:inviteCode
Join a group via invite code.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Roommates",
  "memberCount": 5
}
```

**Errors:**
- 400: Already a member
- 400: Group is full (50 members)
- 404: Invalid invite code

---

#### DELETE /groups/:id/leave
Leave a group.

**Response (200):**
```json
{
  "message": "Successfully left group"
}
```

**Errors:**
- 400: Cannot leave with non-zero balance
- 403: Not a member

---

### 5.4 Expense Endpoints

#### POST /groups/:groupId/expenses
Add expense to group.

**Request Body (Equal Split):**
```json
{
  "description": "Dinner at restaurant",
  "amount": 120.00,
  "paidById": "uuid",
  "splitType": "EQUAL",
  "splitWith": ["uuid1", "uuid2", "uuid3"]
}
```

**Request Body (Exact Split):**
```json
{
  "description": "Groceries",
  "amount": 85.50,
  "paidById": "uuid",
  "splitType": "EXACT",
  "shares": [
    { "userId": "uuid1", "amount": 30.00 },
    { "userId": "uuid2", "amount": 25.50 },
    { "userId": "uuid3", "amount": 30.00 }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "description": "Dinner at restaurant",
  "amount": 120.00,
  "paidBy": {
    "id": "uuid",
    "name": "John Doe"
  },
  "splitType": "EQUAL",
  "shares": [
    { "userId": "uuid1", "name": "John", "amount": 40.00 },
    { "userId": "uuid2", "name": "Jane", "amount": 40.00 },
    { "userId": "uuid3", "name": "Bob", "amount": 40.00 }
  ],
  "createdAt": "2024-01-15T12:00:00Z"
}
```

**Errors:**
- 400: Invalid amounts / Shares don't sum to total
- 403: Not a group member

---

#### GET /groups/:groupId/expenses
Get all expenses for a group.

**Query Parameters:**
- `includeDeleted`: boolean (default: true)
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response (200):**
```json
{
  "expenses": [
    {
      "id": "uuid",
      "description": "Dinner at restaurant",
      "amount": 120.00,
      "paidBy": {
        "id": "uuid",
        "name": "John Doe"
      },
      "splitType": "EQUAL",
      "shares": [...],
      "isDeleted": false,
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

---

#### PATCH /groups/:groupId/expenses/:expenseId
Update an expense.

**Request Body:**
```json
{
  "description": "Updated description",
  "amount": 130.00,
  "splitType": "EQUAL",
  "splitWith": ["uuid1", "uuid2"]
}
```

**Response (200):** Updated expense object

**Errors:**
- 400: Cannot edit deleted expense
- 403: Not a group member
- 404: Expense not found

---

#### DELETE /groups/:groupId/expenses/:expenseId
Soft delete an expense.

**Response (200):**
```json
{
  "message": "Expense deleted"
}
```

---

### 5.5 Settlement Endpoints

#### GET /groups/:groupId/settle-suggestions
Get optimal payment suggestions.

**Response (200):**
```json
{
  "suggestions": [
    {
      "from": {
        "id": "uuid",
        "name": "Jane Doe"
      },
      "to": {
        "id": "uuid",
        "name": "John Doe"
      },
      "amount": 45.50
    }
  ]
}
```

---

#### POST /groups/:groupId/settlements
Record a settlement payment.

**Request Body:**
```json
{
  "toUserId": "uuid",
  "amount": 45.50
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "from": {
    "id": "uuid",
    "name": "Jane Doe"
  },
  "to": {
    "id": "uuid",
    "name": "John Doe"
  },
  "amount": 45.50,
  "createdAt": "2024-01-15T14:00:00Z"
}
```

---

#### GET /groups/:groupId/settlements
Get all settlements for a group.

**Response (200):**
```json
{
  "settlements": [
    {
      "id": "uuid",
      "from": { "id": "uuid", "name": "Jane" },
      "to": { "id": "uuid", "name": "John" },
      "amount": 45.50,
      "createdAt": "2024-01-15T14:00:00Z"
    }
  ]
}
```

---

## 6. UI Screens & Components

### 6.1 Screen Map

```
/ (Landing Page - unauthenticated)
├── /login
├── /register
├── /forgot-password
├── /reset-password/:token
├── /join/:inviteCode (redirects after join)
│
└── /dashboard (authenticated)
    ├── /groups
    │   ├── /groups/new
    │   └── /groups/:id
    │       ├── /groups/:id/expenses
    │       ├── /groups/:id/balances
    │       └── /groups/:id/settle
    └── /profile
```

### 6.2 Screen Specifications

#### Landing Page (/)
- Hero section with app tagline
- Feature highlights
- CTA buttons: Login / Get Started
- Mobile: Full-screen hero with prominent CTAs

#### Login (/login)
- Email input
- Password input with show/hide toggle
- "Forgot password?" link
- Login button
- "Don't have an account? Register" link
- Error display for failed attempts

#### Register (/register)
- Name input
- Email input
- Password input with strength indicator
- Confirm password input
- Register button
- "Already have an account? Login" link

#### Forgot Password (/forgot-password)
- Email input
- Submit button
- Success message display
- Back to login link

#### Reset Password (/reset-password/:token)
- New password input
- Confirm password input
- Submit button
- Redirect to login on success

#### Dashboard (/dashboard)
**Layout:**
- Top: Overall balance card (positive green, negative red)
- Middle: Quick action buttons (Add Expense, Create Group)
- Bottom: Recent activity feed (last 10 items across all groups)
- Navigation: Bottom nav on mobile (Dashboard, Groups, Profile)

**Components:**
- BalanceCard: Displays total owed/owing
- QuickActions: Icon buttons for common actions
- ActivityFeed: List of recent expenses/settlements

#### Groups List (/groups)
- List of group cards
- Each card shows: name, member count, user's balance
- "Create Group" floating action button (FAB)
- Empty state for no groups

#### Create Group (/groups/new)
- Group name input
- Create button
- Cancel/back navigation

#### Group Detail (/groups/:id)
**Tabs/Sections:**
1. Expenses (default)
2. Balances
3. Settle Up

**Header:**
- Group name
- Member avatars (stacked, +N for overflow)
- Invite link button (copy to clipboard)
- Settings menu (leave group, regenerate invite)

**Expenses Tab:**
- Add Expense FAB
- Expense list (newest first)
- Each expense shows: description, amount, paid by, date
- Deleted expenses: strikethrough, greyed out
- Tap expense to view details/edit

**Balances Tab:**
- List of all members with their balances
- Color coding: green (owed), red (owes), grey (settled)

**Settle Tab:**
- Suggested payments list
- "Record Payment" button for each suggestion
- Or manual "Record Payment" option

#### Add/Edit Expense (Modal/Drawer)
**Fields:**
- Description (text input)
- Amount (number input with $ prefix)
- Paid by (member dropdown)
- Split type toggle (Equal / Exact)
- If Equal: member checkboxes
- If Exact: member list with amount inputs
- Save/Cancel buttons

**Validation:**
- Amount > 0
- At least one person selected
- Exact amounts sum to total

#### Profile (/profile)
- Profile picture (clickable to change URL)
- Name (editable)
- Email (read-only)
- Save Changes button
- Logout button

### 6.3 Shared Components

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Drawer.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Spinner.tsx
│   └── Toast.tsx
├── layout/
│   ├── AppLayout.tsx
│   ├── AuthLayout.tsx
│   ├── BottomNav.tsx
│   └── Header.tsx
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── PasswordResetForm.tsx
│   ├── groups/
│   │   ├── GroupCard.tsx
│   │   ├── GroupList.tsx
│   │   ├── MemberList.tsx
│   │   └── InviteLink.tsx
│   ├── expenses/
│   │   ├── ExpenseCard.tsx
│   │   ├── ExpenseList.tsx
│   │   ├── ExpenseForm.tsx
│   │   └── SplitSelector.tsx
│   ├── settlements/
│   │   ├── SettleSuggestions.tsx
│   │   ├── RecordPaymentForm.tsx
│   │   └── SettlementList.tsx
│   └── dashboard/
│       ├── BalanceCard.tsx
│       ├── QuickActions.tsx
│       └── ActivityFeed.tsx
└── common/
    ├── ErrorBoundary.tsx
    ├── LoadingScreen.tsx
    └── EmptyState.tsx
```

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React + TypeScript + Vite                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │ React Query │  │   Context   │  │  React Router   │   │  │
│  │  │  (Server)   │  │   (Auth)    │  │   (Navigation)  │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Node.js)                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Express + TypeScript                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │    Routes   │  │ Middleware  │  │    Services     │   │  │
│  │  │  /api/*     │  │ Auth, Rate  │  │  Business Logic │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  │                          │                                 │  │
│  │                   ┌──────┴──────┐                         │  │
│  │                   │   Prisma    │                         │  │
│  │                   │     ORM     │                         │  │
│  │                   └─────────────┘                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL Protocol
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Users  │ │ Groups  │ │Expenses │ │  Shares  │ │Settlements│ │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Frontend Architecture

#### State Management Strategy
- **React Query**: All server state (groups, expenses, user data)
- **Context API**: Auth state only (current user, token)
- **No Redux**: Keeping it simple

#### Key Patterns
```typescript
// API Client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// React Query Hooks
export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then(res => res.data),
  });
};

export const useCreateExpense = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseDto) =>
      api.post(`/groups/${groupId}/expenses`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
};
```

#### Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}
```

### 7.3 Backend Architecture

#### Layered Architecture
```
routes/          → HTTP handling, validation
├── auth.ts
├── users.ts
├── groups.ts
├── expenses.ts
└── settlements.ts

middleware/      → Cross-cutting concerns
├── auth.ts      → JWT verification
├── rateLimiter.ts
├── errorHandler.ts
└── validation.ts

services/        → Business logic
├── authService.ts
├── groupService.ts
├── expenseService.ts
├── settlementService.ts
└── balanceService.ts

utils/           → Shared utilities
├── jwt.ts
├── password.ts
├── inviteCode.ts
└── debtSimplifier.ts
```

#### Debt Simplification Algorithm
```typescript
// Greedy algorithm for optimal settlements
function simplifyDebts(balances: Map<string, number>): Settlement[] {
  const settlements: Settlement[] = [];
  const creditors: [string, number][] = [];
  const debtors: [string, number][] = [];

  // Separate into creditors and debtors
  balances.forEach((balance, oderId) => {
    if (balance > 0) creditors.push([userId, balance]);
    else if (balance < 0) debtors.push([userId, -balance]);
  });

  // Sort both arrays (largest first)
  creditors.sort((a, b) => b[1] - a[1]);
  debtors.sort((a, b) => b[1] - a[1]);

  // Match debtors to creditors
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i][1], creditors[j][1]);
    settlements.push({
      from: debtors[i][0],
      to: creditors[j][0],
      amount: round(amount, 2),
    });

    debtors[i][1] -= amount;
    creditors[j][1] -= amount;

    if (debtors[i][1] === 0) i++;
    if (creditors[j][1] === 0) j++;
  }

  return settlements;
}
```

---

## 8. Project Structure

### 8.1 Monorepo Structure

```
spliteasy/
├── packages/
│   ├── frontend/           # React application
│   │   ├── src/
│   │   │   ├── api/        # API client & hooks
│   │   │   ├── components/ # UI components
│   │   │   ├── contexts/   # React contexts
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── pages/      # Route pages
│   │   │   ├── types/      # TypeScript types
│   │   │   ├── utils/      # Utilities
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── backend/            # Express application
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── types/
│       │   └── index.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── package.json
│       └── tsconfig.json
│
├── .github/
│   └── workflows/
│       ├── frontend.yml
│       └── backend.yml
│
├── package.json            # Workspace root
├── pnpm-workspace.yaml
└── README.md
```

### 8.2 Frontend Detailed Structure

```
frontend/src/
├── api/
│   ├── client.ts           # Axios instance
│   ├── auth.ts             # Auth API calls
│   ├── groups.ts           # Group API calls
│   ├── expenses.ts         # Expense API calls
│   └── settlements.ts      # Settlement API calls
│
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # Layout components
│   ├── features/           # Feature-specific components
│   └── common/             # Shared components
│
├── contexts/
│   └── AuthContext.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useGroups.ts
│   ├── useExpenses.ts
│   └── useToast.ts
│
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   ├── Dashboard.tsx
│   ├── Groups.tsx
│   ├── GroupDetail.tsx
│   ├── CreateGroup.tsx
│   ├── JoinGroup.tsx
│   └── Profile.tsx
│
├── types/
│   ├── user.ts
│   ├── group.ts
│   ├── expense.ts
│   └── settlement.ts
│
├── utils/
│   ├── format.ts           # Currency, date formatting
│   ├── validation.ts       # Form validation
│   └── constants.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

### 8.3 Backend Detailed Structure

```
backend/src/
├── routes/
│   ├── index.ts            # Route aggregator
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── group.routes.ts
│   ├── expense.routes.ts
│   └── settlement.routes.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── rateLimiter.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
│
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── group.service.ts
│   ├── expense.service.ts
│   ├── settlement.service.ts
│   ├── balance.service.ts
│   └── email.service.ts
│
├── utils/
│   ├── jwt.ts
│   ├── password.ts
│   ├── inviteCode.ts
│   ├── debtSimplifier.ts
│   └── validation.ts
│
├── types/
│   ├── express.d.ts        # Express type extensions
│   └── api.ts              # API types
│
├── config/
│   └── index.ts            # Environment config
│
└── index.ts                # Entry point
```

---

## 9. Development Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Basic infrastructure and authentication

#### Backend Tasks
- [ ] Initialize Express + TypeScript project
- [ ] Set up Prisma with PostgreSQL
- [ ] Create database schema and initial migration
- [ ] Implement User model and auth routes
- [ ] JWT authentication middleware
- [ ] Password hashing with bcrypt
- [ ] Rate limiting middleware
- [ ] Password reset flow with email

#### Frontend Tasks
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Set up React Router
- [ ] Create auth context
- [ ] Build login/register pages
- [ ] Build forgot/reset password pages
- [ ] API client setup with Axios
- [ ] Toast notification system

#### DevOps
- [ ] GitHub repo setup
- [ ] Basic CI pipeline (lint, type-check)
- [ ] Environment variable management

### Phase 2: Groups (Week 3)
**Goal**: Full group functionality

#### Backend Tasks
- [ ] Group CRUD routes
- [ ] Invite code generation
- [ ] Join group via invite code
- [ ] Leave group (with balance check)
- [ ] Group member management
- [ ] Group-level balance calculation

#### Frontend Tasks
- [ ] Groups list page
- [ ] Create group page
- [ ] Group detail page (tabs structure)
- [ ] Invite link sharing (copy to clipboard)
- [ ] Member list component
- [ ] Join group flow

### Phase 3: Expenses (Week 4-5)
**Goal**: Complete expense management

#### Backend Tasks
- [ ] Expense CRUD routes
- [ ] Equal split calculation
- [ ] Exact split validation
- [ ] Soft delete implementation
- [ ] Balance recalculation on changes

#### Frontend Tasks
- [ ] Add expense modal/drawer
- [ ] Split type selector
- [ ] Equal split member selection
- [ ] Exact split amount inputs
- [ ] Expense list view
- [ ] Expense detail/edit view
- [ ] Deleted expense styling

### Phase 4: Settlements (Week 6)
**Goal**: Debt simplification and settlements

#### Backend Tasks
- [ ] Debt simplification algorithm
- [ ] Settle suggestions endpoint
- [ ] Record settlement route
- [ ] Settlement history

#### Frontend Tasks
- [ ] Settle up tab UI
- [ ] Suggested payments list
- [ ] Record payment form
- [ ] Settlement history view

### Phase 5: Dashboard & Polish (Week 7)
**Goal**: Dashboard and UX refinement

#### Backend Tasks
- [ ] Overall balance endpoint
- [ ] Recent activity aggregation
- [ ] Performance optimization

#### Frontend Tasks
- [ ] Dashboard page
- [ ] Balance card component
- [ ] Quick actions
- [ ] Activity feed
- [ ] Profile page
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

### Phase 6: Testing & Deployment (Week 8)
**Goal**: Production readiness

#### Testing
- [ ] Backend unit tests (Jest)
- [ ] Backend integration tests
- [ ] Frontend component tests
- [ ] E2E critical paths (optional)

#### Deployment
- [ ] Vercel frontend deployment
- [ ] Railway backend + DB deployment
- [ ] Domain configuration
- [ ] SSL setup
- [ ] Production environment variables
- [ ] Monitoring setup

---

## 10. Testing Strategy

### 10.1 Testing Stack
- **Framework**: Jest
- **Backend**: Supertest for HTTP testing
- **Frontend**: React Testing Library
- **Coverage Target**: 70% minimum

### 10.2 Backend Testing

#### Unit Tests
Location: `backend/src/__tests__/unit/`

```typescript
// Example: debtSimplifier.test.ts
describe('debtSimplifier', () => {
  it('should simplify A→B→C to A→C', () => {
    const balances = new Map([
      ['A', -10],  // A owes 10
      ['B', 0],    // B is settled
      ['C', 10],   // C is owed 10
    ]);

    const result = simplifyDebts(balances);

    expect(result).toEqual([
      { from: 'A', to: 'C', amount: 10 }
    ]);
  });

  it('should handle multiple creditors and debtors', () => {
    // Test complex scenarios
  });
});
```

#### Integration Tests
Location: `backend/src/__tests__/integration/`

```typescript
// Example: auth.integration.test.ts
describe('Auth Routes', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should create user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should reject duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'dup@test.com', password: 'pass123', name: 'User' });

      // Duplicate attempt
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'dup@test.com', password: 'pass123', name: 'User2' });

      expect(res.status).toBe(409);
    });
  });
});
```

### 10.3 Frontend Testing

#### Component Tests
Location: `frontend/src/__tests__/`

```typescript
// Example: ExpenseForm.test.tsx
describe('ExpenseForm', () => {
  it('should validate amount is positive', async () => {
    render(<ExpenseForm groupId="123" members={mockMembers} />);

    const amountInput = screen.getByLabelText(/amount/i);
    await userEvent.type(amountInput, '-10');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(submitButton);

    expect(screen.getByText(/amount must be positive/i)).toBeInTheDocument();
  });

  it('should calculate equal split correctly', async () => {
    render(<ExpenseForm groupId="123" members={mockMembers} />);

    await userEvent.type(screen.getByLabelText(/amount/i), '100');

    // Select 4 members
    const memberCheckboxes = screen.getAllByRole('checkbox');
    for (const cb of memberCheckboxes.slice(0, 4)) {
      await userEvent.click(cb);
    }

    // Each should show $25.00
    expect(screen.getAllByText('$25.00')).toHaveLength(4);
  });
});
```

### 10.4 Test Commands

```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

---

## 11. Deployment Guide

### 11.1 Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/spliteasy"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://spliteasy.app"

# Email (for password reset)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@spliteasy.app"
SMTP_PASS="smtp-password"
FROM_EMAIL="noreply@spliteasy.app"
```

#### Frontend (.env)
```env
VITE_API_URL="https://api.spliteasy.app/api"
```

### 11.2 Railway Deployment (Backend + Database)

#### Database Setup
1. Create new project in Railway
2. Add PostgreSQL plugin
3. Copy connection string to `DATABASE_URL`

#### Backend Deployment
1. Connect GitHub repository
2. Set root directory to `packages/backend`
3. Configure build command: `npm run build`
4. Configure start command: `npm run start`
5. Add environment variables
6. Deploy

#### Railway Configuration (railway.toml)
```toml
[build]
builder = "nixpacks"
buildCommand = "npm run build && npx prisma migrate deploy"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### 11.3 Vercel Deployment (Frontend)

#### Setup
1. Import project from GitHub
2. Set root directory to `packages/frontend`
3. Framework preset: Vite
4. Add environment variables

#### Vercel Configuration (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 11.4 GitHub Actions CI/CD

#### Backend Workflow (.github/workflows/backend.yml)
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'packages/backend/**'
  pull_request:
    branches: [main]
    paths:
      - 'packages/backend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: spliteasy_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: packages/backend
        run: npm ci

      - name: Run Prisma migrations
        working-directory: packages/backend
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/spliteasy_test
        run: npx prisma migrate deploy

      - name: Run tests
        working-directory: packages/backend
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/spliteasy_test
          JWT_SECRET: test-secret-key-for-testing-only
        run: npm test -- --coverage

      - name: Type check
        working-directory: packages/backend
        run: npm run type-check

      - name: Lint
        working-directory: packages/backend
        run: npm run lint
```

#### Frontend Workflow (.github/workflows/frontend.yml)
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'packages/frontend/**'
  pull_request:
    branches: [main]
    paths:
      - 'packages/frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: packages/frontend
        run: npm ci

      - name: Run tests
        working-directory: packages/frontend
        run: npm test -- --coverage

      - name: Type check
        working-directory: packages/frontend
        run: npm run type-check

      - name: Lint
        working-directory: packages/frontend
        run: npm run lint

      - name: Build
        working-directory: packages/frontend
        env:
          VITE_API_URL: https://api.spliteasy.app/api
        run: npm run build
```

### 11.5 Production Checklist

#### Security
- [ ] JWT secret is strong (32+ chars)
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection headers

#### Performance
- [ ] Database indexes created
- [ ] Gzip compression enabled
- [ ] Static assets cached
- [ ] API response caching where appropriate

#### Monitoring
- [ ] Error tracking (Sentry or similar)
- [ ] Uptime monitoring
- [ ] Database backup schedule

#### Pre-launch
- [ ] Test all user flows end-to-end
- [ ] Mobile responsiveness verified
- [ ] Password reset emails working
- [ ] Invite links working
- [ ] Balance calculations correct

---

## Appendix A: API Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

## Appendix B: Currency Formatting

All monetary values:
- Stored as `Decimal(10,2)` in database
- API returns as number (float)
- Frontend displays with `$` prefix and 2 decimal places
- Rounding: Standard banker's rounding (round half to even)

## Appendix C: Security Considerations

### Password Requirements
- Minimum 8 characters
- At least 1 number
- Stored as bcrypt hash (cost factor 12)

### JWT Tokens
- Algorithm: HS256
- Expiry: 7 days
- Stored in localStorage (acceptable for this app scope)
- Refresh: Re-login required after expiry

### Rate Limiting
- General API: 100 requests/minute/IP
- Auth endpoints: 10 requests/minute/IP
- Failed login lockout: 5 attempts → 15 minute lock
