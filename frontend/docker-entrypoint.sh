#!/bin/bash

# Replace environment variables in the nginx configuration
envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Create a runtime environment.js file with the environment variables
# This allows us to update environment variables at runtime without rebuilding the image
cat > /usr/share/nginx/html/env-config.js << EOF
window.env = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}",
  VITE_GENIUS_CLIENT_ID: "${VITE_GENIUS_CLIENT_ID}",
  VITE_GENIUS_CLIENT_SECRET: "${VITE_GENIUS_CLIENT_SECRET}",
  VITE_GENIUS_ACCESS_TOKEN: "${VITE_GENIUS_ACCESS_TOKEN}",
  VITE_GENIUS_REDIRECT_URI: "${VITE_GENIUS_REDIRECT_URI}",
  VITE_DROPBOX_APP_KEY: "${VITE_DROPBOX_APP_KEY}",
  VITE_DROPBOX_APP_SECRET: "${VITE_DROPBOX_APP_SECRET}",
  VITE_DROPBOX_REDIRECT_URI: "${VITE_DROPBOX_REDIRECT_URI}",
  API_URL: "${API_URL}"
};
EOF

# Execute the CMD
exec "$@"
