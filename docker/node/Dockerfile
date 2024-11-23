
FROM node:23.2.0-alpine3.19

# Set working directory
WORKDIR /app


# Copy package.json and yarn-lock.json
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile 

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

EXPOSE 3000

# Command to run the app
CMD ["node", "dist/main"]