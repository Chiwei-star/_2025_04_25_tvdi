# app.py

import pandas as pd
import numpy as np
import plotly.graph_objs as go
from flask import Flask, render_template, request

from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# --- 1. 初始化 Flask 應用 ---
app = Flask(__name__)

# --- 2. 一次性設置：加載數據、特徵工程、模型訓練 ---
def load_data_and_train_model():
    """加載數據、計算指標並訓練模型"""
    # --- 加載原始價格數據 ---
    df_raw = pd.read_csv("tsmc2330-1.csv")
    df_raw['Date'] = pd.to_datetime(df_raw['Date'])
    df_raw.set_index('Date', inplace=True)

    # --- 計算技術指標 ---
    df = df_raw.copy()
    df['MA5'] = df['Close'].rolling(5).mean()
    df['MA10'] = df['Close'].rolling(10).mean()
    df['MA20'] = df['Close'].rolling(20).mean()
    
    ema12 = df['Close'].ewm(span=12, adjust=False).mean()
    ema26 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = ema12 - ema26
    df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()

    delta = df['Close'].diff(1)
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=14, min_periods=1).mean()
    avg_loss = loss.rolling(window=14, min_periods=1).mean()
    rs = avg_gain / avg_loss
    df['RSI'] = 100 - (100 / (1 + rs))

    df['BB_Middle'] = df['MA20']
    std_dev = df['Close'].rolling(20).std()
    df['BB_Upper'] = df['BB_Middle'] + (std_dev * 2)
    df['BB_Lower'] = df['BB_Middle'] - (std_dev * 2)

    # --- 準備特徵和目標 ---
    df_feat = df.copy()
    lag_cols = []
    
    def lag(col):
        lag_col = 'Lag1_' + col
        df_feat[lag_col] = df_feat[col].shift(1)
        lag_cols.append(lag_col)

    for col in ['Close', 'RSI', 'MACD', 'MACD_Signal']:
        lag(col)

    df_feat['Lag1_Return'] = df_feat['Lag1_Close'].pct_change()
    lag_cols.append('Lag1_Return')
    df_feat['Volume_Change'] = df_feat['Volume'].pct_change().shift(1)
    lag_cols.append('Volume_Change')
    df_feat['MA5_diff'] = (df_feat['MA5'] - df_feat['MA10']).shift(1) / df_feat['MA10'].shift(1)
    lag_cols.append('MA5_diff')
    df_feat['BB_Pressure'] = df_feat['Close'].shift(1) / df_feat['BB_Upper'].shift(1)
    lag_cols.append('BB_Pressure')

    df_feat['Target'] = (df_feat['Close'] > df_feat['Close'].shift(1)).astype(int)
    
    df_clean = df_feat.dropna(subset=lag_cols + ['Target'])
    X = df_clean[lag_cols]
    y = df_clean['Target']

    dp = X.replace([np.inf, -np.inf], np.nan).dropna()
    y_clean = y.loc[dp.index]
    
    scaler = StandardScaler().fit(dp)
    X_scaled = scaler.transform(dp)
    model = LogisticRegression(class_weight='balanced').fit(X_scaled, y_clean)
    
    # --- 準備圖表 ---
    price_fig = go.Figure()
    price_fig.add_trace(go.Scatter(x=df.index, y=df['Close'], mode='lines', name='收盤價'))
    for ma in ['MA5', 'MA10', 'MA20']:
        price_fig.add_trace(go.Scatter(x=df.index, y=df[ma], mode='lines', name=ma))
    price_fig.update_layout(title='收盤價與移動平均線', xaxis_title='日期', yaxis_title='價格')

    macd_fig = go.Figure()
    macd_fig.add_trace(go.Scatter(x=df.index, y=df['MACD'], mode='lines', name='MACD'))
    macd_fig.add_trace(go.Scatter(x=df.index, y=df['MACD_Signal'], mode='lines', name='訊號線'))
    macd_fig.update_layout(title='MACD 與訊號線', xaxis_title='日期', yaxis_title='值')

    # --- 準備表單預設值 ---
    last_data = df_clean.iloc[-1]
    prev_data = df_clean.iloc[-2]
    
    ### 修改點：在這裡對每個需要小數點的數值使用 round(value, 2) ###
    default_inputs = {
        'close': round(float(last_data['Lag1_Close']), 2),
        'close_prev': round(float(prev_data['Close']), 2),
        'rsi': round(float(last_data['Lag1_RSI']), 2),
        'macd': round(float(last_data['Lag1_MACD']), 2),
        'macd_signal': round(float(last_data['Lag1_MACD_Signal']), 2),
        'volume': float(last_data['Volume']), # 成交量為整數，不需四捨五入
        'volume_prev': float(prev_data['Volume']), # 成交量為整數，不需四捨五入
        'ma5': round(float(last_data['MA5']), 2),
        'ma10': round(float(last_data['MA10']), 2),
        'bb_upper': round(float(last_data['BB_Upper']), 2),
    }

    return model, scaler, lag_cols, price_fig, macd_fig, default_inputs

