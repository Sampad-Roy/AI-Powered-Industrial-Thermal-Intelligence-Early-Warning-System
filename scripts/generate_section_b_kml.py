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

kml_content = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>SIH26162 - Section B Priority Validation Events (8 Events)</name>
    <description>8 Priority Events requiring Google Earth Pro optical verification before final labeling.</description>

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
    
    questions = ""
    if cid == 101:
        questions = "<li>Is there a visible elevated flare stack, vertical pipe, or chemical refinery derrick?</li><li>Is the hotspot on an active chemical manufacturing site or continuous processing plant?</li>"
    elif cid == 81:
        questions = "<li>Is there a visible factory compound, storage yard, or warehouse at this location?</li><li>Are there visible burn scars, roof damage, or evidence of acute fire incident on April 18-20, 2026?</li>"
    elif cid == 97:
        questions = "<li>Is the hotspot inside the Odhav/Kathwada industrial manufacturing estate?</li><li>Is it located on a warehouse/factory roof or open scrap storage yard?</li>"
    elif cid == 17:
        questions = "<li>Is the hotspot located inside a manufacturing yard or on an open transit/roadside lot?</li><li>Is there evidence of single-day acute structural combustion on March 18, 2026?</li>"
    elif cid == 104:
        questions = "<li>Is the hotspot directly on an industrial shed/factory roof or adjacent open field?</li><li>Is there evidence of sudden acute fire damage on May 9, 2026?</li>"

    kml_content += f"""
    <Placemark>
      <name>{eid} [Cluster {cid} - {cand}]</name>
      <styleUrl>#{style_id}</styleUrl>
      <description><![CDATA[
        <h3><b>Event ID:</b> {eid} (Cluster {cid})</h3>
        <p><b>Candidate Class:</b> {cand}</p>
        <p><b>Acquisition:</b> {acq_d} {acq_t} UTC ({dn})</p>
        <table border="1" cellpadding="4" style="border-collapse: collapse;">
          <tr><th>Parameter</th><th>Value</th></tr>
          <tr><td>Latitude</td><td>{lat:.6f}</td></tr>
          <tr><td>Longitude</td><td>{lon:.6f}</td></tr>
          <tr><td>FRP</td><td><b>{frp:.2f} MW</b></td></tr>
          <tr><td>Brightness TI4</td><td>{ti4:.2f} K</td></tr>
          <tr><td>Delta T (I4-I5)</td><td>{dt:.2f} K</td></tr>
          <tr><td>Distance to Industry</td><td>{dist:.1f} m</td></tr>
          <tr><td>Sentinel-2 NDVI</td><td>{ndvi:.3f}</td></tr>
          <tr><td>Sentinel-2 NDBI</td><td>{ndbi:.3f}</td></tr>
        </table>
        <h4>Google Earth Inspection Questions:</h4>
        <ul>{questions}</ul>
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

with open('data/reports/section_b_events.kml', 'w', encoding='utf-8') as f:
    f.write(kml_content)

print("Successfully generated data/reports/section_b_events.kml")
