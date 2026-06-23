# Step 1: Use the official Node.js image as the base
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json first to leverage Docker's cache for dependencies
COPY package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the application files into the container
COPY . .

# Step 6: Run production build
RUN npm run build

# Step 7: Expose port 3000, which is the standard port for Next.js production server
EXPOSE 3000

# Step 8: Command to run the production server
CMD ["npm", "run", "start"]
