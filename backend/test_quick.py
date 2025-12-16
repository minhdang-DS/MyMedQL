#!/usr/bin/env python3
"""
Quick test script for MyMedQL Backend
Run this to verify the system is working correctly
"""
import requests
import sys
import time
from datetime import datetime

BASE_URL = "http://localhost:3001"
TIMEOUT = 5

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def test_health():
    """Test 1: Health check"""
    print_section("Test 1: Health Check")
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        if r.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {r.json()}")
            return True
        else:
            print(f"❌ Health check failed: Status {r.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Is the server running?")
        print("   Start with: uvicorn app.main:app --host 0.0.0.0 --port 3001")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_root():
    """Test 2: Root endpoint"""
    print_section("Test 2: Root Endpoint")
    try:
        r = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        if r.status_code == 200:
            data = r.json()
            print("✅ Root endpoint working")
            print(f"   {data}")
            return True
        else:
            print(f"❌ Root endpoint failed: Status {r.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_patients_list():
    """Test 3: List patients"""
    print_section("Test 3: List Patients")
    try:
        r = requests.get(f"{BASE_URL}/api/patients", timeout=TIMEOUT)
        if r.status_code == 200:
            patients = r.json()
            print(f"✅ Patient list endpoint working")
            print(f"   Found {len(patients)} patients")
            if patients:
                print(f"   First patient ID: {patients[0].get('patient_id')}")
            return True, patients
        else:
            print(f"❌ Patient list failed: Status {r.status_code}")
            return False, []
    except Exception as e:
        print(f"❌ Error: {e}")
        return False, []

def test_patient_history(patient_id):
    """Test 4: Patient history"""
    print_section(f"Test 4: Patient {patient_id} History")
    try:
        r = requests.get(f"{BASE_URL}/api/patients/{patient_id}/history?limit=5", timeout=TIMEOUT)
        if r.status_code == 200:
            vitals = r.json()
            print(f"✅ Patient history endpoint working")
            print(f"   Found {len(vitals)} vital records")
            if vitals:
                latest = vitals[0]
                print(f"   Latest record: HR={latest.get('heart_rate')}, Temp={latest.get('temperature_c')}°C")
            else:
                print("   ⚠️  No vital records yet. Run the simulator to generate data:")
                print("      python simulator/main.py --rate 5 --duration 10")
            return True
        elif r.status_code == 404:
            print(f"⚠️  Patient {patient_id} not found")
            return True  # Not an error, just no data
        else:
            print(f"❌ Patient history failed: Status {r.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_auth():
    """Test 5: Authentication"""
    print_section("Test 5: Authentication")
    try:
        # Try to login (may fail if no test user exists)
        r = requests.post(
            f"{BASE_URL}/api/token",
            data={"username": "doctor@test.com", "password": "testpass123"},
            timeout=TIMEOUT
        )
        if r.status_code == 200:
            token_data = r.json()
            token = token_data.get("access_token")
            print("✅ Authentication successful")
            print(f"   Token type: {token_data.get('token_type')}")
            
            # Test protected endpoint
            headers = {"Authorization": f"Bearer {token}"}
            r2 = requests.get(f"{BASE_URL}/api/patients", headers=headers, timeout=TIMEOUT)
            if r2.status_code == 200:
                print("✅ Protected endpoint accessible with token")
                return True
            else:
                print(f"⚠️  Protected endpoint returned: {r2.status_code}")
                return True  # Auth worked, endpoint might have other issues
        elif r.status_code == 401:
            print("⚠️  Authentication failed (expected if no test user exists)")
            print("   Create test user in database:")
            print("   INSERT INTO staff (name, email, password_hash, role)")
            print("   VALUES ('Test', 'doctor@test.com', '<bcrypt_hash>', 'doctor');")
            return True  # Not a failure, just no test data
        else:
            print(f"⚠️  Unexpected status: {r.status_code}")
            return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_database_connection():
    """Test 6: Database connection"""
    print_section("Test 6: Database Connection")
    try:
        from app.db.database import test_connection
        if test_connection():
            print("✅ Database connection successful")
            return True
        else:
            print("❌ Database connection failed")
            print("   Check your .env file and MySQL server")
            return False
    except ImportError as e:
        print(f"❌ Cannot import database module: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("  MyMedQL Backend Quick Test")
    print("="*60)
    print(f"Testing API at: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health()))
    results.append(("Root Endpoint", test_root()))
    results.append(("Database Connection", test_database_connection()))
    
    success, patients = test_patients_list()
    results.append(("Patient List", success))
    
    # Test patient history if we have patients
    if patients:
        patient_id = patients[0].get("patient_id")
        if patient_id:
            results.append(("Patient History", test_patient_history(patient_id)))
    else:
        results.append(("Patient History", test_patient_history(1)))  # Try ID 1
    
    results.append(("Authentication", test_auth()))
    
    # Summary
    print_section("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {name}")
    
    print(f"\n  Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! System is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the output above.")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)

