# Testing Guide - Monolith Stocks Platform

This guide covers how to verify the functionality of the monolithic stocks backend, from manual API testing to automated test strategies.

## 1. Manual API Testing

### Setup
Ensure the server is running:
```bash
docker compose up -d --build
npx prisma migrate dev
npx prisma db seed
```

### Authentication Flow

#### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email": "test@example.com", "password": "password123"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "test@example.com", "password": "password123"}'
```
*Note: Copy the `token` from the response.*

---

### Stocks & Trading Flow

#### List Stocks
```bash
curl http://localhost:3000/api/stocks
```

#### Execute a BUY Trade
Replace `<TOKEN>` with your JWT:
```bash
curl -X POST http://localhost:3000/api/trade \
-H "Authorization: Bearer <TOKEN>" \
-H "Content-Type: application/json" \
-d '{"symbol": "AAPL", "quantity": 10, "type": "BUY"}'
```

#### View Portfolio
```bash
curl http://localhost:3000/api/portfolio \
-H "Authorization: Bearer <TOKEN>"
```

---

## 2. Validation Testing (Zod)

The app uses **Zod** for strict input validation. You can test this by sending malformed requests.

### Test Email Validation
If you send an invalid email format:
```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email": "not-an-email", "password": "pass"}'
```
**Expected Response**: `400 Bad Request` with Zod error details.

### Test Negative Quantity
```bash
curl -X POST http://localhost:3000/api/trade \
-H "Authorization: Bearer <TOKEN>" \
-d '{"symbol": "AAPL", "quantity": -5, "type": "BUY"}'
```
**Expected Response**: `400 Bad Request` (Quantity must be positive).

---

## 3. Business Logic Testing

### Short Selling Protection
Try to sell more stocks than you own:
1. BUY 5 shares of `TSLA`.
2. Try to SELL 10 shares of `TSLA`.
```bash
curl -X POST http://localhost:3000/api/trade \
-H "Authorization: Bearer <TOKEN>" \
-d '{"symbol": "TSLA", "quantity": 10, "type": "SELL"}'
```
**Expected Response**: `400 Bad Request` - "Insufficient shares to sell".

---

## 4. Automated Testing Strategy (Jest)

To implement automated tests, we recommend using **Jest** and **Supertest**.

### Unit Tests
- **Location**: `src/services/*.test.ts`
- **Focus**: Mock the repositories and test the business logic (e.g., in `stock.service.ts`, test that the `SELL` logic correctly checks holdings).

### Integration Tests
- **Location**: `src/controllers/*.test.ts`
- **Focus**: Use `supertest` to hit endpoints. 
- **Database**: Use a separate test database or a "Prisma transaction wrapper" to rollback changes after each test.

### Recommended Test Command Script
Add to `package.json`:
```json
"scripts": {
  "test": "jest --detectOpenHandles"
}
```

## 5. Load & Rate Limit Testing

The app includes `express-rate-limit`.
- **Default**: 100 requests every 15 minutes per IP.
- **Verification**: Run a quick loop script to hit `/api/stocks` 101 times.
- **Expected**: The 101st request should receive a `429 Too Many Requests`.
