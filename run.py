 
"""
Find Me - Application Launcher
Made by Legislative
Launches the FastAPI backend and automatically opens Find Me in your web browser locally.
"""

import sys
import os
import webbrowser
import time
import socket

# Ensure repository root is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

def is_port_available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) != 0

def find_available_port(start_port: int = 8000) -> int:
    port = start_port
    while port < start_port + 50:
        if is_port_available(port):
            return port
        port += 1
    return start_port

def main():
    try:
        import uvicorn
    except ImportError:
        print("[ERROR] uvicorn is not installed. Please run: pip install -r requirements.txt")
        sys.exit(1)

    # Check if running on a cloud platform (which provides a PORT environment variable)
    is_production = "PORT" in os.environ
    
    port = int(os.environ.get("PORT", find_available_port(8000)))
    host = "0.0.0.0" if is_production else "127.0.0.1"
    
    print("=" * 70)
    print("  🧭 FIND ME - Public Sector & Global Internship Platform")
    print("  ★ Made by Legislative")
    print("=" * 70)
    print(f"  ➜ Host: {host} | Port: {port}")
    print(f"  ➜ Priority: Government of India (NITI Aayog, RBI, SEBI, ISRO, DRDO, etc.)")
    print(f"  ➜ Skill Up: Skill India, SWAYAM, NPTEL, Google, Microsoft, IBM, AWS")
    print(f"  ➜ Live Feed: Refreshed with visible timestamps & verified portals")
    print(f"  ➜ Press Ctrl+C to stop.")
    print("=" * 70)

    # Only open the web browser if running locally (not on a cloud server)
    if not is_production:
        app_url = f"http://localhost:{port}"
        def open_browser():
            time.sleep(1.2)
            try:
                webbrowser.open(app_url)
            except Exception:
                pass

        import threading
        threading.Thread(target=open_browser, daemon=True).start()

    uvicorn.run("backend.main:app", host=host, port=port, log_level="info")

if __name__ == "__main__":
    main()
