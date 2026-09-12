#!/usr/bin/env python3
"""play-release.py — треки Google Play и выкладка уже загруженной сборки в нужный трек.

Зачем: 2026-09-11 сборка v4 ушла в НОВЫЙ трек «v4 - 2026-09-11», а тестировщики сидели в
«1.0 (1) — закрытый тест» и обновления не получили. Глазами это не видно: в Console у каждого
трека свой экран. Скрипт показывает все треки, их релизы и сборки в библиотеке одной командой.

Запуск (из корня репозитория):
    python3 app/scripts/play-release.py status
    python3 app/scripts/play-release.py release --track "1.0 (1) — закрытый тест" --version 4
    python3 app/scripts/play-release.py release --track "..." --version 4 --yes    # с публикацией

Без --yes ничего не публикуется: скрипт только печатает, что сделал бы (черновой прогон).

Ключ сервисного аккаунта (Google Cloud → IAM → Service accounts, доступ выдан в Play Console →
Пользователи и разрешения): путь берётся из PLAY_SA_JSON, иначе ищется ~/Downloads/via-l-health-*.json.
Ключ в репозиторий не кладём.

Примечания к выпуску — JSON-файл вида [{"language":"en-US","text":"…"}, …]; по умолчанию берётся
app/store/release-notes.json, если он есть. Коды языков — как в Play: uk (не uk-UA), ru-RU, en-US.
"""
import argparse, base64, glob, json, os, sys, time, urllib.error, urllib.parse, urllib.request

PKG = "com.viael.vial"
API = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/" + PKG
SCOPE = "https://www.googleapis.com/auth/androidpublisher"


def sa_path():
    p = os.environ.get("PLAY_SA_JSON")
    if p and os.path.exists(p):
        return p
    hits = sorted(glob.glob(os.path.expanduser("~/Downloads/via-l-health-*.json")))
    if hits:
        return hits[-1]
    sys.exit("Не найден ключ сервисного аккаунта. Укажите PLAY_SA_JSON=/путь/к/ключу.json")


def token():
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding
    d = json.load(open(sa_path()))
    b64 = lambda x: base64.urlsafe_b64encode(x).rstrip(b"=")
    now = int(time.time())
    head = b64(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claim = b64(json.dumps({"iss": d["client_email"], "scope": SCOPE,
                            "aud": "https://oauth2.googleapis.com/token",
                            "iat": now, "exp": now + 3600}).encode())
    signing = head + b"." + claim
    key = serialization.load_pem_private_key(d["private_key"].encode(), password=None)
    jwt = signing + b"." + b64(key.sign(signing, padding.PKCS1v15(), hashes.SHA256()))
    body = urllib.parse.urlencode({"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                                   "assertion": jwt.decode()}).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=body)
    return json.load(urllib.request.urlopen(req, timeout=30))["access_token"]


def call(tok, url, method="GET", data=None):
    req = urllib.request.Request(url, method=method,
                                 data=(json.dumps(data).encode() if data is not None else None),
                                 headers={"Authorization": "Bearer " + tok,
                                          "Content-Type": "application/json"})
    try:
        raw = urllib.request.urlopen(req, timeout=60).read()
        return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        sys.exit("Google Play API %s: %s" % (e.code, e.read().decode()[:500]))


def with_edit(tok, fn):
    """Создаёт edit, выполняет fn(edit_id) и всегда прибирает за собой, если не было commit."""
    eid = call(tok, API + "/edits", "POST", {})["id"]
    try:
        return fn(eid)
    finally:
        try:
            call(tok, "%s/edits/%s" % (API, eid), "DELETE")
        except SystemExit:
            pass   # уже закоммичен — удалять нечего


def cmd_status(args):
    tok = token()
    def run(eid):
        tracks = call(tok, "%s/edits/%s/tracks" % (API, eid)).get("tracks", [])
        print("ТРЕКИ:")
        for t in tracks:
            rels = t.get("releases", [])
            if not rels:
                print("  %-34s — пусто" % t["track"])
            for r in rels:
                print("  %-34s %-10s сборки %-8s %s" % (
                    t["track"], r.get("status", ""), ",".join(r.get("versionCodes") or []) or "—",
                    r.get("name", "")))
        print("\nСБОРКИ В БИБЛИОТЕКЕ:")
        for b in call(tok, "%s/edits/%s/bundles" % (API, eid)).get("bundles", []):
            print("  versionCode %-4s sha1 %s" % (b.get("versionCode"), str(b.get("sha1"))[:16]))
    with_edit(tok, run)


def load_notes(path):
    if not path:
        d = "app/store/release-notes.json"
        path = d if os.path.exists(d) else None
    if not path:
        return None
    notes = json.load(open(path, encoding="utf-8"))
    assert isinstance(notes, list) and all("language" in n and "text" in n for n in notes), \
        "release-notes.json: ожидается список {language, text}"
    return notes


def cmd_release(args):
    tok = token()
    notes = load_notes(args.notes)
    def run(eid):
        have = [str(b.get("versionCode")) for b in call(tok, "%s/edits/%s/bundles" % (API, eid)).get("bundles", [])]
        if str(args.version) not in have:
            sys.exit("Сборки %s нет в библиотеке Play (есть: %s). Сначала загрузите .aab." % (args.version, ", ".join(have)))
        tracks = [t["track"] for t in call(tok, "%s/edits/%s/tracks" % (API, eid)).get("tracks", [])]
        if args.track not in tracks:
            sys.exit("Трека «%s» нет. Есть: %s" % (args.track, " | ".join(tracks)))
        rel = {"name": "%s (1.0)" % args.version, "versionCodes": [str(args.version)], "status": "completed"}
        if notes:
            rel["releaseNotes"] = notes
        print("Трек:   %s\nСборка: %s\nЯзыки примечаний: %s"
              % (args.track, args.version, ", ".join(n["language"] for n in notes) if notes else "нет"))
        if not args.yes:
            print("\nЧерновой прогон. Ничего не опубликовано. Добавьте --yes, чтобы выложить.")
            return
        call(tok, "%s/edits/%s/tracks/%s" % (API, eid, urllib.parse.quote(args.track)), "PUT",
             {"track": args.track, "releases": [rel]})
        out = call(tok, "%s/edits/%s:commit" % (API, eid), "POST", {})
        print("\nОпубликовано. edit id:", out.get("id", eid))
    with_edit(tok, run)


def main():
    ap = argparse.ArgumentParser(description="Треки Google Play и выкладка сборки в трек")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("status", help="показать треки, релизы и сборки в библиотеке")
    r = sub.add_parser("release", help="выложить сборку из библиотеки в трек")
    r.add_argument("--track", required=True, help='имя трека, например "1.0 (1) — закрытый тест"')
    r.add_argument("--version", required=True, type=int, help="versionCode сборки, например 4")
    r.add_argument("--notes", help="JSON с примечаниями (по умолчанию app/store/release-notes.json)")
    r.add_argument("--yes", action="store_true", help="действительно опубликовать")
    a = ap.parse_args()
    (cmd_status if a.cmd == "status" else cmd_release)(a)


if __name__ == "__main__":
    main()
