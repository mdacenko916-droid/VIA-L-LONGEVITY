"""App Store Connect: завести разовую покупку «Разбор со специалистом» (docs/SPECIALIST-REVIEW-PLAN.md).
Запуск из корня репозитория:  python3 app/scripts/asc_create_review_iap.py
Что делает: создаёт расходуемую покупку via_l_specialist_review, название и описание на 12 языках,
базовую цену €50 (Германия; остальные страны Apple пересчитывает сам) и доступность во всех странах.
Товар создаётся ЧЕРНОВИКОМ: покупателям он не виден, пока не подан на ревью вместе со сборкой.
Повторный запуск безопасен — если товар уже есть, скрипт останавливается.
Цены на уже созданном товаре:  python3 app/scripts/asc_create_review_iap.py price
(база €50 Германия + своя цена для США $54,99 — решение владельца 2026-10-02; авто-пересчёт давал $45).
"""
import importlib.util, os
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "asc_api.py")
spec = importlib.util.spec_from_file_location("asc", _p); asc = importlib.util.module_from_spec(spec); spec.loader.exec_module(asc)

APP = "6807062006"
PID = "via_l_specialist_review"
EUR = "50.0"
USD = "54.99"   # США — вручную: авто-пересчёт Apple из €50 даёт $45 (без европейского НДС)
# Название ≤ 30 знаков, описание ≤ 45 — предел App Store.
L = {
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
NOTE = ("One-off written review by a human nutrition specialist. After purchase the specialist reads the data the user "
        "chose to share (daily metrics, complaints, app summaries, optional lab photos) and replies in the in-app chat "
        "within 48 hours with a written review and a personal plan, which appears in \"My intake\". The user then has "
        "7 days for follow-up questions. Consumable: each purchase is one review. No call, no external payment.")

def _point(iid, territory, price):
    pts = [p for p in asc.all_pages("/v2/inAppPurchases/%s/pricePoints?filter[territory]=%s&limit=200" % (iid, territory))
           if float(p["attributes"]["customerPrice"]) == float(price)]
    if not pts: raise SystemExit("Нет ценовой точки %s %s — цены не изменены." % (territory, price))
    return pts[0]

def set_prices(iid):
    """Расписание цен целиком: база Германия + ручная цена США. Остальные страны Apple считает от базы."""
    plan = [("p1", _point(iid, "DEU", EUR)), ("p2", _point(iid, "USA", USD))]
    asc.req("/v1/inAppPurchasePriceSchedules", "POST", {"data": {"type": "inAppPurchasePriceSchedules",
        "relationships": {"inAppPurchase": {"data": {"type": "inAppPurchases", "id": iid}},
                          "baseTerritory": {"data": {"type": "territories", "id": "DEU"}},
                          "manualPrices": {"data": [{"type": "inAppPurchasePrices", "id": "${%s}" % k} for k, _ in plan]}}},
        "included": [{"type": "inAppPurchasePrices", "id": "${%s}" % k, "attributes": {"startDate": None},
            "relationships": {"inAppPurchaseV2": {"data": {"type": "inAppPurchases", "id": iid}},
                              "inAppPurchasePricePoint": {"data": {"type": "inAppPurchasePricePoints", "id": pt["id"]}}}}
            for k, pt in plan]})
    print("Цены: Германия (база) €%s · США $%s" % (plan[0][1]["attributes"]["customerPrice"], plan[1][1]["attributes"]["customerPrice"]))

def price_only():
    found = [i for i in asc.all_pages("/v1/apps/%s/inAppPurchasesV2?limit=50" % APP) if i["attributes"]["productId"] == PID]
    if not found: raise SystemExit("Товар %s не найден." % PID)
    set_prices(found[0]["id"])

def main():
    for k, (n, d) in L.items():
        assert len(n) <= 30 and len(d) <= 45, (k, len(n), len(d))
    if [i for i in asc.all_pages("/v1/apps/%s/inAppPurchasesV2?limit=50" % APP) if i["attributes"]["productId"] == PID]:
        raise SystemExit("Товар %s уже существует — ничего не делаю." % PID)

    r = asc.req("/v2/inAppPurchases", "POST", {"data": {"type": "inAppPurchases",
        "attributes": {"name": "VIA-L Specialist Review", "productId": PID, "inAppPurchaseType": "CONSUMABLE",
                       "reviewNote": NOTE, "familySharable": False},
        "relationships": {"app": {"data": {"type": "apps", "id": APP}}}}})["data"]
    iid = r["id"]; print("Создан товар", iid, r["attributes"]["state"])

    for loc, (n, d) in L.items():
        asc.req("/v1/inAppPurchaseLocalizations", "POST", {"data": {"type": "inAppPurchaseLocalizations",
            "attributes": {"locale": loc, "name": n, "description": d},
            "relationships": {"inAppPurchaseV2": {"data": {"type": "inAppPurchases", "id": iid}}}}})
    print("Языков:", len(L))

    set_prices(iid)

    terr = [t["id"] for t in asc.all_pages("/v1/territories?limit=200")]
    asc.req("/v1/inAppPurchaseAvailabilities", "POST", {"data": {"type": "inAppPurchaseAvailabilities",
        "attributes": {"availableInNewTerritories": True},
        "relationships": {"inAppPurchase": {"data": {"type": "inAppPurchases", "id": iid}},
                          "availableTerritories": {"data": [{"type": "territories", "id": t} for t in terr]}}}})
    print("Стран:", len(terr))
    print("Состояние:", asc.req("/v2/inAppPurchases/%s" % iid)["data"]["attributes"]["state"])

if __name__ == "__main__":
    import sys
    price_only() if sys.argv[1:] == ["price"] else main()
