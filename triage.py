import os
import requests
import json
import re

# --- ENV VARIABLES ---
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- LOAD GITHUB EVENT ---
with open(os.environ["GITHUB_EVENT_PATH"]) as f:
    event = json.load(f)

issue = event["issue"]
title = issue["title"]
body = issue["body"] or ""
issue_number = issue["number"]
repo = event["repository"]["full_name"]

# --- PROMPT ---
prompt = f"""
You are a strict GitHub issue classifier.

Rules:
- bug = something broken or not working
- feature = request for new functionality
- question = asking for help or clarification

Return ONLY valid JSON. No explanation.

Format:
{{
 "label": "bug | feature | question",
 "priority": "low | medium | high"
}}

Classify this:

Title: {title}
Body: {body}
"""

# --- GEMINI API CALL ---
response = requests.post(
    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}",
    headers={
        "Content-Type": "application/json",
    },
    json={
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    },
)
# print(response.text for debugging)

result = response.json()

# --- EXTRACT TEXT ---
try:
    content = result["candidates"][0]["content"]["parts"][0]["text"]
except Exception:
    print("Gemini response error:", result)
    exit(1)

# --- SAFE JSON PARSE ---
try:
    json_text = re.search(r'\{.*\}', content, re.DOTALL).group()
    data = json.loads(json_text)
except Exception:
    print("JSON parsing failed. Raw output:", content)
    exit(1)

label = data.get("label", "question")
priority = data.get("priority", "medium")

# --- APPLY LABELS ---
labels_url = f"https://api.github.com/repos/{repo}/issues/{issue_number}/labels"

requests.post(
    labels_url,
    headers={"Authorization": f"token {GITHUB_TOKEN}"},
    json={"labels": [label, f"priority:{priority}"]},
)

# --- OPTIONAL COMMENT ---
comment_url = f"https://api.github.com/repos/{repo}/issues/{issue_number}/comments"

comment_body = f"""
🤖 Auto-triaged:

- Label: `{label}`
- Priority: `{priority}`

(This is an automated suggestion. Maintainers can adjust if needed.)
"""

requests.post(
    comment_url,
    headers={"Authorization": f"token {GITHUB_TOKEN}"},
    json={"body": comment_body},
)