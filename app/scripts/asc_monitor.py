#!/usr/bin/env python3
"""Наблюдение за App Store (2026-11-22): VIA-L и ADAM-L — статус проверки версий, заявок и доступность по странам.
Apple молча скрыла VIA-L в 27 странах ЕС (статус продавца DSA) — без писем. Этот скрипт сравнивает состояние
с прошлым запуском и при любом изменении показывает уведомление на Mac и пишет подробности в журнал.

Запуск по расписанию — launchd: ~/Library/LaunchAgents/com.viael.ascmonitor.plist (10:00 и 18:00).
Вручную:  python3 app/scripts/asc_monitor.py          (проверить и уведомить об изменениях)
          python3 app/scripts/asc_monitor.py --show   (напечатать текущее состояние, ничего не сохранять)
Состояние: ~/.appstoreconnect/monitor-state.json; журнал: ~/Library/Logs/via-l-asc-monitor.log.
"""
import importlib.util, json, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("asc", os.path.join(HERE, "asc_api.py"))
asc = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(asc)

APPS = {"6807062006": "VIA-L", "6828101783": "ADAM-L"}
STATE = os.path.expanduser("~/.appstoreconnect/monitor-state.json")
LOG = os.path.expanduser("~/Library/Logs/via-l-asc-monitor.log")

RU = {
    "READY_FOR_SALE": "в продаже", "WAITING_FOR_REVIEW": "ждёт проверки", "IN_REVIEW": "на проверке",
    "REJECTED": "отклонена", "METADATA_REJECTED": "отклонены описания", "UNRESOLVED_ISSUES": "есть замечания Apple",
    "PENDING_DEVELOPER_RELEASE": "одобрена, ждёт выпуска", "PREPARE_FOR_SUBMISSION": "не подана",
    "DEVELOPER_REJECTED": "отозвана", "PROCESSING_FOR_APP_STORE": "готовится к выпуску", "COMPLETE": "завершена",
    "READY_FOR_REVIEW": "готова к подаче", "CANCELING": "отменяется",
    "AVAILABLE": "доступна", "TRADER_STATUS_VERIFICATION_FAILED": "скрыта: статус продавца (DSA)",
}
def ru(s): return RU.get(s, s)


def snapshot():
    out = {}
    for aid, name in APPS.items():
        a = {"versions": {}, "submissions": {}, "territories": {}}
        for v in asc.req(f"/v1/apps/{aid}/appStoreVersions?limit=3")["data"]:
            a["versions"][v["attributes"]["versionString"]] = v["attributes"]["appStoreState"]
        for s in asc.req(f"/v1/reviewSubmissions?filter[app]={aid}&limit=3")["data"]:
            a["submissions"][(s["attributes"].get("submittedDate") or s["id"])[:10] + " " + s["id"][:8]] = s["attributes"]["state"]
        try:
            for t in asc.all_pages(f"/v2/appAvailabilities/{aid}/territoryAvailabilities?limit=200&include=territory"):
                tid = t["relationships"]["territory"]["data"]["id"]
                a["territories"][tid] = ",".join(sorted(t["attributes"].get("contentStatuses") or []))
        except Exception:
            pass   # у приложения, ещё не вышедшего в продажу, доступности может не быть
        out[name] = a
    return out


def diff(old, new):
    msgs = []
    for name, a in new.items():
        o = old.get(name, {})
        for key, label in (("versions", "версия"), ("submissions", "заявка")):
            for k, st in a[key].items():
                was = o.get(key, {}).get(k)
                if was != st:
                    msgs.append(f"{name}: {label} {k} — {ru(st)}" + (f" (было: {ru(was)})" if was else ""))
        ot = o.get("territories", {})
        if a["territories"] and not ot:   # приложение впервые вышло в продажу (так будет у ADAM-L)
            hid = sorted(t for t, st in a["territories"].items() if st != "AVAILABLE")
            msgs.append(f"{name}: вышла в App Store — доступна в {len(a['territories']) - len(hid)} странах"
                        + (f", скрыта в {len(hid)} ({'; '.join(sorted({ru(a['territories'][t]) for t in hid}))})" if hid else ""))
            continue
        lost = sorted(t for t, st in a["territories"].items() if st != "AVAILABLE" and ot.get(t) == "AVAILABLE")
        back = sorted(t for t, st in a["territories"].items() if st == "AVAILABLE" and ot.get(t) not in (None, "AVAILABLE"))
        other = sorted(t for t, st in a["territories"].items() if t not in lost and t not in back and ot and ot.get(t) != st)
        if lost:
            why = sorted({ru(a["territories"][t]) for t in lost})
            msgs.append(f"{name}: СКРЫТА в {len(lost)} странах ({', '.join(lost[:12])}{'…' if len(lost) > 12 else ''}) — {'; '.join(why)}")
        if back:
            msgs.append(f"{name}: снова доступна в {len(back)} странах ({', '.join(back[:12])}{'…' if len(back) > 12 else ''})")
        for t in other:
            msgs.append(f"{name}: {t} — {ru(a['territories'][t])}")
    return msgs


def notify(msgs):
    text = msgs[0] if len(msgs) == 1 else f"{msgs[0]} (+ ещё {len(msgs) - 1}, см. журнал)"
    esc = lambda s: s.replace("\\", "\\\\").replace('"', '\\"')
    subprocess.run(["osascript", "-e",
                    f'display notification "{esc(text)}" with title "App Store: VIA-L / ADAM-L" sound name "Glass"'])


def log(lines):
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as f:
        for l in lines:
            f.write(time.strftime("%Y-%m-%d %H:%M ") + l + "\n")


def main():
    new = snapshot()
    if "--show" in sys.argv:
        print(json.dumps(new, ensure_ascii=False, indent=1)); return
    old = json.load(open(STATE)) if os.path.exists(STATE) else {}
    msgs = diff(old, new) if old else []
    if not old:
        hidden = {n: sum(1 for st in a["territories"].values() if st != "AVAILABLE") for n, a in new.items()}
        msgs = ["Наблюдение включено. " + "; ".join(
            f"{n}: " + ", ".join(f"{k} {ru(v)}" for k, v in list(a["versions"].items())[:1])
            + (f", не доступна в {hidden[n]} странах" if hidden[n] else "") for n, a in new.items())]
    json.dump(new, open(STATE, "w"), ensure_ascii=False, indent=1)
    if msgs:
        log(msgs); notify(msgs)
    else:
        log(["без изменений"])


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log([f"ОШИБКА: {e}"])
        notify([f"Проверка App Store не удалась: {e}"])
        raise
