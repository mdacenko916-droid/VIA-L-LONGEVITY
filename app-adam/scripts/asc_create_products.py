"""App Store Connect: товары ADAM-L по образцу VIA-L (цены и устройство — как у VIA-L на 2026-10-28).
Запуск из корня репозитория:  python3 app-adam/scripts/asc_create_products.py
Повторный запуск безопасен: что уже есть (по productId / имени группы) — пропускается.
  • группа подписок «ADAM-L Subscriptions»: adam_l_yearly (уровень 1) и adam_l_monthly (уровень 2);
  • adam_l_lifetime — разовая покупка «навсегда» (NON_CONSUMABLE);
  • adam_l_specialist_review — разовый разбор со специалистом (CONSUMABLE), 12 языков, как у VIA-L.
Цены: база Германия, США — своей ценой (для подписок Apple сам выравнивает остальные страны по базе).
Товары создаются ЧЕРНОВИКАМИ: без скриншота для ревью они в MISSING_METADATA и уходят на ревью вместе со сборкой.
"""
import importlib.util, os
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "app", "scripts", "asc_api.py")
spec = importlib.util.spec_from_file_location("asc", _p); asc = importlib.util.module_from_spec(spec); spec.loader.exec_module(asc)

APP = "6828101783"   # ADAM-L (com.viael.adaml)
GROUP = "ADAM-L Subscriptions"
SUB_DESC = "Andropause: finally something that helps"
SUBS = [   # productId, имя, период, уровень в группе, € (DEU), $ (USA), заметка для ревью
    ("adam_l_yearly", "ADAM-L Yearly", "ONE_YEAR", 1, "99.99", "99.99",
     "Yearly option of the same subscription (same access as ADAM-L Monthly). The paywall shows Monthly, Yearly and "
     "Lifetime; prices are taken from the App Store, not hardcoded. \"Restore Purchases\" is on the same screen."),
    ("adam_l_monthly", "ADAM-L Monthly", "ONE_MONTH", 2, "14.99", "14.99",
     "The subscription unlocks full access to the app's daily and weekly analysis. The paywall is shown inside the app "
     "after the user accepts the disclaimer, if no active subscription is found. \"Restore Purchases\" is on the same "
     "screen. The price is taken from the App Store, not hardcoded."),
]
LIFETIME = ("adam_l_lifetime", "ADAM-L Lifetime", "NON_CONSUMABLE", "199.99", "199.99",
            {"en-US": ("ADAM-L Lifetime", "Full access forever, one-time payment, no renewal")},
            "One-time purchase that unlocks the same full access as the ADAM-L subscription, forever. Shown on the same "
            "paywall next to Monthly and Yearly; the price is taken from the App Store. \"Restore Purchases\" is on the same screen.")
REVIEW_L = {
    "en-US": ("Specialist Review", "Written review of your data, personal plan"),
    "ru":    ("Разбор со специалистом", "Письменный разбор ваших данных и личный план"),
    "uk":    ("Розбір зі спеціалістом", "Письмовий розбір ваших даних і план"),
    "es-ES": ("Revisión con especialista", "Revisión escrita de tus datos y plan"),
    "de-DE": ("Auswertung vom Spezialisten", "Schriftliche Auswertung mit Plan"),
    "fr-FR": ("Analyse par un spécialiste", "Analyse écrite de vos données et plan"),
    "pt-BR": ("Análise com especialista", "Análise escrita dos seus dados e plano"),
    "it":    ("Analisi con lo specialista", "Analisi scritta dei tuoi dati e piano"),
    "pl":    ("Analiza ze specjalistą", "Pisemna analiza Twoich danych i plan"),
    "he":    ("סקירה עם מומחה", "סקירה כתובה של הנתונים ותוכנית אישית"),
    "ja":    ("専門家によるレビュー", "データの書面レビューと個別プラン"),
    "ko":    ("전문가 리뷰", "데이터 서면 리뷰와 맞춤 플랜"),
}
REVIEW = ("adam_l_specialist_review", "ADAM-L Specialist Review", "CONSUMABLE", "50.0", "54.99", REVIEW_L,
          "One-off written review by a human nutrition specialist. After purchase the specialist reads the data the user "
          "chose to share (daily metrics, complaints, app summaries, optional lab photos) and replies in the in-app chat "
          "within 48 hours with a written review and a personal plan, which appears in \"My intake\". The user then has "
          "7 days for follow-up questions. Consumable: each purchase is one review. No call, no external payment.")

