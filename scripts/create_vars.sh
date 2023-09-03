#!/bin/sh
touch test.txt
echo "SERVER_REQ_QUEUE="$SERVER_REQ_QUEUE
echo "SERVER_RES_QUEUE="$SERVER_RES_QUEUE
echo "ACCESS_KEY="$ACCESS_KEY
echo "SECRET_ACCESS_KEY="$SECRET_ACCESS_KEY
echo "REGION="$REGION
echo "DBSTRING="$DBSTRING >> test.txt
echo "SALTROUNDS="$SALTROUNDS >> test.txt
echo "KEY="$KEY >> test.txt
echo "SESSIONEXP="$SESSIONEXP >> test.txt
echo "LOGGROUP="$LOGGROUP >> test.txt
echo "LOGSTREAM="$LOGSTREAM >> test.txt