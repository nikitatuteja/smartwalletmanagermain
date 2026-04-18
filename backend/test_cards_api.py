import requests
import json

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

print("Fetching cards...")
res = requests.get(f"{base_url}/cards", headers=headers)
print("GET /cards:", res.status_code, res.text)

print("Creating a card...")
res = requests.post(f"{base_url}/cards", headers=headers, json={
    "nickname": "Test Card",
    "last_four": "1234",
    "card_type": "Credit",
    "bank_name": "Test Bank",
    "card_holder": "JOHN DOE"
})
print("POST /cards:", res.status_code, res.text)
