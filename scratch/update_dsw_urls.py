import json

rsb_dsw_urls = {
    "Andhra Pradesh": "https://apsainik.in",
    "Arunachal Pradesh": "https://arunachalpradesh.gov.in/",
    "Assam": "https://dsw.assam.gov.in",
    "Bihar": "https://home.bihar.gov.in/sainik/",
    "Chandigarh (UT)": "https://chandigarh.gov.in/",
    "Chhattisgarh": "https://sainikwelfare.cg.gov.in",
    "Dadra and Nagar Haveli (UT)": "https://dnh.gov.in/",
    "Daman and Diu (UT)": "https://daman.nic.in/",
    "Delhi (NCT)": "https://rsb.delhi.gov.in",
    "Goa": "https://dsw.goa.gov.in",
    "Gujarat": "https://sainikwelfare.gujarat.gov.in",
    "Haryana": "https://sainik.haryana.gov.in",
    "Himachal Pradesh": "https://swdhp.in",
    "Jammu and Kashmir": "https://home.jk.gov.in/sainikwelfare/",
    "Jharkhand": "https://sainikwelfare.jharkhand.gov.in/",
    "Karnataka": "https://sainikwelfare.karnataka.gov.in",
    "Kerala": "https://sainikwelfare.kerala.gov.in",
    "Lakshadweep (UT)": "https://lakshadweep.gov.in/",
    "Madhya Pradesh": "https://sainikkalyan.mp.gov.in",
    "Maharashtra": "https://dsw.maharashtra.gov.in",
    "Manipur": "https://manipur.gov.in/",
    "Meghalaya": "https://dsw.meghalaya.gov.in",
    "Mizoram": "https://sainikwelfare.mizoram.gov.in",
    "Nagaland": "https://dsw.nagaland.gov.in/",
    "Odisha": "https://home.odisha.gov.in/",
    "Puducherry (UT)": "https://sainik.py.gov.in",
    "Punjab": "https://dsw.punjab.gov.in",
    "Rajasthan": "https://sainik.rajasthan.gov.in",
    "Sikkim": "https://sikkim.gov.in/",
    "Tamil Nadu": "https://exwel.tn.gov.in",
    "Telangana": "https://www.telanganasainik.nic.in",
    "Tripura": "https://tripura.gov.in/",
    "Uttarakhand": "https://sainikkalyan.uk.gov.in",
    "Uttar Pradesh": "https://sainikwelfare.up.gov.in/",
    "West Bengal": "https://rsb.wb.gov.in"
}

json_path = r'c:\Coding\Projects\Ex-Serviceman Hub\expo-esm-hub\assets\data\zsb_directory.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    state = item['state']
    if state in rsb_dsw_urls:
        item['url'] = rsb_dsw_urls[state]

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated state RSB/DSW portal URLs successfully!")
