FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    flask \
    flask-cors \
    pandas \
    numpy \
    scikit-learn

# Copy frontend build
COPY --from=build /app/dist /usr/share/nginx/html

# Copy backend + data files
COPY backend.py /app/api/backend.py
COPY appic_clean_2026.csv /app/api/appic_clean_2026.csv
COPY requests_log.csv /app/api/requests_log.csv

# nginx config
RUN rm -f /etc/nginx/sites-enabled/default \
    && rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir -p /var/log/flask /var/log/supervisor /var/log/nginx /app/data

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]