#!/bin/sh
echo "testing">> ./test.txt
touch ./test2.txt
echo "testing">> ./test2.txt
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