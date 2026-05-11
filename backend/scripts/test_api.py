import requests
import json

url = "http://127.0.0.1:8001/api/fetch-soil-data"
payload = {
    "state": "MAHARASHTRA",
    "district": "MUMBAI",
    "village": "MUMBAI"
}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
