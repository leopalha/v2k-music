# Database Migration Checklist - V2K Production

## Pre-Migration (Development → Production)

### 1. Database Preparation

- [ ] **Create Production Database**
  - Platform: Railway (recommended) or Supabase
  - Location: Choose closest to users (US East for BR/LATAM)
  - Instance size: Start with smallest (scale up as needed)

- [ ] **Get Connection String**
  ```
  postgresql://user:password@host:port/database?schema=public
  ```
  - Save to password manager
  - Add to Vercel environment variables

### 2. Schema Migration

- [ ] **Test Migration Locally First**
  ```bash
  cd /d/v2k-music/v2k-app
  
  # Set production DATABASE_URL temporarily
  export DATABASE_URL="postgresql://..."
  
  # Dry run
  npx prisma migrate deploy --preview-feature
  
  # If looks good, execute
  npx prisma migrate deploy
  ```

- [ ] **Verify Tables Created**
  ```bash
  # Connect to database
  npx prisma studio
  
  # Or use Railway CLI
  railway connect postgres
  \dt  # List tables
  ```

- [ ] **Expected Tables**
  - User
  - Track
  - Investment
  - Transaction
  - Portfolio
  - Favorite
  - Comment
  - RoyaltyPayment
  - UserRoyaltyPayment
  - PerformanceData
  - DailyStats

### 3. Indexes & Performance

- [ ] **Verify Indexes Created**
  ```sql
  SELECT 
    tablename, 
    indexname, 
    indexdef 
  FROM 
    pg_indexes 
  WHERE 
    schemaname = 'public'
  ORDER BY 
    tablename, indexname;
  ```

- [ ] **Critical Indexes**
  - User: email, walletAddress
  - Track: tokenId, genre, status
  - Investment: userId, songId
  - Transaction: userId, type, createdAt
  - Portfolio: userId, trackId

### 4. Seed Data (Optional)

- [ ] **Create Admin User**
  ```typescript
  // Run in Prisma Studio or seed script
  await prisma.user.create({
    data: {
      email: 'admin@v2k.music',
      hashedPassword: await bcrypt.hash('secure-password', 12),
      name: 'V2K Admin',
      kycStatus: 'VERIFIED',
      emailNotifications: true,
    },
  });
  ```

- [ ] **Test Tracks** (optional for MVP)
  ```typescript
  await prisma.track.createMany({
    data: [
      {
        title: 'Test Track 1',
        artistName: 'Test Artist',
        genre: 'TRAP',
        // ... other fields
      },
    ],
  });
  ```

## Post-Migration

### 5. Connection & Performance

- [ ] **Test Connection from Vercel**
  - Deploy a test API route
  - Hit endpoint: `/api/health`
  - Should return database status

- [ ] **Enable Connection Pooling**
  - Railway: Auto-enabled
  - Supabase: Use `?pgbouncer=true` in connection string
  - Direct PostgreSQL: Use PgBouncer

- [ ] **Connection String Format**
  ```
  # Without pooling
  postgresql://user:pass@host:5432/db
  
  # With pooling (recommended for serverless)
  postgresql://user:pass@host:6543/db?pgbouncer=true
  ```

### 6. Backups

- [ ] **Configure Automatic Backups**
  - Railway: Settings → Backups → Enable
  - Frequency: Daily
  - Retention: 7 days (free tier)

- [ ] **Test Backup Restoration**
  ```bash
  # Download backup
  railway backups download latest
  
  # Test restore locally
  psql -h localhost -U postgres -d v2k_test < backup.sql
  ```

### 7. Monitoring

- [ ] **Set Up Alerts**
  - Railway: Webhooks for downtime
  - Slow query alerts (if > 1s)
  - Connection limit warnings

- [ ] **Query Monitoring**
  ```typescript
  // Add to prisma client
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  
  // In production, log only errors
  const prisma = new PrismaClient({
    log: ['error'],
  });
  ```

### 8. Security

- [ ] **Restrict Access**
  - Railway: IP whitelist (if needed)
  - Strong password
  - Rotate credentials periodically

- [ ] **SSL/TLS**
  - Verify connection uses SSL
  - Railway: Enabled by default
  - Check connection string has `?sslmode=require`

- [ ] **Database User Permissions**
  - Create separate read-only user for analytics
  - Principle of least privilege

## Rollback Plan

### If Migration Fails

1. **Keep Development Database Running**
   - Don't delete old database until production stable

2. **Rollback Steps**
   ```bash
   # Switch back to dev DATABASE_URL in Vercel
   # Redeploy previous commit
   vercel --prod --force
   ```

3. **Emergency Read-Only Mode**
   ```typescript
   // middleware.ts
   export function middleware(request: Request) {
     if (request.method !== 'GET') {
       return new Response('Maintenance mode', { status: 503 });
     }
   }
   ```

## Migration Success Criteria

- [ ] All tables created successfully
- [ ] Indexes verified and working
- [ ] Test user can sign up
- [ ] Test investment flow end-to-end
- [ ] Query performance < 100ms for simple queries
- [ ] Backups configured and tested
- [ ] Monitoring and alerts active
- [ ] No errors in Vercel logs
- [ ] Railway dashboard shows healthy connections

## Common Issues & Solutions

### Issue: "P1001: Can't reach database server"

**Solutions:**
- Check DATABASE_URL format
- Verify database is running (Railway dashboard)
- Check IP whitelist (if enabled)
- Test connection locally: `npx prisma db pull`

### Issue: "Migration already applied"

**Solutions:**
```bash
# Reset migration history
npx prisma migrate resolve --applied "20250101000000_init"

# Or force re-apply
npx prisma db push --force-reset  # ⚠️ Deletes all data!
```

### Issue: "Connection pool timeout"

**Solutions:**
- Increase connection limit in Railway
- Enable PgBouncer connection pooling
- Optimize queries (add indexes)
- Reduce concurrent connections

### Issue: "Slow queries"

**Solutions:**
```bash
# Find slow queries
SELECT 
  query, 
  mean_exec_time, 
  calls 
FROM 
  pg_stat_statements 
ORDER BY 
  mean_exec_time DESC 
LIMIT 10;

# Add missing indexes
CREATE INDEX idx_user_email ON "User"(email);
```

## Post-Migration Checklist (Week 1)

- [ ] Day 1: Monitor errors every hour
- [ ] Day 2-3: Monitor twice daily
- [ ] Day 4-7: Monitor daily
- [ ] Check query performance daily
- [ ] Verify backups running
- [ ] Test restoration once
- [ ] Review slow query log
- [ ] Optimize as needed

## Success! 🎉

When all checks pass:
- [ ] Document actual migration steps taken
- [ ] Update runbook for future migrations
- [ ] Share production DATABASE_URL with team securely
- [ ] Schedule next review (1 week)

---

**Migration Date:** _____________
**Migrated By:** _____________
**Database URL:** _______________ (in password manager)
**Backup Schedule:** Daily at 3 AM UTC
**Next Review:** _______________
