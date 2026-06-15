FROM node:20-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1
ENV PATH="/opt/venv/bin:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY worker/requirements.txt ./worker/requirements.txt
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/python -m pip install --upgrade pip setuptools wheel \
  && /opt/venv/bin/python -m pip install --no-cache-dir -r worker/requirements.txt

COPY server ./server
COPY worker ./worker

EXPOSE 3000
CMD ["npm", "start"]