def territories():
    return [t["id"] for t in asc.all_pages("/v1/territories?limit=200")]

def ensure_group():
    for g in asc.all_pages("/v1/apps/%s/subscriptionGroups?limit=50" % APP):
        if g["attributes"]["referenceName"] == GROUP: print("Группа есть:", g["id"]); return g["id"]
    gid = asc.req("/v1/subscriptionGroups", "POST", {"data": {"type": "subscriptionGroups", "attributes": {"referenceName": GROUP},
        "relationships": {"app": {"data": {"type": "apps", "id": APP}}}}})["data"]["id"]
    asc.req("/v1/subscriptionGroupLocalizations", "POST", {"data": {"type": "subscriptionGroupLocalizations",
        "attributes": {"locale": "en-US", "name": "ADAM-L"},
        "relationships": {"subscriptionGroup": {"data": {"type": "subscriptionGroups", "id": gid}}}}})
    print("Группа создана:", gid); return gid

def _sub_prices(sid, eur, usd):
    """Цены по всем странам плана (база DEU + выравнивание Apple + США). Страны, где подписки не продаются
    (ответ UNSUPPORTED_TERRITORY, напр. AFG), пропускаем. Уже стоящие цены не дублируем."""
    have = {p["relationships"]["territory"]["data"]["id"] for p in asc.all_pages("/v1/subscriptions/%s/prices?include=territory&limit=200" % sid)
            if p.get("relationships", {}).get("territory", {}).get("data")}
    ok = skip = 0
    for t, (pid, _) in sorted(asc.sub_price_plan(sid, eur, usd).items()):
        if t in have: continue
        try:
            asc.req("/v1/subscriptionPrices", "POST", {"data": {"type": "subscriptionPrices", "attributes": {"startDate": None, "preserveCurrentPrice": False},
                "relationships": {"subscription": {"data": {"type": "subscriptions", "id": sid}},
                                  "subscriptionPricePoint": {"data": {"type": "subscriptionPricePoints", "id": pid}},
                                  "territory": {"data": {"type": "territories", "id": t}}}}}); ok += 1
        except RuntimeError as e:
            if "UNSUPPORTED_TERRITORY" in str(e): skip += 1
            else: raise
    return ok, skip, len(have)

def ensure_sub(gid, pid, name, period, level, eur, usd, note, terr):
    have = [s for s in asc.all_pages("/v1/subscriptionGroups/%s/subscriptions?limit=50" % gid) if s["attributes"]["productId"] == pid]
    if have:
        sid = have[0]["id"]; print("Подписка есть:", pid, sid)
    else:
        sid = asc.req("/v1/subscriptions", "POST", {"data": {"type": "subscriptions", "attributes": {"name": name, "productId": pid,
            "subscriptionPeriod": period, "familySharable": False, "reviewNote": note, "groupLevel": level},
            "relationships": {"group": {"data": {"type": "subscriptionGroups", "id": gid}}}}})["data"]["id"]
        print("Подписка создана:", pid, sid)
    if not asc.req("/v1/subscriptions/%s/subscriptionLocalizations" % sid)["data"]:
        asc.req("/v1/subscriptionLocalizations", "POST", {"data": {"type": "subscriptionLocalizations",
            "attributes": {"locale": "en-US", "name": name, "description": SUB_DESC},
            "relationships": {"subscription": {"data": {"type": "subscriptions", "id": sid}}}}})
    try:
        asc.req("/v1/subscriptions/%s/subscriptionAvailability" % sid); avail = True
    except RuntimeError:
        avail = False
    if not avail:   # страны продажи — ДО цен (иначе цены упираются в UNSUPPORTED_TERRITORY)
        asc.req("/v1/subscriptionAvailabilities", "POST", {"data": {"type": "subscriptionAvailabilities",
            "attributes": {"availableInNewTerritories": True},
            "relationships": {"subscription": {"data": {"type": "subscriptions", "id": sid}},
                              "availableTerritories": {"data": [{"type": "territories", "id": t} for t in terr]}}}})
    ok, skip, had = _sub_prices(sid, eur, usd)
    print("  %s: €%s/$%s — цен добавлено %d, уже было %d, стран без подписок %d" % (pid, eur, usd, ok, had, skip))

