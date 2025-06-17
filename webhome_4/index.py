from flask import Flask,render_template,request
import psycopg2
from psycopg2 import OperationalError
import os
from dotenv  import load_dotenv  #引進dotenv模組

load_dotenv()  
conn_string = os.getenv("RENDER_DATABASE")

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html.jinja2")

@app.route("/news")
def news():
    try:
        conn = psycopg2.connect(conn_string)
        with conn.cursor() as cur:
            sql = "SELECT * FROM 最新消息2"
            cur.execute(sql)
            rows = cur.fetchall()
        print("Connected to the database successfully!")    #在**終端機**顯示連線成功訊息
    except OperationalError as e:
        print(f"Error connecting to the database: {e}")
        return render_template("error.html.jinja2", error_message="Database connection failed."),500
    except:
        print("An unexpected error occurred.")
        return render_template("error.html.jinja2", error_message="An unexpected error occurred."),500

    conn.close() #關閉連線
    return render_template("news.html.jinja2", rows=rows)

@app.route("/course", defaults={"course_types":"資訊工程"})
@app.route("/course/<course_types>")
def course(course_types):
    print(course_types)
    conn = psycopg2.connect(conn_string)
    with conn.cursor() as cur:
        sql = """
        select distinct "類別" from "課程內容2";
        """
        cur.execute(sql)
        temps = cur.fetchall()
        kinds = [kind[0] for kind in temps]  #提取課程類別
        kinds.reverse()

        sql_course ="""
        SELECT
            "課程名稱",
            "教師姓名",
            "學生人數",
            "上課時數",
            "上課費用",
            "上課時間",
            "開課日期",
            "組別"
        FROM
            "課程內容2"
        WHERE
             "類別" = %s;
        """
        cur.execute(sql_course,(course_types,))
        course_data = cur.fetchall()
        page = request.args.get('page',1,type=int)
        per_page = 6
        total = len(course_data)
        print(total)
        total_pages = total // per_page + 1
        start = (page - 1) * per_page
        end = start + per_page
        items = course_data[start:end]  # 取得該頁資料

    return render_template("course.html.jinja2",
                           kinds=kinds,
                           course_data=items,
                           page=page,
                           total_pages=total_pages)

@app.route("/traffic")
def traffic():
    return render_template("traffic.html.jinja2")
