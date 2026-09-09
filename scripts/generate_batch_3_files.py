import pandas as pd

sec_b_ids = [
    'FIRMS_0152', 'FIRMS_0170', # Cluster 101 (Gas Flare)
    'FIRMS_0116', 'FIRMS_0120', # Cluster 81 (Industrial Fire)
    'FIRMS_0146', 'FIRMS_0147', # Cluster 97 (Industrial Fire)
    'FIRMS_0029',               # Cluster 17 (Industrial Fire)
    'FIRMS_0156'                # Cluster 104 (Industrial Fire)
]

hls = pd.read_csv('data/reports/HUMAN_LABELING_SHEET.csv')
sub = hls[hls['event_id'].isin(sec_b_ids)].copy()

# Sort to maintain logical order
sub['sort_key'] = sub['event_id'].map({eid: i for i, eid in enumerate(sec_b_ids)})
sub = sub.sort_values('sort_key').drop(columns=['sort_key'])

# 1. Create KML File
kml_content = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>SIH26162 - Batch 3 Priority Validation Events (8 Events)</name>
    <description>Batch 3 priority events (Gas Flare and Industrial Fire candidates) for optical verification in Google Earth Pro.</description>

    <!-- Styles -->
    <Style id="gasFlareStyle">
      <IconStyle>
        <scale>1.3</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/flame.png</href></Icon>
        <color>ff00ffff</color>
      </IconStyle>
    </Style>
    <Style id="industrialFireStyle">
      <IconStyle>
        <scale>1.3</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/firedept.png</href></Icon>
        <color>ff0000ff</color>
      </IconStyle>
    </Style>
"""

for _, r in sub.iterrows():
    eid = r['event_id']
    cid = int(r['cluster_id'])
    lat = r['latitude']
    lon = r['longitude']
    cand = 'Gas Flare' if cid == 101 else 'Industrial Fire'
    style_id = 'gasFlareStyle' if cid == 101 else 'industrialFireStyle'
    frp = r['frp']
    ti4 = r['bright_ti4']
    dt = r['delta_ti4_ti5']
    dist = r['nearest_industry_distance_m']
    ndvi = r['NDVI']
    ndbi = r['NDBI']
    acq_d = r['acq_date']
    acq_t = r['acq_time']
    dn = 'Day' if r['daynight'] == 1 else 'Night'
    
    if cid == 101:
        checklist = "<li>Check for visible elevated vertical flare stack or combustion derrick.</li><li>Confirm active chemical synthesis or gas-handling processing works.</li>"
    elif cid == 81:
        checklist = "<li>Inspect warehouse/factory compound at this site.</li><li>Look for severe scorch marks, roof destruction, or fire incident evidence on April 18-20, 2026.</li>"
    elif cid == 97:
        checklist = "<li>Confirm hotspot is on industrial factory/warehouse roofs in Odhav/Kathwada GIDC.</li><li>Inspect for acute fire damage or smoke plume on April 29, 2026.</li>"
    elif cid == 17:
        checklist = "<li>Verify if hotspot is located inside an enclosed manufacturing yard vs open roadside/transit lot.</li><li>Check for single-day acute structural fire damage on March 18, 2026.</li>"
    elif cid == 104:
        checklist = "<li>Check if hotspot falls directly over an industrial factory shed.</li><li>Inspect for acute structural damage on May 9, 2026.</li>"

    kml_content += f"""
    <Placemark>
      <name>{eid} [Cluster {cid} - {cand}]</name>
      <styleUrl>#{style_id}</styleUrl>
      <description><![CDATA[
        <h3><b>Event ID:</b> {eid} (Cluster {cid})</h3>
        <p><b>Candidate Class:</b> {cand}</p>
        <p><b>Acquisition:</b> {acq_d} {acq_t} UTC ({dn})</p>
        <table border="1" cellpadding="4" style="border-collapse: collapse;">
          <tr><th>Parameter</th><th>Measurement</th></tr>
          <tr><td>Latitude</td><td>{lat:.6f}</td></tr>
          <tr><td>Longitude</td><td>{lon:.6f}</td></tr>
          <tr><td>FRP</td><td><b>{frp:.2f} MW</b></td></tr>
          <tr><td>TI4 / Brightness</td><td>{ti4:.2f} K</td></tr>
          <tr><td>Delta T (TI4 - TI5)</td><td>{dt:.2f} K</td></tr>
          <tr><td>Distance to Industry</td><td>{dist:.1f} m</td></tr>
          <tr><td>NDVI</td><td>{ndvi:.3f}</td></tr>
          <tr><td>NDBI</td><td>{ndbi:.3f}</td></tr>
        </table>
        <h4>Google Earth Inspection Checklist:</h4>
        <ul>{checklist}</ul>
      ]]></description>
      <Point>
        <coordinates>{lon:.6f},{lat:.6f},0</coordinates>
      </Point>
    </Placemark>
