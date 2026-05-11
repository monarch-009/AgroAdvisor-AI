import os
import sys
import argparse
from pathlib import Path

# Add backend to sys.path for internal imports
sys.path.append(str(Path(__file__).resolve().parent.parent))

from region_analysis.service import RegionAnalysisService

def main():
    parser = argparse.ArgumentParser(description="AgroAdvisor AI: Region Analysis System Initialization")
    parser.add_argument("--train", action="store_true", help="Run ML training and comparison")
    parser.add_argument("--data", type=str, default="../data/datasets/crop-wise-area-production-yield.csv", help="Path to APY dataset")
    
    args = parser.parse_args()
    
    # Resolve absolute path to data
    data_path = Path(__file__).resolve().parent.parent / args.data
    if not data_path.exists():
        print(f"Error: Dataset not found at {data_path}")
        sys.exit(1)

    print("="*60)
    print("AGROADVISOR AI: REGION ANALYSIS TRAINING PIPELINE")
    print("="*60)
    
    service = RegionAnalysisService(str(data_path))
    
    try:
        service.initialize_system(run_ml=args.train)
        print("\n[SUCCESS] Region Analysis System successfully initialized and synced.")
        if args.train:
            print("Models saved to 'models/region_analysis/'")
    except Exception as e:
        print(f"\n[ERROR] Initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
