"""Воронка «Безкоштовний розбір VIA-L» по источникам (src): открыли лендинг → открыли опросник → начали → получили разбор.
  python3 tools/check_funnel.py [дней=7]
Данные: D1 vial-cabinet — check_events (land/open/start, воркер /check-event) и ai_usage endpoint='check-report' (готовый разбор).
Метки test/qa — наши проверки, в отчёт не идут. Уникальные = разные суточные хеши адреса."""
import json, subprocess, sys
from pathlib import Path
days = int(sys.argv[1]) if len(sys.argv) > 1 else 7
W = Path(__file__).resolve().parent.parent / 'interpreter'
def q(sql):
    r = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'vial-cabinet', '--remote', '--json', '--command', sql], cwd=W, capture_output=True, text=True)
    return json.loads(r.stdout)[0]['results']
since = f"date('now','-{days - 1} days')"
ev = q(f"SELECT COALESCE(NULLIF(src,''),'—') s, ev, COUNT(DISTINCT ip) u FROM check_events WHERE day >= {since} AND src NOT IN ('test','qa') GROUP BY s, ev")
done = q(f"SELECT COALESCE(NULLIF(note,''),'—') s, COUNT(*) n FROM ai_usage WHERE endpoint='check-report' AND date(ts/1000,'unixepoch') >= {since} AND COALESCE(note,'') NOT IN ('test','qa') GROUP BY s")
t = {}
for r in ev: t.setdefault(r['s'], {})[r['ev']] = r['u']
for r in done: t.setdefault(r['s'], {})['done'] = r['n']
print(f'Безкоштовний розбір VIA-L — за {days} дн.   лендинг → опросник → начали → разбор')
for s in sorted(t, key=lambda k: -sum(t[k].values())):
    d = t[s]; print(f"  {s:<14} {d.get('land', 0):>5} → {d.get('open', 0):>5} → {d.get('start', 0):>5} → {d.get('done', 0):>5}")
if not t: print('  пока пусто')
