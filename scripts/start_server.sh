#!/bin/sh
cd /src
npm install
touch .env
echo "SERVER_REQ_QUEUE="$SERVER_REQ_QUEUE >> .env
echo "SERVER_RES_QUEUE="$SERVER_RES_QUEUE >> .env
echo "ACCESS_KEY="$ACCESS_KEY >> .env
echo "SECRET_ACCESS_KEY="$SECRET_ACCESS_KEY >> .env
echo "REGION="$REGION >> .env
echo "DBSTRING="$DBSTRING >> .env
echo "SALTROUNDS="$SALTROUNDS >> .env
echo "KEY="$KEY >> .env
echo "SESSIONEXP="$SESSIONEXP >> .env
echo "LOGGROUP="$LOGGROUP >> .env
echo "LOGSTREAM="$LOGSTREAM >> .env
pm2 start index.js
pm2 save
pm2 startup