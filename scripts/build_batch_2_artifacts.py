import os
import pandas as pd

# Load dataset
df = pd.read_csv(os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv"))

# Selected 15 events across 7 clusters:
# Cluster 101 (Gas Flare candidate)
# Cluster 081 & Cluster 017 (Industrial Fire candidates)
# Cluster 007 & Cluster 021 (Other Thermal Source candidates)
# Cluster 028 & Cluster 094 (Persistent Industrial Heat candidates)
selected_clusters = [101, 81, 17, 7, 21, 28, 94, 56]
sub = df[df['cluster_id'].isin(selected_clusters)].sort_values(
    by=['cluster_id', 'acq_date', 'event_id']
).reset_index(drop=True)

print(f"Loaded {len(sub)} events for Batch 2:")

# Dictionary of specific concrete Google Earth visual questions and evidence needed
inspection_data = {
    'FIRMS_0152': {
        'visual_question': 'Is there an elevated flare derrick/stack or active chemical/petroleum processing plant with burner piping at 23.02414°N, 72.26765°E?',
        'evidence_needed': 'Presence of tall vertical flare pipe with burner tip, knock-out drums, or refinery cracking tower.',
        'action': 'Inspect for elevated flare stack structure vs enclosed factory roof.'
    },
    'FIRMS_0170': {
        'visual_question': 'At 23.02804°N, 72.26569°E (~450m north of FIRMS_0152), does the nocturnal hotspot align with the same chemical works or an adjoining industrial facility?',
        'evidence_needed': 'Confirmation of contiguous industrial works boundary and continuous nocturnal furnace/stack operations.',
        'action': 'Verify if FIRMS_0152 and FIRMS_0170 originate from the same industrial facility plot.'
    },
    'FIRMS_0116': {
        'visual_question': 'At 22.78016°N, 72.34639°E, is the hotspot on an industrial warehouse, factory yard, or adjacent open plot?',
        'evidence_needed': 'Industrial plant boundary confirmation, roof condition, and lack of long-term operational furnaces.',
        'action': 'Examine pre-event (pre-April 18) optical imagery for facility type.'
    },
    'FIRMS_0120': {
        'visual_question': 'At 22.78230°N, 72.34660°E, does April/May 2026 imagery show post-burn blackened scars, damaged roof panels, or an open storage yard fire?',
        'evidence_needed': 'Visual burn scar, charred ground/roof, or local fire dispatch confirmation for 27.5 MW extreme heat spike on 2026-04-20.',
        'action': 'Compare April 2026 Sentinel-2 / Google Earth imagery before vs after April 20 for fire scar evidence.'
    },
    'FIRMS_0029': {
        'visual_question': 'At 23.02453°N, 72.59813°E (769m to industry), is the anomaly located on an open storage yard, recycling lot, or factory building?',
        'evidence_needed': 'Identification of specific commercial/industrial yard vs residential/vegetation parcel.',
        'action': 'Inspect satellite basemap for open scrap/waste yard or factory structure.'
    },
    'FIRMS_0009': {
        'visual_question': 'At 22.91476°N, 72.33144°E (4.5 km from industry, NDVI=0.69), is the hotspot situated inside an open cultivated agricultural field?',
        'evidence_needed': 'Agricultural crop field parcel boundaries, absence of buildings/factories, and post-harvest stubble pattern.',
        'action': 'Confirm open agricultural farmland and zero industrial infrastructure.'
    },
    'FIRMS_0010': {
        'visual_question': 'At 22.91593°N, 72.32841°E (~300m from FIRMS_0009), does this simultaneous overpass confirm an agricultural field fire front moving across crop plots?',
        'evidence_needed': 'Adjacent farm field parcels with crop residue burn signatures.',
        'action': 'Confirm agricultural stubble fire front co-located with FIRMS_0009.'
    },
    'FIRMS_0033': {
        'visual_question': 'At 22.97641°N, 72.43799°E (3.9 km from industry, NDVI=0.50), is the location active farmland or rural scrubland?',
        'evidence_needed': 'Cultivated field patterns, farm access roads, and absence of industrial structures.',
        'action': 'Confirm rural agricultural crop parcel.'
    },
    'FIRMS_0034': {
        'visual_question': 'At 22.97737°N, 72.43770°E (NDVI=0.874, highest in dataset), is the anomaly situated in dense irrigated vegetation/crop land?',
        'evidence_needed': 'Dense crop canopy / vegetation parcel confirming open-air biomass burning.',
        'action': 'Confirm open agricultural crop burning in dense vegetation.'
    },
    'FIRMS_0044': {
        'visual_question': 'At 22.81513°N, 72.38505°E (795m to industry, NDBI=+0.22), is there a foundry, brick kiln, or steel re-rolling facility?',
        'evidence_needed': 'Heavy industrial sheds, kilns, chimney stacks, or bulk material storage yards.',
        'action': 'Inspect facility type and check for continuous kiln/furnace operation.'
    },
    'FIRMS_0110': {
        'visual_question': 'At 22.81889°N, 72.38586°E (1.1 km to industry), does this 13.4 MW thermal source originate from the same industrial complex as FIRMS_0044?',
        'evidence_needed': 'Continuity of industrial plant buildings across the 22-day span (March 23 to April 14).',
        'action': 'Verify if FIRMS_0110 and FIRMS_0044 are co-located at the same manufacturing works.'
    },
    'FIRMS_0111': {
        'visual_question': 'At 22.81947°N, 72.39011°E (1.5 km to industry), does this 17.0 MW spike on April 14 represent an adjoining kiln/furnace unit or open lot?',
        'evidence_needed': 'Industrial plant boundary alignment vs rural boundary edge.',
        'action': 'Determine whether location is inside factory compound or edge boundary.'
    },
    'FIRMS_0140': {
        'visual_question': 'At 23.01382°N, 72.33582°E (494m to industry), is this nocturnal detection (20:37 UTC) centered over an industrial processing plant?',
        'evidence_needed': 'Factory shed roof, boiler house, or industrial boundary alignment.',
        'action': 'Check nighttime heat source location relative to factory roof.'
    },
    'FIRMS_0183': {
        'visual_question': 'At 23.01477°N, 72.33630°E (512m to industry, 26 days after FIRMS_0140), does this second nocturnal detection confirm recurring operational process heat?',
        'evidence_needed': 'Identical factory compound location with steady low-FRP nocturnal heat emission.',
        'action': 'Confirm multi-date nocturnal persistence over the same factory building.'
    }
}

# ================= 1. BUILD BATCH_2_HUMAN_REVIEW.md =================
md_lines = [
    "# Batch 2 Human Validation Review & Google Earth Inspection Manual",
    "**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  ",
    "**Artifact Target**: 15 Selected Priority Events Across 7 Clusters  ",
    "**Date**: September 9, 2026  ",
    "**Status**: Pre-Validation Review (Zero Labels Assigned / Zero CSV Modifications)  ",
    "",
    "---",
    "",
    "## 1. Batch 2 Overview & Class Diversity Strategy",
    "",
    "Batch 2 introduces balanced class diversity across the remaining 173 unvalidated events:",
    "1. **Gas Flare Candidate**: `Cluster_101` (2 events with Day+Night industrial works presence and $\\Delta T = 33.3\\text{ K}$)",
    "2. **Industrial Fire Candidates**: `Cluster_081` (2 events, including the dataset maximum $27.49\\text{ MW}$ spike) & `Cluster_017` (1 event)",
    "3. **Other Thermal Source Candidates**: `Cluster_007` (2 events, $\\text{NDVI} = 0.69$) & `Cluster_021` (2 events, $\\text{NDVI} = 0.87$)",
    "4. **Persistent Industrial Heat Candidates**: `Cluster_028` (3 events, 22d span, $\\text{FRP} = 12.8\\text{ MW}$) & `Cluster_094` (2 nocturnal events, 26d span)",
    "",
    "---",
    "",
    "## 2. Cluster-by-Cluster Detailed Event Records & Inspection Checklists",
    ""
]

# Group by cluster
for cid, g in sub.groupby('cluster_id'):
    c_cand = g['candidate_class'].iloc[0]
    u_dates = g['cluster_unique_dates'].iloc[0]
    span = g['cluster_span_days'].iloc[0]
    mean_dist = g['nearest_industry_distance_m'].mean()
    ctx_str = g['osm_context_summary'].iloc[0] if pd.notna(g['osm_context_summary'].iloc[0]) else "Landuse: industrial"
    
    md_lines.append(f"### Cluster `{cid:03d}` ({len(g)} Events | Candidate: **{c_cand}**)")
    md_lines.append(f"- **Recurrence & Dates**: `{u_dates} Unique Date(s)` | Temporal Span: `{span} Days`")
    md_lines.append(f"- **Spatial Context**: Average Distance to Industry: `{mean_dist:.1f} m` | Context: `{ctx_str}`")
    md_lines.append("")
    md_lines.append("| Event ID | Date & Time (UTC) | Lat, Lon | Day/Night | FRP (MW) | TI4 (K) | TI5 (K) | $\\Delta T$ (K) | Dist (m) | NDVI | NDBI | NDWI | Conf |")
    md_lines.append("| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |")
    
    for idx, r in g.iterrows():
        dn_str = "Day (1)" if r['daynight'] == 1 else "Night (0)"
        md_lines.append(
            f"| `{r['event_id']}` | {r['acq_date']} {r['acq_time']} | `{r['latitude']:.5f}, {r['longitude']:.5f}` | {dn_str} | {r['frp']:.2f} | {r['bright_ti4']:.2f} | {r['bright_ti5']:.2f} | {r['delta_ti4_ti5']:.2f} | {r['nearest_industry_distance_m']:.1f} | {r['NDVI']:.3f} | {r['NDBI']:.3f} | {r['NDWI']:.3f} | `{r['confidence']}` |"
        )
    md_lines.append("")
    md_lines.append("#### Google Earth Visual Inspection Protocol:")
    for idx, r in g.iterrows():
        ev_id = r['event_id']
        info = inspection_data.get(ev_id, {})
        md_lines.append(f"- **`{ev_id}` (`{r['latitude']:.5f}°N, {r['longitude']:.5f}°E`)**:")
        md_lines.append(f"  - *Target Question*: {info.get('visual_question', 'Inspect satellite basemap.')}")
        md_lines.append(f"  - *Critical Evidence Needed*: {info.get('evidence_needed', 'Structural verification.')}")
        md_lines.append(f"  - *Verification Action*: {info.get('action', 'Verify ground structure.')}")
    md_lines.append("")
    md_lines.append("---")
    md_lines.append("")

# Summary table at the end
md_lines.append("## 3. Human Review Summary & Decision Matrix")
md_lines.append("")
md_lines.append("| Event ID | Cluster | Candidate Class | Google Earth Visual Inspection Question | Critical Evidence Needed | Recommended Action |")
md_lines.append("| :--- | :---: | :--- | :--- | :--- | :--- |")

for idx, r in sub.iterrows():
    ev_id = r['event_id']
    info = inspection_data.get(ev_id, {})
    md_lines.append(
        f"| `{ev_id}` | `Cluster_{r['cluster_id']:03d}` | **{r['candidate_class']}** | {info.get('visual_question')} | {info.get('evidence_needed')} | {info.get('action')} |"
    )

md_lines.append("")
md_lines.append("---")
md_lines.append("")
md_lines.append("## 4. Next Step for Annotator")
md_lines.append("1. Open [`data/reports/batch_2_events.kml`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/batch_2_events.kml) in Google Earth Pro.")
md_lines.append("2. Inspect each cluster sequentially (Cluster 101 -> 081 -> 017 -> 007 -> 021 -> 028 -> 094).")
md_lines.append("3. Answer the visual inspection questions and provide your validation decision.")

review_md_content = "\n".join(md_lines)
review_md_path = os.path.join("data", "reports", "BATCH_2_HUMAN_REVIEW.md")
with open(review_md_path, "w", encoding="utf-8") as f:
    f.write(review_md_content)
print(f"Saved {review_md_path}")

# ================= 2. BUILD batch_2_events.kml =================
kml_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2">',
    '  <Document>',
    '    <name>SIH26162 - Batch 2 Priority Human Review (15 Events)</name>',
    '    <description>Prioritized 15 multi-sensor thermal anomaly events across 7 clusters for Google Earth visual inspection.</description>',
    '    ',
    '    <!-- Class Styles -->',
    '    <Style id="gasFlareStyle">',
    '      <IconStyle>',
    '        <color>ffff00ff</color>', # Magenta/Purple
    '        <scale>1.2</scale>',
    '        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/flame.png</href></Icon>',
    '      </IconStyle>',
    '      <LabelStyle><scale>0.9</scale></LabelStyle>',
    '    </Style>',
    '    <Style id="industrialFireStyle">',
    '      <IconStyle>',
    '        <color>ff0000ff</color>', # Red
    '        <scale>1.2</scale>',
    '        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/firedept.png</href></Icon>',
    '      </IconStyle>',
    '      <LabelStyle><scale>0.9</scale></LabelStyle>',
    '    </Style>',
    '    <Style id="otherThermalStyle">',
    '      <IconStyle>',
    '        <color>ff00ff00</color>', # Green
    '        <scale>1.1</scale>',
    '        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon>',
    '      </IconStyle>',
    '      <LabelStyle><scale>0.9</scale></LabelStyle>',
    '    </Style>',
    '    <Style id="persistentHeatStyle">',
    '      <IconStyle>',
    '        <color>ffffaa00</color>', # Cyan/Blue
    '        <scale>1.1</scale>',
    '        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/cabs.png</href></Icon>',
    '      </IconStyle>',
    '      <LabelStyle><scale>0.9</scale></LabelStyle>',
    '    </Style>',
    '    <Style id="clusterCentroidStyle">',
    '      <IconStyle>',
    '        <color>ff00ffff</color>', # Yellow
    '        <scale>1.4</scale>',
    '        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/target.png</href></Icon>',
    '      </IconStyle>',
    '    </Style>',
    '    '
]

