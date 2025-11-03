#! /bin/zsh

cd "$(dirname "$0")"

uvicorn src.main:socket_app \
    --host 0.0.0.0 \
    --port 3001 \
    --reload \
    --reload-dir src \
    --log-level info
