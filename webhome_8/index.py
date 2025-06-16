from flask import Flask,render_template,request

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html.jinja2")



@app.route("/new")
def new():
    try:
        conn = psycopg2.connect(conn_string)
        with conn.cursor() as cur:
            sql = """SELECT * FROM public.最新消息
                     ORDER BY 上版日期 desc"""
            cur.execute(sql)
        # 取得所有資料
            rows = cur.fetchall()
            
        
    except OperationalError as e:
        print("連線失敗")
        print(e)
        return render_template("error.html.jinja2",error_message="資料庫錯誤"),500
    except:
        return render_template("error.html.jinja2",error_message="不知名錯誤"),500
    conn.close()
    return render_template("new.html.jinja2",rows=rows)