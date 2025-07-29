from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests
import bcrypt
from flask_cors import CORS


app = Flask(__name__)
CORS(app, origin="*")

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

    return jsonify({
        "message": "User registered successfully",
        "data": response.json()
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
            "fullName": user.get("fullName")
            # never return password hash
        }
    }), 200



if __name__ == '__main__':
    app.run()