def _iap_point(iid, territory, price):
    pts = [p for p in asc.all_pages("/v2/inAppPurchases/%s/pricePoints?filter[territory]=%s&limit=200" % (iid, territory))
           if float(p["attributes"]["customerPrice"]) == float(price)]
    if not pts: raise SystemExit("Нет ценовой точки %s %s" % (territory, price))
    return pts[0]

def ensure_iap(pid, name, kind, eur, usd, locs, note, terr):
    if [i for i in asc.all_pages("/v1/apps/%s/inAppPurchasesV2?limit=50" % APP) if i["attributes"]["productId"] == pid]:
        print("Покупка есть:", pid); return
    for k, (n, d) in locs.items(): assert len(n) <= 30 and len(d) <= 55, (pid, k, len(n), len(d))
    iid = asc.req("/v2/inAppPurchases", "POST", {"data": {"type": "inAppPurchases", "attributes": {"name": name, "productId": pid,
        "inAppPurchaseType": kind, "reviewNote": note, "familySharable": False},
        "relationships": {"app": {"data": {"type": "apps", "id": APP}}}}})["data"]["id"]
    for loc, (n, d) in locs.items():
        asc.req("/v1/inAppPurchaseLocalizations", "POST", {"data": {"type": "inAppPurchaseLocalizations",
            "attributes": {"locale": loc, "name": n, "description": d},
            "relationships": {"inAppPurchaseV2": {"data": {"type": "inAppPurchases", "id": iid}}}}})
    plan = [("p1", _iap_point(iid, "DEU", eur)), ("p2", _iap_point(iid, "USA", usd))]
    asc.req("/v1/inAppPurchasePriceSchedules", "POST", {"data": {"type": "inAppPurchasePriceSchedules",
        "relationships": {"inAppPurchase": {"data": {"type": "inAppPurchases", "id": iid}},
                          "baseTerritory": {"data": {"type": "territories", "id": "DEU"}},
                          "manualPrices": {"data": [{"type": "inAppPurchasePrices", "id": "${%s}" % k} for k, _ in plan]}}},
        "included": [{"type": "inAppPurchasePrices", "id": "${%s}" % k, "attributes": {"startDate": None},
            "relationships": {"inAppPurchaseV2": {"data": {"type": "inAppPurchases", "id": iid}},
                              "inAppPurchasePricePoint": {"data": {"type": "inAppPurchasePricePoints", "id": pt["id"]}}}}
            for k, pt in plan]})
    asc.req("/v1/inAppPurchaseAvailabilities", "POST", {"data": {"type": "inAppPurchaseAvailabilities",
        "attributes": {"availableInNewTerritories": True},
        "relationships": {"inAppPurchase": {"data": {"type": "inAppPurchases", "id": iid}},
                          "availableTerritories": {"data": [{"type": "territories", "id": t} for t in terr]}}}})
    print("Покупка создана: %s %s — €%s/$%s, языков %d, стран %d" % (pid, iid, eur, usd, len(locs), len(terr)))

def main():
    terr = territories()
    gid = ensure_group()
    for s in SUBS: ensure_sub(gid, *s, terr)
    for p in (LIFETIME, REVIEW): ensure_iap(*p, terr)
    print("Готово.")

if __name__ == "__main__":
    main()
