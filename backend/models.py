from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Enum
from enums import TaskType

db = SQLAlchemy()

participant_tasks = db.Table(
    'participant_tasks',
    db.Column('participant_id', db.Integer, db.ForeignKey('participant.id'), primary_key=True),
    db.Column('task_id', db.Integer, db.ForeignKey('task.id'), primary_key=True)
)


class Participant(db.Model):
    __tablename__ = 'participant'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    _password_hash = db.Column('password', db.String(255), nullable=False)

    tasks = db.relationship(
        'Task',
        secondary=participant_tasks,
        back_populates='participants'
    )

    @property
    def password(self):
        raise AttributeError("Password is write-only.")

    @password.setter
    def password(self, plain_password):
        self._password_hash = generate_password_hash(plain_password)

    def check_password(self, plain_password):
        return check_password_hash(self._password_hash, plain_password)  

class Task(db.Model):
    __tablename__ = 'task'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    task_type = db.Column(Enum(TaskType), nullable=False)

    participants = db.relationship(
        'Participant',
        secondary=participant_tasks,
        back_populates='tasks'
    )

class Conversation(db.Model):
    __tablename__ = 'conversation'
    id = db.Column(db.Integer, primary_key=True)

    participant_id = db.Column(db.Integer, db.ForeignKey('participant.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)

    messages = db.Column(db.JSON, nullable=False, default=list)  # list of dicts or strings

    timestamp = db.Column(db.DateTime, default=db.func.now())

    participant = db.relationship('Participant', backref='conversations')
    task = db.relationship('Task', backref='conversations')
