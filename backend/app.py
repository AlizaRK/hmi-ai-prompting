from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests
import bcrypt
from flask_cors import CORS
from datetime import datetime
from openai import OpenAI

app = Flask(__name__)
CORS(app, origins="*", 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

load_dotenv(override=True)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_TABLE = "participant"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client - handle None API key
openai_client = None
if OPENAI_API_KEY:
    try:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        print(OPENAI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize OpenAI client: {e}")


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

# OpenAI Chat endpoint
@app.route("/openai-chat", methods=["POST"])
def openai_chat():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    messages = data.get("messages", [])
    # model = "gpt-5-mini"
    model = "gpt-4o-mini"
    
    if not messages:
        return jsonify({"error": "Messages are required"}), 400

    try:
        if not openai_client:
            return jsonify({"error": "OpenAI client not initialized"}), 500

        response = openai_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            # max_completion_tokens=100000
        )
        
        print("[/openai-chat] requested:", model, "| used:", getattr(response, "model", None))
        # print("[/openai-chat]:", response)

        return jsonify({
            "content": response.choices[0].message.content,
            "model": model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500

# OpenAI Image Generation endpoint
@app.route("/openai-image", methods=["POST"])
def openai_image():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    prompt = data.get("prompt", "")
    model = "gpt-image-1"
    
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        if not openai_client:
            return jsonify({"error": "OpenAI client not initialized"}), 500

        response = openai_client.images.generate(
            model=model,
            prompt=prompt,
            size="1024x1024",
            quality="low",
            n=1,
        )

        item = response.data[0]
        b64 = getattr(item, "b64_json", None)
        image_url = f"data:image/png;base64,{b64}"
        
        return jsonify({
            "image_url": image_url,
            "prompt": prompt,
            "model": model
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"OpenAI Image API error: {str(e)}"}), 500
    
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

@app.route("/submit-personality-test", methods=["POST"])
def submit_personality_test():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    # Validate required fields
    participant_id = data.get("participant_id")
    responses = data.get("responses")
    dimensions = data.get("dimensions")

    if not participant_id or not responses or not dimensions:
        return jsonify({"error": "Missing required fields: participant_id, responses, or dimensions"}), 400

    # Validate that we have all 10 responses
    if len(responses) != 10:
        return jsonify({"error": "All 10 responses are required"}), 400

    # Prepare the payload for Supabase
    personality_test_payload = {
        "participant_id": participant_id,
        "question_1": responses.get("1"),
        "question_2": responses.get("2"),
        "question_3": responses.get("3"),
        "question_4": responses.get("4"),
        "question_5": responses.get("5"),
        "question_6": responses.get("6"),
        "question_7": responses.get("7"),
        "question_8": responses.get("8"),
        "question_9": responses.get("9"),
        "question_10": responses.get("10"),
        "extraversion_score": dimensions.get("extraversion"),
        "agreeableness_score": dimensions.get("agreeableness"),
        "conscientiousness_score": dimensions.get("conscientiousness"),
        "neuroticism_score": dimensions.get("neuroticism"),
        "openness_score": dimensions.get("openness")
    }

    # Insert into Supabase
    supabase_endpoint = f"{SUPABASE_URL}/rest/v1/personality_test"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    response = requests.post(supabase_endpoint, headers=headers, json=[personality_test_payload])

    if response.status_code >= 400:
        return jsonify({
            "error": "Supabase insert failed",
            "details": response.json()
        }), response.status_code

    inserted_record = response.json()[0]  # Get the first (and only) inserted record

    return jsonify({
        "message": "Personality test submitted successfully",
        "test_id": inserted_record["id"],
        "participant_id": inserted_record["participant_id"],
        "scores": {
            "extraversion": inserted_record["extraversion_score"],
            "agreeableness": inserted_record["agreeableness_score"],
            "conscientiousness": inserted_record["conscientiousness_score"],
            "neuroticism": inserted_record["neuroticism_score"],
            "openness": inserted_record["openness_score"]
        }
    }), 200

@app.route("/submit-post-study-questionnaire", methods=["POST"])
def submit_post_study_questionnaire():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    participant_id = data.get("participant_id")
    responses = data.get("responses", {})

    if not participant_id:
        return jsonify({"error": "participant_id is required"}), 400

    # Prepare the payload for Supabase with the new simplified questionnaire structure
    questionnaire_payload = {
        "participant_id": participant_id,
        "submitted_at": datetime.utcnow().isoformat(),
        # Updated questionnaire fields
        "ai_responses_helpful": responses.get("ai_responses_helpful"),
        "satisfied_response_quality": responses.get("satisfied_response_quality"),
        "responses_matched_intent": responses.get("responses_matched_intent"),
        "trust_ai_accuracy": responses.get("trust_ai_accuracy"),
        "would_use_future": responses.get("would_use_future"),
        "ai_importance_increased": responses.get("ai_importance_increased")
    }

    # Insert into Supabase
    supabase_endpoint = f"{SUPABASE_URL}/rest/v1/post_study_questionnaire"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    response = requests.post(supabase_endpoint, headers=headers, json=[questionnaire_payload])

    if response.status_code >= 400:
        return jsonify({
            "error": "Supabase insert failed",
            "details": response.json()
        }), response.status_code

    inserted_record = response.json()[0]

    return jsonify({
        "message": "Post-study questionnaire submitted successfully",
        "questionnaire_id": inserted_record["id"],
        "participant_id": inserted_record["participant_id"],
        "submitted_at": inserted_record["submitted_at"]
    }), 200

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

if __name__ == "__main__":
    app.run(debug=True)