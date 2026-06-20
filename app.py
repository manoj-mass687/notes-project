from flask import Flask, render_template, request, jsonify
import pandas as pd
from datetime import datetime
import os

app = Flask(__name__)

# ==========================
# EXCEL FILE SETUP
# ==========================

FILE_NAME = "notes.xlsx"

if not os.path.exists(FILE_NAME):
    df = pd.DataFrame(
        columns=[
            "id",
            "title",
            "content",
            "created_at"
        ]
    )
    df.to_excel(FILE_NAME, index=False)


# ==========================
# HOME PAGE
# ==========================

@app.route('/')
def home():
    return render_template('index.html')


# ==========================
# GET ALL NOTES
# ==========================

@app.route('/notes', methods=['GET'])
def get_notes():
    FILE_NAME = "notes.xlsx"
    df = pd.read_excel(FILE_NAME)

    notes = df.to_dict(orient="records")

    notes.reverse()

    return jsonify(notes)


# ==========================
# ADD NOTE
# ==========================

@app.route('/add_note', methods=['POST'])
def add_note():

    data = request.json

    title = data.get("title", "").strip()
    content = data.get("content", "").strip()

    if title == "" or content == "":
        return jsonify({
            "message": "Title and Content required"
        }), 400

    df = pd.read_excel(FILE_NAME)

    note_id = 1

    if not df.empty:
        note_id = int(df["id"].max()) + 1

    note = {
        "id": note_id,
        "title": title,
        "content": content,
        "created_at": datetime.now().strftime(
            "%d-%m-%Y %H:%M:%S"
        )
    }

    df = pd.concat(
        [df, pd.DataFrame([note])],
        ignore_index=True
    )

    df.to_excel(FILE_NAME, index=False)

    return jsonify({
        "message": "Note Added Successfully"
    })


# ==========================
# DELETE NOTE
# ==========================

@app.route('/delete_note/<int:id>',
           methods=['DELETE'])
def delete_note(id):

    df = pd.read_excel(FILE_NAME)

    df = df[df["id"] != id]

    df.to_excel(FILE_NAME, index=False)

    return jsonify({
        "message": "Note Deleted"
    })


# ==========================
# UPDATE NOTE
# ==========================

@app.route('/update_note/<int:id>',
           methods=['PUT'])
def update_note(id):

    data = request.json

    title = data.get("title", "").strip()
    content = data.get("content", "").strip()

    df = pd.read_excel(FILE_NAME)

    if id not in df["id"].values:
        return jsonify({
            "message": "Note not found"
        }), 404

    df.loc[df["id"] == id,
           "title"] = title

    df.loc[df["id"] == id,
           "content"] = content

    df.to_excel(FILE_NAME, index=False)

    return jsonify({
        "message": "Note Updated"
    })


# ==========================
# RUN APP
# ==========================

import os
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