# 執行一次性設置
model, scaler, lag_cols, price_fig, macd_fig, default_inputs = load_data_and_train_model()


# --- 3. 定義 Flask 路由 (這部分無需修改) ---
@app.route('/', methods=['GET'])
def home():
    """渲染主頁面"""
    price_chart_html = price_fig.to_html(full_html=False, include_plotlyjs='cdn')
    macd_chart_html = macd_fig.to_html(full_html=False, include_plotlyjs='cdn')

    return render_template(
        'index.html',
        price_chart_html=price_chart_html,
        macd_chart_html=macd_chart_html,
        inputs=default_inputs
    )

@app.route('/predict', methods=['POST'])
def predict():
    """處理預測請求"""
    user_inputs = {
        'close': request.form.get('close', type=float),
        'close_prev': request.form.get('close_prev', type=float),
        'rsi': request.form.get('rsi', type=float),
        'macd': request.form.get('macd', type=float),
        'macd_signal': request.form.get('macd_signal', type=float),
        'volume': request.form.get('volume', type=float),
        'volume_prev': request.form.get('volume_prev', type=float),
        'ma5': request.form.get('ma5', type=float),
        'ma10': request.form.get('ma10', type=float),
        'bb_upper': request.form.get('bb_upper', type=float),
    }

    data = {
        'Lag1_Close': user_inputs['close'],
        'Lag1_Return': (user_inputs['close'] - user_inputs['close_prev']) / user_inputs['close_prev'],
        'Lag1_RSI': user_inputs['rsi'],
        'Lag1_MACD': user_inputs['macd'],
        'Lag1_MACD_Signal': user_inputs['macd_signal'],
        'Volume_Change': (user_inputs['volume'] - user_inputs['volume_prev']) / user_inputs['volume_prev'],
        'MA5_diff': (user_inputs['ma5'] - user_inputs['ma10']) / user_inputs['ma10'],
        'BB_Pressure': user_inputs['close'] / user_inputs['bb_upper']
    }
    input_df = pd.DataFrame([data])
    input_df = input_df[lag_cols]

    X_in = scaler.transform(input_df)
    pred = model.predict(X_in)[0]
    prob = model.predict_proba(X_in)[0][1]

    prediction_text = '上漲' if pred == 1 else '下跌'
    confidence = f"{prob:.2%}"

    input_df_html = input_df.T.rename(columns={0: '原始輸入值'}).to_html(classes='table table-striped')
    scaled_df = pd.DataFrame(X_in, columns=lag_cols)
    scaled_df_html = scaled_df.T.rename(columns={0: '標準化後數據'}).to_html(classes='table table-striped')

    price_chart_html = price_fig.to_html(full_html=False, include_plotlyjs='cdn')
    macd_chart_html = macd_fig.to_html(full_html=False, include_plotlyjs='cdn')

    return render_template(
        'index.html',
        price_chart_html=price_chart_html,
        macd_chart_html=macd_chart_html,
        inputs=user_inputs,
        prediction_text=prediction_text,
        confidence=confidence,
        input_df_html=input_df_html,
        scaled_df_html=scaled_df_html
    )

# --- 4. 運行應用 ---
if __name__ == '__main__':
    app.run(debug=True)