# Add folder per cluster
for cid, g in sub.groupby('cluster_id'):
    c_cand = g['candidate_class'].iloc[0]
    kml_lines.append(f'    <Folder>')
    kml_lines.append(f'      <name>Cluster {cid:03d} ({c_cand} - {len(g)} Events)</name>')
    
    # Cluster centroid
    c_lat = g['latitude'].mean()
    c_lon = g['longitude'].mean()
    kml_lines.append(f'      <Placemark>')
    kml_lines.append(f'        <name>Cluster {cid:03d} Centroid</name>')
    kml_lines.append(f'        <styleUrl>#clusterCentroidStyle</styleUrl>')
    kml_lines.append(f'        <description><![CDATA[')
    kml_lines.append(f'          <h3>Cluster {cid:03d} Centroid</h3>')
    kml_lines.append(f'          <p><b>Candidate:</b> {c_cand}<br/>')
    kml_lines.append(f'          <b>Events:</b> {len(g)}<br/>')
    kml_lines.append(f'          <b>Coordinates:</b> {c_lat:.5f}°N, {c_lon:.5f}°E<br/>')
    kml_lines.append(f'          <b>Mean FRP:</b> {g["frp"].mean():.2f} MW<br/>')
    kml_lines.append(f'          <b>Mean Distance to Industry:</b> {g["nearest_industry_distance_m"].mean():.1f} m</p>')
    kml_lines.append(f'        ]]></description>')
    kml_lines.append(f'        <Point><coordinates>{c_lon:.6f},{c_lat:.6f},0</coordinates></Point>')
    kml_lines.append(f'      </Placemark>')
    
    for idx, r in g.iterrows():
        ev_id = r['event_id']
        lat = r['latitude']
        lon = r['longitude']
        date_str = r['acq_date']
        time_str = r['acq_time']
        frp = r['frp']
        ti4 = r['bright_ti4']
        ti5 = r['bright_ti5']
        delta_t = r['delta_ti4_ti5']
        dist = r['nearest_industry_distance_m']
        ndvi = r['NDVI']
        ndbi = r['NDBI']
        ndwi = r['NDWI']
        conf = r['confidence']
        cand = r['candidate_class']
        info = inspection_data.get(ev_id, {})
        
        # Style selection
        if 'Gas Flare' in cand:
            style_id = '#gasFlareStyle'
        elif 'Industrial Fire' in cand:
            style_id = '#industrialFireStyle'
        elif 'Other Thermal Source' in cand:
            style_id = '#otherThermalStyle'
        else:
            style_id = '#persistentHeatStyle'
            
        desc_html = f"""<![CDATA[
          <div style="font-family: Arial, sans-serif; font-size: 13px; max-width: 320px;">
            <h3 style="margin: 0 0 6px 0; color: #003366;">{ev_id} (Cluster {cid})</h3>
            <p style="margin: 0 0 8px 0;"><b>Candidate Class:</b> <span style="color: #b30000; font-weight: bold;">{cand}</span></p>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td><b>Date/Time:</b></td><td>{date_str} {time_str} UTC</td></tr>
              <tr><td><b>FRP:</b></td><td>{frp:.2f} MW</td></tr>
              <tr><td><b>TI4 / TI5:</b></td><td>{ti4:.1f} K / {ti5:.1f} K</td></tr>
              <tr><td><b>Delta T:</b></td><td>{delta_t:.1f} K</td></tr>
              <tr><td><b>Dist to Industry:</b></td><td>{dist:.1f} m</td></tr>
              <tr><td><b>NDVI / NDBI:</b></td><td>{ndvi:.3f} / {ndbi:.3f}</td></tr>
              <tr><td><b>Confidence:</b></td><td>{conf}</td></tr>
            </table>
            <hr style="margin: 8px 0;"/>
            <p style="margin: 0; font-size: 12px; color: #222;"><b>Visual Question:</b><br/>{info.get('visual_question', 'Inspect ground.')}</p>
          </div>
        ]]>"""
        
        kml_lines.append(f'      <Placemark>')
        kml_lines.append(f'        <name>{ev_id} ({date_str})</name>')
        kml_lines.append(f'        <styleUrl>{style_id}</styleUrl>')
        kml_lines.append(f'        <description>{desc_html}</description>')
        kml_lines.append(f'        <Point><coordinates>{lon:.6f},{lat:.6f},0</coordinates></Point>')
        kml_lines.append(f'      </Placemark>')
        
    kml_lines.append(f'    </Folder>')

kml_lines.append('  </Document>')
kml_lines.append('</kml>')

kml_content = "\n".join(kml_lines)
kml_path = os.path.join("data", "reports", "batch_2_events.kml")
with open(kml_path, "w", encoding="utf-8") as f:
    f.write(kml_content)
print(f"Saved {kml_path}")
