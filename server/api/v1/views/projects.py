#!/usr/bin/python3
"""get and create projects module"""
from datetime import datetime
from api.v1.views import app_views
from flask import jsonify, abort, request
from models import storage
from models.project import Project
from models.member import Member


@app_views.route("/projects", methods=["POST"])
def create_project():
    """create project"""
    name = request.json.get("name")
    description = request.json.get("description")
    created_by = request.json.get("created_by")
    members = request.json.get("members")
    link_repo = request.json.get("link_repo")
    if not name or not description or not created_by:
        return jsonify({"message": "Missing data", "status": 400}), 400
    new_project = Project(
        name=name,
        description=description,
        created_by=created_by,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        link_repo=link_repo,
    )
    storage.new(new_project)
    storage.save()
    if members is not None:
        for member in members:
            new_member = Member(project_id=new_project.id, user_id=member)
            storage.new(new_member)
            storage.save()
    return (
        jsonify(
            {
                "message": "project created successfully",
                "status": 201,
                "project": new_project.as_dict(),
            }
        ),
        201,
    )


@app_views.route("/projects", methods=["GET"])
def get_projects():
    """get all projects"""
    projects = storage.all(Project)
    projects_list = []
    for project in projects.values():
        projects_list.append(project.as_dict())
    return jsonify(projects_list), 200


@app_views.route("/projects/<project_id>", methods=["GET"])
def get_project_by_id(project_id):
    """get project by id"""
    project = storage.get(Project, project_id)
    if project is None:
        abort(404)
    return jsonify(project.as_dict()), 200


@app_views.route("/projects/<project_id>", methods=["PUT"])
def update_project(project_id):
    """update project information"""
    project = storage.get(Project, project_id)
    if project is None:
        abort(404)
    if not request.json:
        abort(400, description="Not a JSON")
    for key, value in request.json.items():
        if key not in ["id", "created_at", "updated_at", "created_by", "members"]:
            setattr(project, key, value)

    if "members" in request.json:
        member_ids = request.json["members"]
        for member_id in member_ids:
            user = Member.query.filter_by(project_id=project.id, user_id=member_id).first()
            if user is None:
                member = Member(project_id=project.id, user_id=member_id)
                storage.new(member)
    
    project.updated_at = datetime.utcnow()
    storage.save()
    return jsonify(project.as_dict()), 200


@app_views.route("/projects/<project_id>/tickets", methods=["GET"])
def get_project_tickets(project_id):
    """get project tickets"""
    project = storage.get(Project, project_id)
    if project is None:
        abort(404)
    tickets = project.get_tickets()
    return jsonify(tickets), 200


@app_views.route("/projects/<project_id>", methods=["DELETE"])
def delete_project(project_id):
    """delete project"""
    project = storage.get(Project, project_id)
    if project is None:
        abort(404)
    storage.delete(project)
    storage.save()
    return jsonify({"message": "Project deleted", "status": 202}), 202
