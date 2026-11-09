#!/bin/sh
# Rebuilds index.html from src/. Run from the repo root: sh build.sh
# Also writes version.txt; open pages compare it with their own BUILD stamp and reload when the site changes.
set -e
python3 - <<'PY'
import time
s=open('src/shell.html').read()
eng=open('src/plan.js').read()+open('src/sim4.js').read()
b=str(int(time.time()))
open('index.html','w').write(s.replace('%%SIM%%',eng).replace('%%BUILD%%',b))
open('version.txt','w').write(b)
print('index.html rebuilt, build',b)
PY
