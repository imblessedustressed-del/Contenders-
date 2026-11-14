#!/bin/sh
# Rebuilds index.html from src/. Run from the repo root: sh build.sh
# Also writes version.txt; open pages compare it with their own BUILD stamp and reload when the site changes.
set -e
python3 - <<'PY'
import time
s=open('src/shell.html').read()
eng=open('src/plan.js').read()+open('src/sim4.js').read()
pur=open('src/vendor/purify.min.js').read()
b=str(int(time.time()))
open('index.html','w').write(s.replace('%%PURIFY%%',pur).replace('%%SIM%%',eng).replace('%%BUILD%%',b))
open('version.txt','w').write(b)
print('index.html rebuilt, build',b)
PY
# Engine bundle for the server-side league runner (needs: cd tools && npm i)
node tools/mkcore.js || echo 'WARNING: engine-core.js not rebuilt (run: cd tools && npm i)'
# Runner logic for the league-runner edge function (downloaded by it at run time)
(cd tools && npx esbuild ../supabase/functions/league-runner/lib.ts --bundle --format=iife --global-name=RunnerLib --target=es2022 --outfile=../runner-lib.js --log-level=warning) || echo 'WARNING: runner-lib.js not rebuilt (run: cd tools && npm i)'
