from flask import Flask,render_template,request

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html.jinja2")

@app.route("/news")
def news():
    return render_template("news.html.jinja2")

@app.route("/course")
def course():
    return render_template("course.html.jinja2")

@app.route("/traffic")
def traffic():
    return render_template("traffic.html.jinja2")
