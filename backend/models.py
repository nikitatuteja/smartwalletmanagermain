from datetime import datetime, date
from extensions import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    balance = db.Column(db.Float, nullable=False, default=10000.00)


    # Relationships
    cards = db.relationship('Card', backref='user', lazy=True, cascade="all, delete-orphan")
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade="all, delete-orphan")
    dues = db.relationship('Due', backref='user', lazy=True, cascade="all, delete-orphan")
    budgets = db.relationship('Budget', backref='user', lazy=True, cascade="all, delete-orphan")
    goals = db.relationship('Goal', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "display_name": self.display_name,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }

class Card(db.Model):
    __tablename__ = 'cards'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    nickname = db.Column(db.String(100), nullable=False)
    last_four = db.Column(db.String(4), nullable=False)
    card_type = db.Column(db.String(10), nullable=False) # Credit or Debit
    
    # New fields
    bank_name = db.Column(db.String(100), nullable=True)
    network = db.Column(db.String(50), nullable=True) # Visa / Mastercard / RuPay / Amex
    card_name = db.Column(db.String(100), nullable=True)
    card_holder = db.Column(db.String(100), nullable=True)
    expiry_month = db.Column(db.String(2), nullable=True)
    expiry_year = db.Column(db.String(4), nullable=True)
    billing_date = db.Column(db.Integer, nullable=True)
    credit_limit = db.Column(db.Float, nullable=True)
    available_limit = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), default='Active')
    color_theme = db.Column(db.String(20), default='Blue')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    dues = db.relationship('Due', backref='card', lazy=True, cascade="all, delete-orphan")
    transactions = db.relationship('Transaction', backref='card', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "nickname": self.nickname,
            "last_four": self.last_four,
            "card_type": self.card_type,
            "bank_name": self.bank_name,
            "network": self.network,
            "card_name": self.card_name,
            "card_holder": self.card_holder,
            "expiry_month": self.expiry_month,
            "expiry_year": self.expiry_year,
            "billing_date": self.billing_date,
            "credit_limit": self.credit_limit,
            "available_limit": self.available_limit,
            "status": self.status,
            "color_theme": self.color_theme,
            "created_at": self.created_at.isoformat()
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(10), nullable=False) # Income or Expense
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)
    payment_method = db.Column(db.String(10), nullable=False) # Cash, UPI, or Card
    notes = db.Column(db.String(500), nullable=True)
    card_id = db.Column(db.Integer, db.ForeignKey('cards.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "type": self.type,
            "category": self.category,
            "date": self.date.isoformat(),
            "payment_method": self.payment_method,
            "notes": self.notes,
            "card_id": self.card_id,
            "created_at": self.created_at.isoformat()
        }

class Due(db.Model):
    __tablename__ = 'dues'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    card_id = db.Column(db.Integer, db.ForeignKey('cards.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    is_paid = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        today = date.today()
        is_overdue = self.due_date < today and not self.is_paid
        return {
            "id": self.id,
            "user_id": self.user_id,
            "card_id": self.card_id,
            "amount": self.amount,
            "due_date": self.due_date.isoformat(),
            "is_paid": self.is_paid,
            "is_overdue": is_overdue,
            "created_at": self.created_at.isoformat()
        }

class Budget(db.Model):
    __tablename__ = 'budgets'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    month = db.Column(db.String(7), nullable=False) # YYYY-MM
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "category": self.category,
            "amount": self.amount,
            "month": self.month,
            "created_at": self.created_at.isoformat()
        }

class Goal(db.Model):
    __tablename__ = 'goals'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    deadline = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "target_amount": self.target_amount,
            "current_amount": self.current_amount,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "created_at": self.created_at.isoformat()
        }
