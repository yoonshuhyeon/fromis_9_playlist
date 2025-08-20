from flask import Flask, render_template

# Flask 앱 생성
app = Flask(__name__, static_folder='.', template_folder='.')

# 루트 URL('/')에 접속했을 때 실행될 함수
@app.route('/')
def home():
    # index.html 파일을 렌더링하여 보여줌
    return render_template('index.html')

# 이 파일이 직접 실행될 때만 서버를 실행
if __name__ == '__main__':
    # Render.com 환경에서는 gunicorn을 사용하므로,
    # 로컬 테스트용으로만 app.run을 사용합니다.
    app.run(host='0.0.0.0', port=8000, debug=True)
