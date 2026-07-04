# Step 1: Use node alpine image
FROM node:22-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files first
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --legacy-peer-deps

# Step 5: Copy the rest of the application
COPY . .

# Step 6: Run production build
RUN npm run build

# Step 7: Expose Astro's default port
EXPOSE 4321

# Step 8: Set environment variables for host and port
ENV HOST=0.0.0.0
ENV PORT=4321

# Step 9: Run production standalone server
CMD ["node", "./dist/server/entry.mjs"]
