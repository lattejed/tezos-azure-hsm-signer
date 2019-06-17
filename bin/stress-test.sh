#!/bin/bash

if [ -z "$KEY_URL" ]; then
  echo You need to provide a KEY_URL, e.g.,
  echo KEY_URL='http://127.127.127.127:6732/keys/tzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' bash stress-test.sh >> log.txt
  echo and run your signer with '--send-sign-timing' and '--magic-bytes 0x07'
  exit
fi

while true
do

START=`date +%s.%N`

TIME1=$(curl -s \
        -H "Content-Type: application/json" \
        -d '"070000000078967867324927834798328949732764327684372864382764387264387264328764378264328764387264873268743628746328764327864873264873264873264873628476328746328764387264837267486328764328764837264873628746328746328764837264873268746328764328764837264873264873437829743289743298743982743982749832749832798473298743982749832749837298437297823894723"' \
        "$KEY_URL" \
        | python -c "import sys, json; print json.load(sys.stdin)['time']")

END=`date +%s.%N`

REQTIME=$( echo "($END - $START) * 1000" | bc -l )

echo "Request time: $REQTIME, Signer time: $TIME1"

sleep 1

done
