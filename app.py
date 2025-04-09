
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import requests
from typing import Dict, List, Optional, Union
from datetime import datetime
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Supabase configuration
SUPABASE_URL = "https://rfumpevizrilmnyloexj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdW1wZXZpenJpbG1ueWxvZXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzgwMTYsImV4cCI6MjA1OTQ1NDAxNn0.PhxVZ3U0P0bio4dJDrQYo3zpuxW0U2u1MZGC4ESPS20"

# Helper function to make Supabase API requests
def supabase_request(endpoint: str, method: str = "GET", data: Optional[Dict] = None, token: Optional[str] = None) -> Dict:
    url = f"{SUPABASE_URL}/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
    }
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    if method == "GET":
        response = requests.get(url, headers=headers)
    elif method == "POST":
        response = requests.post(url, headers=headers, json=data)
    elif method == "PUT":
        response = requests.put(url, headers=headers, json=data)
    elif method == "DELETE":
        response = requests.delete(url, headers=headers)
    else:
        raise ValueError(f"Invalid method: {method}")
    
    if response.status_code >= 400:
        print(f"Error: {response.status_code} - {response.text}")
    
    return response.json() if response.content else {}

# Authentication routes
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    response = supabase_request("auth/v1/signup", "POST", {
        "email": email,
        "password": password
    })
    
    if "error" in response:
        return jsonify({"error": response["error"]["message"]}), 400
    
    return jsonify(response), 200

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    response = supabase_request("auth/v1/token", "POST", {
        "email": email,
        "password": password,
        "grant_type": "password"
    })
    
    if "error" in response:
        return jsonify({"error": response["error"]["message"]}), 400
    
    return jsonify(response), 200

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "No token provided"}), 401
    
    response = supabase_request("auth/v1/logout", "POST", token=token)
    
    return jsonify({"message": "Logged out successfully"}), 200

# Tasks routes
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    
    response = supabase_request("rest/v1/tasks?select=*", token=token)
    
    return jsonify(response), 200

@app.route("/api/tasks", methods=["POST"])
def create_task():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.json
    required_fields = ["title", "status", "priority"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    response = supabase_request("rest/v1/tasks", "POST", data, token=token)
    
    return jsonify(response), 201

@app.route("/api/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.json
    response = supabase_request(f"rest/v1/tasks?id=eq.{task_id}", "PUT", data, token=token)
    
    return jsonify(response), 200

@app.route("/api/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    
    response = supabase_request(f"rest/v1/tasks?id=eq.{task_id}", "DELETE", token=token)
    
    return jsonify({"message": "Task deleted successfully"}), 200

# Contacts routes
@app.route("/api/contacts", methods=["GET"])
def get_contacts():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    
    response = supabase_request("rest/v1/contacts?select=*", token=token)
    
    return jsonify(response), 200

@app.route("/api/contacts", methods=["POST"])
def create_contact():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.json
    required_fields = ["name", "email"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    response = supabase_request("rest/v1/contacts", "POST", data, token=token)
    
    return jsonify(response), 201

@app.route("/api/contacts/<contact_id>", methods=["PUT"])
def update_contact(contact_id):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.json
    response = supabase_request(f"rest/v1/contacts?id=eq.{contact_id}", "PUT", data, token=token)
    
    return jsonify(response), 200

@app.route("/api/contacts/<contact_id>", methods=["DELETE"])
def delete_contact(contact_id):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    
    response = supabase_request(f"rest/v1/contacts?id=eq.{contact_id}", "DELETE", token=token)
    
    return jsonify({"message": "Contact deleted successfully"}), 200

# Chat assistant route
@app.route("/api/chat", methods=["POST"])
def chat():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.json
    message = data.get("message")
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
    
    # Implement basic NLP to understand the request
    # In a real app, this would use a more sophisticated NLP system
    lower_message = message.lower()
    
    response = {
        "type": "text",
        "content": "I'm not sure how to help with that. Try asking about tasks or contacts."
    }
    
    # Simple intent recognition
    if any(keyword in lower_message for keyword in ["add task", "create task", "new task"]):
        response = {
            "type": "text",
            "content": "I'll help you create a new task. What's the title of the task?"
        }
    elif any(keyword in lower_message for keyword in ["show tasks", "list tasks", "view tasks"]):
        response = {
            "type": "text",
            "content": "I'll fetch your tasks from the database. Please check the Tasks page."
        }
    elif any(keyword in lower_message for keyword in ["add contact", "create contact", "new contact"]):
        response = {
            "type": "text",
            "content": "I'll help you create a new contact. What's the name of the contact?"
        }
    elif any(keyword in lower_message for keyword in ["show contacts", "list contacts", "view contacts"]):
        response = {
            "type": "text",
            "content": "I'll fetch your contacts from the database. Please check the Contacts page."
        }
    
    # Add a small delay to simulate processing
    time.sleep(1)
    
    return jsonify(response), 200

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