"""

kml_content += """
  </Document>
</kml>
"""

with open('data/reports/batch_3_events.kml', 'w', encoding='utf-8') as f:
    f.write(kml_content)

print("Successfully created data/reports/batch_3_events.kml")

# 2. Create BATCH_3_HUMAN_REVIEW.md
md_lines = []
md_lines.append("# Batch 3: Priority Human & Google Earth Verification Protocol")
md_lines.append("**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  ")
md_lines.append("**Dataset Target**: `data/reports/HUMAN_LABELING_SHEET.csv`  ")
md_lines.append("**KML Placemark File**: [`data/reports/batch_3_events.kml`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/batch_3_events.kml)  ")
md_lines.append("**Status**: Human Optical Verification in Progress (Zero Premature Labels / Zero Files Modified)  ")
md_lines.append("")
md_lines.append("---")
md_lines.append("")
md_lines.append("## 1. Master Event Inspection Table (8 Events)")
md_lines.append("")
md_lines.append("| event_id | Cluster | Candidate Class | Coordinates (Lat, Lon) | Acquisition (UTC) | FRP (MW) | Brightness TI4 (K) | Delta T (K) | Dist to Industry (m) | NDVI | NDBI | Short Google Earth Inspection Checklist |")
md_lines.append("| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |")

for _, r in sub.iterrows():
    eid = r['event_id']
    cid = int(r['cluster_id'])
    lat = r['latitude']
    lon = r['longitude']
    cand = 'Gas Flare' if cid == 101 else 'Industrial Fire'
    frp = r['frp']
    ti4 = r['bright_ti4']
    dt = r['delta_ti4_ti5']
    dist = r['nearest_industry_distance_m']
    ndvi = r['NDVI']
    ndbi = r['NDBI']
    acq_d = r['acq_date']
    acq_t = r['acq_time']
    dn = 'Day' if r['daynight'] == 1 else 'Night'
    
    if cid == 101:
        chk = "Inspect for elevated flare stack / derrick at chemical works."
    elif cid == 81:
        chk = "Inspect warehouse compound for severe scorch / fire damage."
    elif cid == 97:
        chk = "Inspect Odhav/Kathwada GIDC factory roof for acute fire damage."
    elif cid == 17:
        chk = "Inspect manufacturing yard vs open transport lot layout."
    elif cid == 104:
        chk = "Inspect industrial factory shed for acute fire damage on May 9."
        
    md_lines.append(f"| **`{eid}`** | `{cid}` | **{cand}** | `{lat:.6f}, {lon:.6f}` | {acq_d} {acq_t} ({dn}) | **{frp:.2f}** | {ti4:.2f} | **{dt:.2f}** | {dist:.1f} | {ndvi:.3f} | {ndbi:.3f} | {chk} |")

md_lines.append("")
md_lines.append("---")
md_lines.append("")
md_lines.append("## 2. Detailed Cluster-by-Cluster Inspection Guide")
md_lines.append("")
md_lines.append("### A. Cluster 101 — Gas Flare Candidate (2 Events)")
md_lines.append("- **Events**: `FIRMS_0152` (Day, May 7, FRP = 7.03 MW, Delta T = 33.27 K) and `FIRMS_0170` (Night, May 17, FRP = 1.51 MW, Delta T = 21.32 K)")
md_lines.append("- **Inspection Center**: `(23.024140, 72.267650)` (Sanand / Viramgam industrial corridor)")
md_lines.append("- **Key Checklist Items**:")
md_lines.append("  1. Is there an elevated vertical flare stack, chemical distillation column, or refinery derrick structure?")
md_lines.append("  2. Is the site an operational chemical synthesis or gas processing facility?")
md_lines.append("  3. Does the thermal emission originate from a point-source combustion stack rather than an open ground area?")
md_lines.append("")
md_lines.append("### B. Cluster 81 — Industrial Fire Candidate (2 Events)")
md_lines.append("- **Events**: `FIRMS_0116` (Day, April 18, FRP = 3.28 MW) and `FIRMS_0120` (Day, April 20, **FRP = 27.49 MW [Dataset Maximum Spike]**)")
md_lines.append("- **Inspection Center**: `(22.782300, 72.346600)` (Dholka / Bavla industrial corridor)")
md_lines.append("- **Key Checklist Items**:")
md_lines.append("  1. What type of facility exists at this coordinate (warehouse, chemical plant, open storage yard, or scrap lot)?")
md_lines.append("  2. Is there visible structural fire destruction, collapsed metal roofing, or black burn perimeter marks?")
md_lines.append("  3. Does the massive 27.49 MW spike correspond to an uncontrolled accidental blaze?")
md_lines.append("")
md_lines.append("### C. Cluster 97 — Industrial Fire Candidate (2 Events)")
md_lines.append("- **Events**: `FIRMS_0146` (Day, April 29, FRP = 9.26 MW, TI4 = 348.11 K, Delta T = 36.07 K) and `FIRMS_0147` (Day, April 29, FRP = 5.51 MW)")
md_lines.append("- **Inspection Center**: `(23.018060, 72.674790)` (Odhav / Kathwada GIDC Industrial Estate)")
md_lines.append("- **Key Checklist Items**:")
md_lines.append("  1. Are the hotspots situated directly on industrial manufacturing sheds or warehouses inside Odhav GIDC?")
md_lines.append("  2. Is there evidence of sudden acute fire damage or smoke plume on April 29, 2026?")
md_lines.append("  3. Are both points part of the same industrial fire incident?")
md_lines.append("")
md_lines.append("### D. Cluster 17 — Industrial Fire Candidate (1 Event)")
md_lines.append("- **Event**: `FIRMS_0029` (Day, March 18, FRP = 3.01 MW, Delta T = 26.12 K)")
md_lines.append("- **Inspection Center**: `(23.024530, 72.598130)` (Central Ahmedabad industrial / railway transit corridor)")
md_lines.append("- **Key Checklist Items**:")
md_lines.append("  1. Is the point situated inside an enclosed industrial manufacturing yard or on an open transit/roadside lot?")
md_lines.append("  2. Is there evidence of single-day acute structural combustion on March 18, 2026?")
md_lines.append("")
md_lines.append("### E. Cluster 104 — Industrial Fire Candidate (1 Event)")
md_lines.append("- **Event**: `FIRMS_0156` (Day, May 9, FRP = 2.34 MW, Delta T = 28.48 K, NDBI = +0.201)")
md_lines.append("- **Inspection Center**: `(22.801090, 72.339340)` (Bavla manufacturing corridor, 2.3 km north of Cluster 81)")
md_lines.append("- **Key Checklist Items**:")
md_lines.append("  1. Is the hotspot located directly on an industrial shed / factory roof?")
md_lines.append("  2. Is there visual evidence of sudden acute fire damage on May 9, 2026?")

with open('data/reports/BATCH_3_HUMAN_REVIEW.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines))

print("Successfully created data/reports/BATCH_3_HUMAN_REVIEW.md")
