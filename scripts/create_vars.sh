#!/bin/sh
touch test.txt
echo "SERVER_REQ_QUEUE="$SERVER_REQ_QUEUE >> test.txt
echo "SERVER_RES_QUEUE="$SERVER_RES_QUEUE >> test.txt
echo "ACCESS_KEY="$ACCESS_KEY >> test.txt
echo "SECRET_ACCESS_KEY="$SECRET_ACCESS_KEY >> test.txt
echo "REGION="$REGION >> test.txt
echo "DBSTRING="$DBSTRING >> test.txt
echo "SALTROUNDS="$SALTROUNDS >> test.txt
echo "KEY="$KEY >> test.txt
echo "SESSIONEXP="$SESSIONEXP >> test.txt
echo "LOGGROUP="$LOGGROUP >> test.txt
echo "LOGSTREAM="$LOGSTREAM >> test.txt