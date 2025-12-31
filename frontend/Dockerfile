# 1. Use Node.js 20 (Alpine is smaller and faster)
FROM node:20-alpine

# FIX: Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first (better caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# 5. Copy the rest of the app
COPY . .

# 6. Expose port 3000
EXPOSE 3000

# 7. Start Next.js in development mode
# (We use dev mode locally so you can see changes instantly)

# Run migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]