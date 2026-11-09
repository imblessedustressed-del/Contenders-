#!/bin/sh
# Rebuilds index.html from src/. Run from the repo root: sh build.sh
set -e
python3 - <<'PY'
s=open('src/shell.html').read()
eng=open('src/plan.js').read()+open('src/sim4.js').read()
open('index.html','w').write(s.replace('%%SIM%%',eng))
print('index.html rebuilt')
PY
