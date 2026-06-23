# Step 1: Use node alpine image
FROM node:22-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files first
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application
COPY . .

# Step 6: Expose Astro's default port
EXPOSE 4321

# Step 7: Run dev command bound to all network interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4321"]
