#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' 

if ! command -v madge &> /dev/null
then
    echo "Madge is not installed. Please install it first."
    exit 1
fi

if [ -z "$1" ]; then
    echo "Usage: $0 <error_limit>"
    exit 1
fi

error_limit=$1

temp_file=$(mktemp)

echo "Scanning for circular dependencies..."
full_output=$(madge --circular --no-spinner --no-color \
    --ts-config ./tsconfig.json \
    --extensions ts,tsx \
    ./src 2>&1)

# Extract circular count
if echo "$full_output" | grep -q '✖ Found [0-9]\+ circular dependencies'; then
    circular_count=$(echo "$full_output" | grep -o '✖ Found [0-9]\+ circular dependencies' | grep -o '[0-9]\+')
    
    echo "$full_output" 
    
else
    circular_count=0
    echo "No circular dependencies found."
fi

# Clean up
rm "$temp_file"

echo -e "\n═══════════════════════════════════════════════════"
echo "Summary:"
echo "Circular dependency count: $circular_count"
echo "Allowed limit: $error_limit"

if [ "$circular_count" -gt "$error_limit" ]; then
    echo -e "\nError: Circular dependency count ($circular_count) exceeds the limit ($error_limit)."
    exit 1
fi

echo -e "\nCircular dependency count is within the limit."
exit 0