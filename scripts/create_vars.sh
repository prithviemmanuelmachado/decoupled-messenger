#!/bin/sh
echo "testing">> ./src/test.txt
mkdir ./src/test2
touch ./src/test/test2.txt
echo "testing">> ./src/test/test2.txt
echo "SERVER_REQ_QUEUE="$SERVER_REQ_QUEUE >> ./src/.env
echo "SERVER_RES_QUEUE="$SERVER_RES_QUEUE >> ./src/.env
echo "ACCESS_KEY="$ACCESS_KEY >> ./src/.env
echo "SECRET_ACCESS_KEY="$SECRET_ACCESS_KEY >> ./src/.env
echo "REGION="$REGION >> ./src/.env
echo "DBSTRING="$DBSTRING >> ./src/.env
echo "SALTROUNDS="$SALTROUNDS >> ./src/.env
echo "KEY="$KEY >> ./src/.env
echo "SESSIONEXP="$SESSIONEXP >> ./src/.env
echo "LOGGROUP="$LOGGROUP >> ./src/.env
echo "LOGSTREAM="$LOGSTREAM >> ./src/.env