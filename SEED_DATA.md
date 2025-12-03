# 🌱 V2K Seed Data - Documentation

**Last Updated:** 2025-12-03  
**Database:** PostgreSQL (Railway)  
**Status:** ✅ Populated

---

## 📊 Database Summary

| Entity | Count | Status |
|--------|-------|--------|
| **Users** | 64 | ✅ |
| - E2E Test Users | 3 | ✅ |
| - Admin | 1 | ✅ |
| - Artists | 10 | ✅ |
| - Investors | 50 | ✅ |
| **Tracks** | 30 | ✅ LIVE |
| **Transactions** | 200 | ✅ COMPLETED |
| **Portfolio Holdings** | 184 | ✅ |
| **Comments** | 50 | ✅ |
| **Notifications** | 20 | ✅ |
| **Favorites** | ~100 | ✅ |

---

## 🔐 Test Credentials

### E2E Testing (Automated Tests)

**Purpose:** For Playwright E2E automated tests

```
Investor User:
  Email: investor@v2k.e2e
  Password: Test123!@#
  Role: USER
  Balance: R$ 10,000
  KYC: VERIFIED

Artist User:
  Email: artist@v2k.e2e
  Password: Test123!@#
  Role: USER
  Username: @test_artist
  KYC: VERIFIED

Admin User:
  Email: admin@v2k.e2e
  Password: Test123!@#
  Role: ADMIN
  KYC: VERIFIED
```

### Manual Testing

**Purpose:** For manual exploration and testing

```
Admin:
  Email: admin@v2k.music
  Password: password123
  
Sample Artist:
  Email: mc.kevinho@artist.com
  Password: password123
  
Sample Investor:
  Email: investor1@test.com (or investor2, investor3, ... investor50)
  Password: password123
```

---

## 🎵 Sample Tracks

All tracks have status `LIVE` and belong to various artists:

| Title | Genre | Artist | Price | Status |
|-------|-------|--------|-------|--------|
| Modo Turbo | FUNK | MC Kevinho | ~R$0.01-0.05 | LIVE |
| Rave de Favela | POP | MC Lan | ~R$0.01-0.05 | LIVE |
| Beat Envolvente | RAP | DJ GBR | ~R$0.01-0.05 | LIVE |
| ... | ... | ... | ... | LIVE |

**Note:** Prices are randomized between R$ 0.01 - 0.05 per token

---

## 🔄 How to Reset Database

### Method 1: Re-run Seed (Recommended)

```bash
cd D:\v2k-music\v2k-app
npx prisma db seed
```

This will:
1. Clear all existing data
2. Recreate all seed data
3. Reset sequences/IDs

### Method 2: Manual Reset (Prisma Studio)

```bash
npx prisma studio
```

Then manually delete records from tables.

### Method 3: Database Reset (Nuclear Option)

```bash
npx prisma db push --force-reset
npx prisma db seed
```

⚠️ **Warning:** This will DROP and RECREATE all tables!

---

## 📈 Data Relationships

### User → Tracks (Artist)
- 10 artists created
- Each artist has ~3 tracks
- Total: 30 tracks in marketplace

### User → Portfolio (Investor)
- 50 investors created
- Random investments in tracks
- Total: 184 portfolio holdings

### Transactions
- 200 BUY transactions
- All status: COMPLETED
- Payment methods: PIX, CREDIT_CARD, BALANCE

---

## 🧪 E2E Test Scenarios

### Scenario 1: Investor Flow
```
1. Login as investor@v2k.e2e
2. Browse marketplace (30 tracks available)
3. View track details
4. Attempt to invest (user has R$ 10k balance)
5. Check portfolio (should show holdings)
```

### Scenario 2: Artist Flow
```
1. Login as artist@v2k.e2e
2. View dashboard
3. Upload new track
4. Track goes to PENDING → AI Review → APPROVED
```

### Scenario 3: Admin Flow
```
1. Login as admin@v2k.e2e
2. View admin panel
3. See all users (64)
4. See all tracks (30)
5. Moderate content
```

---

## 🐛 Known Issues

### E2E Tests Still Failing

**Current Status:** 1/15 E2E tests passing (6.7%)

**Root Cause:** NextAuth authentication not redirecting properly after login/signup

**Symptoms:**
- Login form submits successfully
- NextAuth processes credentials
- No redirect to `/marketplace` or `/dashboard`
- Tests timeout waiting for URL change

**Not Data Related:** Database has all required users and data

**Next Steps:**
1. Debug NextAuth callback flow
2. Check signin/signup API routes
3. Verify redirect URLs in NextAuth config
4. Test authentication manually in browser

---

## 📝 Seed Script Location

**File:** `prisma/seed.ts`

**Key Functions:**
- `cleanDatabase()` - Clears all data
- `createUsers()` - Creates 64 users (including 3 E2E)
- `createTracks()` - Creates 30 LIVE tracks
- `createTransactions()` - Creates 200 transactions
- `createPortfolioHoldings()` - Aggregates holdings
- `createComments()` - Adds 50 comments
- `createNotifications()` - Adds notifications

**Configuration:** `package.json` → `prisma.seed`

---

## 🚀 Quick Start

After cloning/resetting database:

```bash
# 1. Push schema
npx prisma db push

# 2. Run seed
npx prisma db seed

# 3. Verify data
npx prisma studio

# 4. Run E2E tests
npx playwright test
```

---

## 💡 Tips

1. **Always seed after schema changes** - Run `npx prisma db seed` after migrations
2. **E2E password is different** - `Test123!@#` (not `password123`)
3. **All E2E emails end with `.e2e`** - Easy to identify test users
4. **Investor has balance** - R$ 10,000 ready for investments
5. **Tracks are LIVE** - Not PENDING, immediately tradeable

---

**Created:** 2025-12-03  
**Author:** V2K Development Team  
**Sprint:** 85 - Database Seeding & E2E Completion
