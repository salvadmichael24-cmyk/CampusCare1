import requests

# Test login
login_data = {
    "username": "admin",
    "password": "admin123"
}

print("Testing login...")
login_response = requests.post("http://localhost:5000/api/login", json=login_data)
print(f"Status: {login_response.status_code}")
print(f"Response: {login_response.json()}")
print("-" * 50)

# If login successful, get cookies
if login_response.status_code == 200:
    cookies = login_response.cookies
    
    # Test get reports
    print("Testing get reports...")
    reports_response = requests.get("http://localhost:5000/api/reports", cookies=cookies)
    print(f"Status: {reports_response.status_code}")
    print(f"Response: {reports_response.json()}")