import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import subprocess
import time
import requests

# Initialize Firebase
# Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
# pointing to your Firebase service account key JSON file
try:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Warning: Failed to initialize Firebase with Application Default Credentials: {e}")
    print("Ensure GOOGLE_APPLICATION_CREDENTIALS is set.")
    # For local development without a key yet, we'll initialize without it
    # Note: This will fail when trying to write to Firestore without valid credentials
    firebase_admin.initialize_app()

db = firestore.client()

# Define targets to monitor
TARGETS = [
    {
        "id": "router",
        "name": "Home Router",
        "type": "network",
        "check_type": "ping",
        "address": "192.168.1.1" # Standard home router IP
    },
    {
        "id": "dns",
        "name": "Public DNS",
        "type": "network",
        "check_type": "ping",
        "address": "8.8.8.8" # Google DNS as a reliable external check
    },
    # Example HTTP check
    # {
    #     "id": "local_web",
    #     "name": "Local Web App",
    #     "type": "container",
    #     "check_type": "http",
    #     "address": "http://localhost:8080"
    # }
]

def ping(host):
    """
    Returns (True, latency_ms) if host responds to a ping request.
    Otherwise returns (False, 0).
    """
    # Use standard ping command (adjust count/timeout based on OS)
    # -c 1: send 1 packet
    # -W 1: wait 1 second for a response
    command = ['ping', '-c', '1', '-W', '1', host]

    start_time = time.time()
    try:
        # Run the ping command
        output = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        end_time = time.time()

        if output.returncode == 0:
            # Calculate latency in ms
            latency_ms = int((end_time - start_time) * 1000)

            # Optional: Try to parse latency from output
            # "time=XX.X ms"
            for line in output.stdout.split('\n'):
                if 'time=' in line:
                    try:
                        time_str = line.split('time=')[1].split(' ')[0]
                        latency_ms = int(float(time_str))
                    except:
                        pass

            return True, latency_ms
        else:
            return False, 0
    except Exception as e:
        print(f"Error pinging {host}: {e}")
        return False, 0

def http_check(url):
    """
    Checks an HTTP endpoint.
    Returns (True, latency_ms) if status code is 200.
    """
    start_time = time.time()
    try:
        response = requests.get(url, timeout=3)
        end_time = time.time()
        latency_ms = int((end_time - start_time) * 1000)

        if response.status_code == 200:
            return True, latency_ms
        return False, 0
    except Exception as e:
        print(f"HTTP check failed for {url}: {e}")
        return False, 0

def check_target(target):
    if target["check_type"] == "ping":
        is_up, latency = ping(target["address"])
    elif target["check_type"] == "http":
        is_up, latency = http_check(target["address"])
    else:
        print(f"Unknown check type: {target['check_type']}")
        return False, 0

    return is_up, latency

def update_firestore(target_id, target_data, is_up, latency_ms):
    """Updates the Firestore document with the latest check results."""
    doc_ref = db.collection('infrastructure').document(target_id)

    status = "UP" if is_up else "DOWN"

    data = {
        "name": target_data["name"],
        "type": target_data["type"],
        "status": status,
        "latencyMs": latency_ms,
        "lastChecked": int(time.time() * 1000) # JS compatible timestamp
    }

    try:
        doc_ref.set(data, merge=True)
        print(f"[{status}] {target_data['name']} ({latency_ms}ms)")
    except Exception as e:
        print(f"Failed to update Firestore for {target_data['name']}: {e}")

def run_loop(interval_seconds=60):
    print(f"Starting Sentinel worker. Checking every {interval_seconds} seconds.")
    print("Press Ctrl+C to stop.")

    try:
        while True:
            print("\n--- Running checks ---")
            for target in TARGETS:
                is_up, latency = check_target(target)
                update_firestore(target["id"], target, is_up, latency)

            print(f"Waiting {interval_seconds} seconds before next check...")
            time.sleep(interval_seconds)
    except KeyboardInterrupt:
        print("\nSentinel worker stopped.")

if __name__ == "__main__":
    # Run the continuous check loop
    # You could also configure this script to run as a cron job by calling the checks once
    # and removing the while loop
    run_loop(interval_seconds=30)
