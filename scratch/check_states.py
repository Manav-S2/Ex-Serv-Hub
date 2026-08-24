import json

json_path = r'c:\Coding\Projects\Ex-Serviceman Hub\expo-esm-hub\assets\data\zsb_directory.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    print(f"State: {item['state']} -> Current URL: {item.get('url')}")
