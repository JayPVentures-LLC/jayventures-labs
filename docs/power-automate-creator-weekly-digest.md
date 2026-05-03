# Power Automate Creator Weekly Digest

## Flow Name Schedule And Timezone
- Flow name: Creator Weekly Digest
- Start: Next Monday
- Frequency: Weekly
- Interval: 1
- Day: Monday
- Time: 9:00 AM
- Timezone: Your local timezone

## HTTP GET Call To Creator Metrics
- Method: GET
- URI: https://your-worker-domain/creator/metrics
- Headers
  - Key: Authorization
  - Value: Bearer ADMIN_UPLOAD_TOKEN

## Parse JSON Schema
```json
{
  "type": "object",
  "properties": {
    "summary": {
      "type": "object",
      "properties": {
        "windowDays": { "type": "number" },
        "totalViews": { "type": "number" },
        "totalProfileViews": { "type": "number" },
        "totalLikes": { "type": "number" },
        "totalComments": { "type": "number" },
        "totalShares": { "type": "number" },
        "avgEngagementRate": { "type": "number" },
        "spikesDetected": { "type": "number" },
        "topCTA": { "type": "string" }
      }
    },
    "spikes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "dayIndex": { "type": "number" },
          "dateLabel": { "type": "string" },
          "views": { "type": "number" },
          "profileViews": { "type": "number" },
          "likes": { "type": "number" },
          "comments": { "type": "number" },
          "shares": { "type": "number" },
          "engagementRate": { "type": "number" },
          "rollingAvg": { "type": "number" },
          "spikeMultiplier": { "type": "number" },
          "recommendedCTA": { "type": "string" }
        }
      }
    }
  }
}
```

## Initialize Variables
- SpikeRowsHtml as String, empty
- SpikeCount as Integer, 0

## Apply To Each Build Spike Rows
- Loop over spikes from Parse JSON
- Increment SpikeCount by 1
- Condition: SpikeCount less than or equal to 8
- If yes, append to SpikeRowsHtml

```html
<div style="display:flex; gap:10px; padding:12px 14px; border-top:1px solid rgba(255,255,255,.06); background:rgba(12,14,18,.15); font-size:12px">
  <div style="width:120px; font-weight:600">x@{formatNumber(item()?['spikeMultiplier'],'0.0')}</div>
  <div style="width:220px; opacity:.75">@{item()?['dateLabel']}</div>
  <div style="flex:1; opacity:.9">@{item()?['recommendedCTA']}</div>
</div>
```

## Compose HTML Email Template
```html
<div style="font-family:Segoe UI,Arial; background:#0b0d10; color:#fff; padding:26px; border-radius:16px; max-width:860px">
  <div style="font-size:13px; text-transform:uppercase; letter-spacing:1px; opacity:.7">
    Creator Command Center Weekly Digest
  </div>

  <div style="margin-top:10px; font-size:20px; font-weight:600">
    jaypventures creator
  </div>

  <div style="margin-top:8px; font-size:13px; opacity:.7; line-height:1.45">
    Premium transparency snapshot based on your last @{body('Parse_JSON')?['summary']?['windowDays']} days of creator activity.
  </div>

  <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:18px">
    <div style="flex:1; min-width:200px; background:rgba(25,28,34,.85); border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:14px">
      <div style="font-size:11px; opacity:.6; text-transform:uppercase">Spike events detected</div>
      <div style="font-size:18px; font-weight:600; margin-top:6px">@{body('Parse_JSON')?['summary']?['spikesDetected']}</div>
    </div>

    <div style="flex:1; min-width:200px; background:rgba(25,28,34,.85); border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:14px">
      <div style="font-size:11px; opacity:.6; text-transform:uppercase">Top recommended CTA</div>
      <div style="font-size:14px; font-weight:600; margin-top:6px">@{body('Parse_JSON')?['summary']?['topCTA']}</div>
    </div>

    <div style="flex:1; min-width:200px; background:rgba(25,28,34,.85); border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:14px">
      <div style="font-size:11px; opacity:.6; text-transform:uppercase">Engagement efficiency</div>
      <div style="font-size:18px; font-weight:600; margin-top:6px">
        @{mul(body('Parse_JSON')?['summary']?['avgEngagementRate'],100)}%
      </div>
    </div>
  </div>

  <div style="margin-top:22px; font-size:12px; text-transform:uppercase; opacity:.6; letter-spacing:1px">
    Top spikes and actions
  </div>

  <div style="margin-top:10px; border:1px solid rgba(255,255,255,.06); border-radius:14px; overflow:hidden">
    <div style="display:flex; gap:10px; padding:12px 14px; background:rgba(255,255,255,.03); font-size:12px; opacity:.7">
      <div style="width:120px">Spike</div>
      <div style="width:220px">Date label</div>
      <div style="flex:1">Recommended action</div>
    </div>

    @{variables('SpikeRowsHtml')}
  </div>

  <div style="margin-top:18px; font-size:12px; opacity:.75; line-height:1.55">
    Operating rule: spikes drive conversion. When momentum hits, push the CTA immediately and route outcomes through bookings and All Ventures Access.
  </div>
</div>
```

## Outlook Send Email V2 Settings
- To: Admin inbox
- Subject: Creator Weekly Digest — Top CTA: @{body('Parse_JSON')?['summary']?['topCTA']}
- Body: Output of Compose action
- Is HTML: Yes

## Troubleshooting
- 401 Unauthorized
  - Verify Authorization header uses Bearer ADMIN_UPLOAD_TOKEN
  - Confirm ADMIN_UPLOAD_TOKEN matches the Worker env value
- 403 Forbidden
  - Confirm the endpoint allows admin token access
  - Validate the token has not expired or been rotated
- Connector limitations
  - If HTTP action is blocked, use Power Automate Desktop to call the endpoint locally and store the JSON in OneDrive or SharePoint

## Security Note
Keep ADMIN_UPLOAD_TOKEN private and rotate it quarterly.

## Template Placeholder Replacements
- Replace your-worker-domain with your deployed Worker hostname
- Replace ADMIN_UPLOAD_TOKEN with your actual admin token
- Replace REPLACE_WITH_OUTLOOK_CONNECTION in the JSON template with your Outlook connection name
- Replace REPLACE_WITH_ADMIN_EMAIL with the recipient address
