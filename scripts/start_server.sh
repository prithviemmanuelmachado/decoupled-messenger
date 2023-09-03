#!/bin/sh
cd /src
pm2 stop all
pm2 delete all
pm2 start index.js
pm2 save
pm2 startup