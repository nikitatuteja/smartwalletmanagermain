import requests

base_url = "http://127.0.0.1:8000/api"

print("Logging in...")
res = requests.post(f"{base_url}/auth/login", json={
    "email": "admin@test.com",
    "password": "AdminPassword123"
})
if res.status_code != 200:
    print("Login failed:", res.text)
    exit(1)

token = res.json().get('access_token')
headers = {"Authorization": f"Bearer {token}"}

endpoints = [
    ("/dashboard", "GET"),
    ("/transactions", "GET"),
    ("/dues", "GET"),
    ("/analytics", "GET"),
    ("/cards", "GET")
]

for ep, method in endpoints:
    print(f"Testing {method} {ep}...")
    try:
        if method == "GET":
            # Some endpoints like /transactions may have a trailing slash in their blueprint mapping if strictly mapped. let's try.
            # wait, /dashboard/ uses /dashboard so we'll try that
            r = requests.get(f"{base_url}{ep}", headers=headers)
        print(f"Result: {r.status_code}")
        if r.status_code == 500:
            print("ERROR on", ep, r.text)
    except Exception as e:
        print("Exception on", ep, e)

