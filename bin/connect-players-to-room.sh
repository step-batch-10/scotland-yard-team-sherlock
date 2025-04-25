#!/bin/bash
set -e

URL=$1
NUM_PLAYERS=$2
ROOM_ID=$3

if [ -z "$URL" ] || [ -z "$NUM_PLAYERS" ] || [ -z "$ROOM_ID" ]; then
  echo "Usage: $0 <base_url> <number_of_players (max 6)> <room_id>"
  exit 1
fi

if [ "$NUM_PLAYERS" -gt 6 ]; then
  echo "Maximum number of players is 6"
  exit 1
fi

for i in $(seq 1 $NUM_PLAYERS); do
  curl -X POST -d "player-name=p$i" -c cookies.txt "$URL/auth/login"

  curl -X POST --cookie "playerId=$i; roomId=$ROOM_ID; playerName=p$i" "$URL/lobby/room/join"

  echo "Player $i joined Room $ROOM_ID"
done
