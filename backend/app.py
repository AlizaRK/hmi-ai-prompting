from flask import Flask, request
from dotenv import load_dotenv
import os
from models import db, Participant
from flask_migrate import Migrate

load_dotenv()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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
    
    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)
