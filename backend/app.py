from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests
import bcrypt
from flask_cors import CORS
from datetime import datetime


app = Flask(__name__)
CORS(app, origins="*", 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

load_dotenv(override=True)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_TABLE = "participant"  # or your actual table name


@app.route("/participants", methods=["GET"])
def get_participants():
    supabase_endpoint = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    # Fetch all participants
    response = requests.get(supabase_endpoint, headers=headers)

    if response.status_code >= 400:
        return jsonify({
            "error": "Supabase fetch failed",
            "details": response.json()
        }), response.status_code

    return jsonify(response.json()), 200 

@app.route("/register", methods=["POST"])
def register():
    form_data = request.get_json()
    if not form_data:
        return jsonify({"error": "Missing JSON body"}), 400

    # Validate required fields
    required_fields = ["email", "password"]
    missing = [f for f in required_fields if f not in form_data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    # Hash the password
    raw_password = form_data["password"]
    hashed_pw = bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt())
    form_data["password"] = hashed_pw.decode("utf-8")  # Store as string

    # Insert into Supabase
    supabase_endpoint = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    response = requests.post(supabase_endpoint, headers=headers, json=[form_data])

    if response.status_code >= 400:
        return jsonify({
            "error": "Supabase insert failed",
            "details": response.json()
        }), response.status_code

    inserted_user = response.json()[0]  # Get the first (and only) inserted record

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "email": inserted_user["email"],
            "name": inserted_user.get("name"),  # Use .get() for optional fields
            "participant_id": inserted_user["id"]
            # never return password hash
        }
    }), 200
    
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password required"}), 400

    email = data["email"]
    input_password = data["password"]

    # Query Supabase for user by email
    query_url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?email=eq.{email}"

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.get(query_url, headers=headers)

    if response.status_code != 200 or not response.json():
        return jsonify({"error": "Invalid email or password"}), 401

    user = response.json()[0]  # Assuming email is unique
    stored_hash = user.get("password")

    # Compare passwords
    if not bcrypt.checkpw(input_password.encode("utf-8"), stored_hash.encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401

    # Login successful
    return jsonify({
        "message": "Login successful",
        "user": {
            "email": user["email"],
            "name": user.get("name"),
            "participant_id": user.get("id")
            # never return password hash
        }
    }), 200
    
# TASKS API
@app.route("/tasks", methods=["GET"])
def get_tasks():
    supabase_endpoint = f"{SUPABASE_URL}/rest/v1/task"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    
    response = requests.get(supabase_endpoint, headers=headers)

    if response.status_code >= 400:
        return jsonify({
            "error": "Supabase fetch failed",
            "details": response.json()
        }), response.status_code

    return jsonify(response.json()), 200 

@app.route("/submit-task", methods=["POST"])
def submit_task():
    data = request.get_json()

    participant_id = data.get("participant_id")
    task_id = data.get("task_id")

    if not participant_id or not task_id:
        return jsonify({"error": "participant_id and task_id required"}), 400

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    # Step 1: Find the existing interaction
    query_params = f"?participant_id=eq.{participant_id}&task_id=eq.{task_id}"
    get_resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/participant_task_interaction{query_params}",
        headers=headers
    )

    if get_resp.status_code != 200 or not get_resp.json():
        return jsonify({"error": "Interaction not found"}), 404

    interaction = get_resp.json()[0]
    interaction_id = interaction["id"]

    # Step 2: Update ended_at
    patch_resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/participant_task_interaction?id=eq.{interaction_id}",
        headers=headers,
        json={"ended_at": datetime.utcnow().isoformat()}
    )

    if patch_resp.status_code >= 400:
        return jsonify({"error": "Failed to update ended_at", "details": patch_resp.json()}), 500

    return jsonify({"message": "Task submitted", "ended_at": datetime.utcnow().isoformat()}), 200


@app.route("/store-interaction", methods=["POST"])
def store_interaction():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    participant_id = data.get("participant_id")
    task_id = data.get("task_id")
    ai_tool = data.get("ai_tool")
    messages = data.get("messages", [])

    if not participant_id or not task_id or not ai_tool or not messages:
        return jsonify({"error": "Missing required fields"}), 400

    # 1. Insert into participant_task_interaction
    interaction_payload = {
        "participant_id": participant_id,
        "task_id": task_id,
        "ai_tool": ai_tool
    }

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    interaction_resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/participant_task_interaction",
        headers=headers,
        json=[interaction_payload]
    )

    if interaction_resp.status_code >= 400:
        return jsonify({"error": "Failed to insert interaction", "details": interaction_resp.json()}), 500

    interaction_id = interaction_resp.json()[0]["id"]

    # 2. Insert messages linked to the interaction
    message_payload = [
        {
            "interaction_id": interaction_id,
            "sender": msg["sender"],
            "content": msg["content"],
            "created_at": msg.get("timestamp") or datetime.utcnow().isoformat()
        }
        for msg in messages
    ]

    message_resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/message",
        headers=headers,
        json=message_payload
    )

    if message_resp.status_code >= 400:
        return jsonify({"error": "Failed to insert messages", "details": message_resp.json()}), 500

    return jsonify({"message": "Interaction and messages stored successfully"}), 200

