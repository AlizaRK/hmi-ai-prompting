from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from models import db, Participant, Task, Conversation
from flask_migrate import Migrate
from openai import OpenAI
from datetime import datetime
import json
from sqlalchemy.orm.attributes import flag_modified

load_dotenv()
migrate = Migrate()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Enable CORS for frontend communication
    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)

    @app.route('/')
    def index():
        participants = Participant.query.all()
        return {'participants': [p.name for p in participants]}

    @app.route('/register', methods=['POST'])
    def register():
        data = request.json
        name = data['name']
        password = data['password']

        if Participant.query.filter_by(name=name).first():
            return {'message': 'Username already exists'}, 400

        user = Participant(name=name)
        user.password = password  # Triggers the setter
        db.session.add(user)
        db.session.commit()

        return {'message': 'User created successfully'}

    @app.route('/api/chat/message', methods=['POST'])
    def send_message():
        try:
            data = request.json
            message = data.get('message')
            ai_model = data.get('ai_model', 'Claude')  # Default to Claude
            participant_id = data.get('participant_id')
            task_id = data.get('task_id')
            
            if not message:
                return {'error': 'Message is required'}, 400
            
            # Get AI response based on selected model
            ai_response = get_ai_response(message, ai_model)
            
            # Save conversation to database if participant_id and task_id are provided
            if participant_id and task_id:
                save_conversation(participant_id, task_id, message, ai_response, ai_model)
            
            return {
                'response': ai_response,
                'model': ai_model,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in send_message: {str(e)}")
            return {'error': 'Failed to process message'}, 500

    def get_ai_response(message, ai_model):
        """Get response from the specified AI model"""
        try:
            if ai_model == 'GPT-4':
                return get_openai_response(message, 'gpt-3.5-turbo')
            elif ai_model == 'Claude':
                # For now, return a placeholder. We'll implement this later
                return "This is a simulated response from Claude. Claude API integration will be implemented next."
            elif ai_model == 'Gemini':
                # Placeholder for Gemini
                return "This is a simulated response from Gemini. Gemini API integration will be implemented later."
            elif ai_model == 'PaLM':
                # Placeholder for PaLM
                return "This is a simulated response from PaLM. PaLM API integration will be implemented later."
            else:
                return "Unknown AI model selected."
        except Exception as e:
            print(f"Error getting AI response: {str(e)}")
            return f"Sorry, I encountered an error while processing your request. Please try again."

    def get_openai_response(message, model="gpt-4"):
        """Get response from OpenAI API"""
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant participating in a research study about AI interaction. Please provide thoughtful, helpful responses."},
                    {"role": "user", "content": message}
                ],
                max_tokens=500,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return "I'm having trouble connecting to my services right now. Please try again later."

    def save_conversation(participant_id, task_id, user_message, ai_response, ai_model):
        """Save conversation to database"""
        try:
            # Ensure participant exists
            participant = Participant.query.filter_by(id=participant_id).first()
            if not participant:
                print(f"Participant {participant_id} not found")
                return
            
            # Ensure task exists
            task = Task.query.filter_by(id=task_id).first()
            if not task:
                print(f"Task {task_id} not found")
                return
            
            # Check if conversation exists for this participant and task
            conversation = Conversation.query.filter_by(
                participant_id=participant_id, 
                task_id=task_id
            ).first()
            
            if not conversation:
                conversation = Conversation(
                    participant_id=participant_id,
                    task_id=task_id,
                    messages=[]
                )
                db.session.add(conversation)
            
            # Add new messages to the conversation
            message_count = len(conversation.messages) if conversation.messages else 0
            new_messages = [
                {
                    'content': user_message,
                    'sender': 'user',
                    'timestamp': datetime.now().isoformat(),
                    'id': message_count + 1
                },
                {
                    'content': ai_response,
                    'sender': 'ai',
                    'ai_model': ai_model,
                    'timestamp': datetime.now().isoformat(),
                    'id': message_count + 2
                }
            ]
            
            # Update messages list
            if conversation.messages is None:
                conversation.messages = []
            conversation.messages.extend(new_messages)
            
            # Mark the field as modified for SQLAlchemy
            flag_modified(conversation, 'messages')
            
            db.session.commit()
            
        except Exception as e:
            print(f"Error saving conversation: {str(e)}")
            db.session.rollback()

    @app.route('/api/conversations/<int:participant_id>/<int:task_id>', methods=['GET'])
    def get_conversation(participant_id, task_id):
        """Get conversation history for a specific participant and task"""
        try:
            conversation = Conversation.query.filter_by(
                participant_id=participant_id,
                task_id=task_id
            ).first()
            
            if conversation:
                return {
                    'messages': conversation.messages or [],
                    'timestamp': conversation.timestamp.isoformat() if conversation.timestamp else None
                }
            else:
                return {'messages': []}
                
        except Exception as e:
            print(f"Error getting conversation: {str(e)}")
            return {'error': 'Failed to get conversation'}, 500

    @app.route('/api/tasks', methods=['GET'])
    def get_tasks():
        """Get all available tasks"""
        try:
            tasks = Task.query.all()
            return {
                'tasks': [
                    {
                        'id': task.id,
                        'description': task.description,
                        'task_type': task.task_type.value
                    } for task in tasks
                ]
            }
        except Exception as e:
            print(f"Error getting tasks: {str(e)}")
            return {'error': 'Failed to get tasks'}, 500

    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)