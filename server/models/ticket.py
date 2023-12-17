#!/usr/bin/python3
"""ticket model"""
import uuid
import datetime
from api.v1.extensions import db


class Ticket(db.Model):
    """ticket model"""

    __tablename__ = "tickets"
    id = db.Column(
        db.String(60),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )
    title = db.Column(db.String(128), nullable=False, unique=True)
    description = db.Column(db.String(256), nullable=False)
    ticket_type = db.Column(db.String(128), nullable=False)
    status = db.Column(db.String(128), default="open")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow())
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow())
    created_by = db.Column(db.String(60), db.ForeignKey("users.id"))
    end_date = db.Column(db.DateTime, nullable=True)
    parent_id = db.Column(db.String(60), db.ForeignKey("projects.id"))
    project = db.relationship(
        "Project", backref="parent_id", cascade="save-update, merge"
    )

    # def as_dict(self):
    #     """returns a dictionary containing all keys/values of __dict__"""
    #     return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    def as_dict(self):
        """returns a dictionary containing all keys/values of __dict__"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at,
            "created_by": self.created_by,
            "ticket_type": self.ticket_type,
            "parent_id": self.parent_id,
            "status": self.status,
            "updated_at": self.updated_at,
            "end_date": self.end_date,
            "project": self.project.as_dict_to_resp(),
        }
