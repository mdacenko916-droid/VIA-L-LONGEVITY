"""App Store Connect API для VIA-L — общие функции (2026-09-24).
Ключ: ~/.appstoreconnect/private_keys/AuthKey_<key_id>.p8, идентификаторы: ~/.appstoreconnect/via-l.json.
Оба файла ВНЕ репозитория (он публичный — GitHub Pages). Использование:
    import importlib.util; spec=importlib.util.spec_from_file_location("asc","app/scripts/asc_api.py")
    asc=importlib.util.module_from_spec(spec); spec.loader.exec_module(asc); asc.req("/v1/apps")
Грабли, на которые наступили:
  • цену ОДОБРЕННОЙ подписки нельзя поставить с startDate=null («Initial price cannot be created again»),
    только датой не раньше чем через 2 дня;
  • limit у вложенных связей — максимум 50, у списков — 200;
  • уровень в группе подписок: 1 — высший; новая подписка с groupLevel=1 НЕ сдвигает старую, править вручную.
"""
import json, time, base64, urllib.request, urllib.parse, urllib.error, os
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
_CFG=json.load(open(os.path.expanduser("~/.appstoreconnect/via-l.json")))   # key_id + issuer_id — вне репозитория
KEY_ID=_CFG["key_id"]; ISSUER=_CFG["issuer_id"]
KEY_PATH=os.path.expanduser("~/.appstoreconnect/private_keys/AuthKey_%s.p8"%KEY_ID)
BASE="https://api.appstoreconnect.apple.com"
_tok=[None,0]
def b64(b): return base64.urlsafe_b64encode(b).rstrip(b"=").decode()
def token():
    if _tok[0] and time.time()<_tok[1]-60: return _tok[0]
    k=serialization.load_pem_private_key(open(KEY_PATH,"rb").read(),password=None)
    now=int(time.time()); exp=now+1100
    h=b64(json.dumps({"alg":"ES256","kid":KEY_ID,"typ":"JWT"}).encode()); p=b64(json.dumps({"iss":ISSUER,"iat":now,"exp":exp,"aud":"appstoreconnect-v1"}).encode())
    der=k.sign((h+"."+p).encode(),ec.ECDSA(hashes.SHA256())); r,s=decode_dss_signature(der)
    sig=b64(r.to_bytes(32,"big")+s.to_bytes(32,"big")); _tok[0]=h+"."+p+"."+sig; _tok[1]=exp; return _tok[0]
def req(path, method="GET", body=None):
    url=path if path.startswith("http") else BASE+path
    r=urllib.request.Request(url,method=method,data=(json.dumps(body).encode() if body is not None else None),
        headers={"Authorization":"Bearer "+token(),"Content-Type":"application/json"})
    try:
        raw=urllib.request.urlopen(r,timeout=90).read()
        return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raise RuntimeError("%s %s → %s %s"%(method,path,e.code,e.read().decode()[:700]))
def all_pages(path):
    out=[]; nxt=path
    while nxt:
        d=req(nxt); out+=d.get("data",[]); nxt=(d.get("links") or {}).get("next")
    return out

def _terr_of(pp_id):
    try:
        s=pp_id+"="*(-len(pp_id)%4); return json.loads(base64.urlsafe_b64decode(s)).get("t")
    except Exception: return None
def sub_point(sub, territory, price):
    for d in all_pages("/v1/subscriptions/%s/pricePoints?filter[territory]=%s&limit=200"%(sub,territory)):
        if d["attributes"]["customerPrice"]==price: return d
    return None
def sub_price_plan(sub, eur, usd):
    base=sub_point(sub,"DEU",eur); us=sub_point(sub,"USA",usd)
    if not base or not us: raise SystemExit("нет ценовой точки %s/%s"%(eur,usd))
    eq=all_pages("/v1/subscriptionPricePoints/%s/equalizations?limit=200"%base["id"])
    plan={"DEU":(base["id"],base["attributes"]["customerPrice"])}
    for d in eq:
        t=_terr_of(d["id"])
        if t: plan[t]=(d["id"],d["attributes"]["customerPrice"])
    plan["USA"]=(us["id"],us["attributes"]["customerPrice"])
    return plan
def sub_apply(sub, plan):
    ok=0
    for t,(pid,_) in sorted(plan.items()):
        req("/v1/subscriptionPrices","POST",{"data":{"type":"subscriptionPrices","attributes":{"startDate":None,"preserveCurrentPrice":False},
            "relationships":{"subscription":{"data":{"type":"subscriptions","id":sub}},
                             "subscriptionPricePoint":{"data":{"type":"subscriptionPricePoints","id":pid}},
                             "territory":{"data":{"type":"territories","id":t}}}}}); ok+=1
    return ok

import hashlib
def fetch_review_png(sub):
    a=req("/v1/subscriptions/%s/appStoreReviewScreenshot"%sub)["data"]["attributes"]; ia=a["imageAsset"]
    url=ia["templateUrl"].replace("{w}",str(ia["width"])).replace("{h}",str(ia["height"])).replace("{f}","png")
    return urllib.request.urlopen(url,timeout=90).read()
def upload_shot(kind, rel_name, rel_type, rel_id, data, fname="paywall.png"):
    r=req("/v1/"+kind,"POST",{"data":{"type":kind,"attributes":{"fileName":fname,"fileSize":len(data)},
        "relationships":{rel_name:{"data":{"type":rel_type,"id":rel_id}}}}})["data"]
    for op in r["attributes"]["uploadOperations"]:
        chunk=data[op["offset"]:op["offset"]+op["length"]]
        rq=urllib.request.Request(op["url"],method=op["method"],data=chunk,headers={h["name"]:h["value"] for h in op.get("requestHeaders",[])})
        urllib.request.urlopen(rq,timeout=120).read()
    req("/v1/%s/%s"%(kind,r["id"]),"PATCH",{"data":{"type":kind,"id":r["id"],"attributes":{"uploaded":True,"sourceFileChecksum":hashlib.md5(data).hexdigest()}}})
    return r["id"]
