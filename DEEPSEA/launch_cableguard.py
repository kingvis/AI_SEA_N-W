#!/usr/bin/env python3
"""
CableGuard AI Launcher
Can be run from any directory - automatically finds and launches the system
"""

import os
import sys
import subprocess
from pathlib import Path

def find_project_root():
    """Find the CableGuard AI project root directory"""
    current_dir = Path.cwd()
    
    # Look for the cursor directory containing main.py
    possible_paths = [
        current_dir / "DEEPSEA" / "cursor",
        current_dir / "cursor", 
        current_dir,
        current_dir.parent / "DEEPSEA" / "cursor",
        current_dir.parent / "cursor"
    ]
    
    for path in possible_paths:
        if (path / "main.py").exists() and (path / "simulator").exists():
            return path
    
    return None

def main():
    """Launch CableGuard AI from the correct directory"""
    print("🔌 CableGuard AI Launcher")
    print("=" * 30)
    
    # Find project directory
    project_root = find_project_root()
    
    if not project_root:
        print("❌ Could not find CableGuard AI project directory!")
        print("Please ensure you're running this from the project folder or its parent.")
        sys.exit(1)
    
    print(f"📁 Found project at: {project_root}")
    
    # Change to project directory
    os.chdir(project_root)
    print(f"📂 Changed to: {os.getcwd()}")
    
    # Launch the system
    print("🚀 Launching CableGuard AI...")
    try:
        subprocess.run([sys.executable, "main.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error launching system: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n⏹️ System stopped by user")

if __name__ == "__main__":
    main() 