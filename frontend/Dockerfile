FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Set environment variables from build args
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GENIUS_CLIENT_ID
ARG VITE_GENIUS_CLIENT_SECRET
ARG VITE_GENIUS_ACCESS_TOKEN
ARG VITE_GENIUS_REDIRECT_URI
ARG VITE_DROPBOX_APP_KEY
ARG VITE_DROPBOX_APP_SECRET
ARG VITE_DROPBOX_REDIRECT_URI

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_GENIUS_CLIENT_ID=${VITE_GENIUS_CLIENT_ID}
ENV VITE_GENIUS_CLIENT_SECRET=${VITE_GENIUS_CLIENT_SECRET}
ENV VITE_GENIUS_ACCESS_TOKEN=${VITE_GENIUS_ACCESS_TOKEN}
ENV VITE_GENIUS_REDIRECT_URI=${VITE_GENIUS_REDIRECT_URI}
ENV VITE_DROPBOX_APP_KEY=${VITE_DROPBOX_APP_KEY}
ENV VITE_DROPBOX_APP_SECRET=${VITE_DROPBOX_APP_SECRET}
ENV VITE_DROPBOX_REDIRECT_URI=${VITE_DROPBOX_REDIRECT_URI}

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a script to replace environment variables in the nginx config
RUN apk add --no-cache bash
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Start nginx with our custom entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
