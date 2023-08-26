#!/bin/sh
cd /src
npm install
pm2 start index.js
pm2 save
pm2 startup