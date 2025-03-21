#!/bin/sh

# Start the Python backend in the background
python /app/backend/app/main.py &

# Start Nginx
nginx -g 'daemon off;'