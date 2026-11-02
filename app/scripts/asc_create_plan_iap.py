"""App Store Connect: разовая покупка «Рекомендации на 3 месяца» (€150, решение владельца 2026-11-02).
Тот же порядок, что у разбора (asc_create_review_iap.py — функции берём оттуда), свой товар на приложение:
    python3 app/scripts/asc_create_plan_iap.py vial          # VIA-L:  via_l_specialist_plan
    python3 app/scripts/asc_create_plan_iap.py adam          # ADAM-L: adam_l_specialist_plan
    python3 app/scripts/asc_create_plan_iap.py vial price    # переставить цены
    python3 app/scripts/asc_create_plan_iap.py vial shot     # скриншот для ревью (app/store/images/iap-review/specialist-plan[-adam]-en.png)
Товар создаётся ЧЕРНОВИКОМ. В США блок не показываем (как разбор), но цена США нужна — $164,99 (×3 от $54,99).
"""
import importlib.util, os, sys
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "asc_create_review_iap.py")
spec = importlib.util.spec_from_file_location("rv", _p); rv = importlib.util.module_from_spec(spec); spec.loader.exec_module(rv)

APPS = {"vial": ("6807062006", "via_l_specialist_plan", "VIA-L 3-Month Recommendations", "specialist-plan-en.png"),
        "adam": ("6828101783", "adam_l_specialist_plan", "ADAM-L 3-Month Recommendations", "specialist-plan-adam-en.png")}
# Название ≤ 30 знаков, описание ≤ 45 — предел App Store.
L = {
    "en-US": ("3-Month Recommendations", "Full review and a 3-month plan"),
    "ru":    ("Рекомендации на 3 месяца", "Полный разбор и план на 3 месяца"),
    "uk":    ("Рекомендації на 3 місяці", "Повний розбір і план на 3 місяці"),
    "es-ES": ("Recomendaciones 3 meses", "Análisis completo y plan de 3 meses"),
    "de-DE": ("Empfehlungen für 3 Monate", "Vollständige Auswertung, 3-Monats-Plan"),
    "fr-FR": ("Recommandations 3 mois", "Analyse complète et plan sur 3 mois"),
    "pt-BR": ("Recomendações para 3 meses", "Análise completa e plano de 3 meses"),
    "it":    ("Raccomandazioni per 3 mesi", "Analisi completa e piano di 3 mesi"),
    "pl":    ("Zalecenia na 3 miesiące", "Pełna analiza i plan na 3 miesiące"),
    "he":    ("המלצות ל-3 חודשים", "סקירה מלאה ותוכנית ל-3 חודשים"),
    "ja":    ("3か月のレコメンデーション", "総合分析と3か月のプラン"),
    "ko":    ("3개월 권장 플랜", "전체 분석과 3개월 플랜"),
}
NOTE = ("One-off three-month recommendations from a human nutrition specialist. After purchase the specialist reads the "
        "data the user chose to share (daily metrics, complaints, app summaries, health history, lab photos, food diary) "
        "and gives recommendations on nutrition, exercise, sleep, lifestyle and supplements for three months, which the "
        "user then follows on their own (no ongoing support). For Ukrainian and Russian speakers the recommendations are "
        "given in one live online video meeting (the specialist sends a booking link in the in-app chat within 48 hours); "
        "for other languages, in writing in the in-app chat within 48 hours. 7 days for follow-up questions. Consumable: "
        "each purchase is one set of recommendations. Not a medical service. No external payment.")

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] not in APPS: raise SystemExit("Укажите приложение: vial или adam")
    rv.APP, rv.PID, rv.NAME, rv.SHOT = APPS[a[0]]
    rv.EUR, rv.USD, rv.L, rv.NOTE = "150.0", "164.99", L, NOTE
    {"price": rv.price_only, "shot": rv.shot}.get((a[1:] or [""])[0], rv.main)()
