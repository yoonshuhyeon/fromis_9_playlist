from flask import Flask, render_template, jsonify, request
import json
import os

# Flask 앱 생성
app = Flask(__name__, static_folder='static', template_folder='.')

# Get the absolute path to the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Join the directory with the filename to get the absolute path to songs.json
json_path = os.path.join(script_dir, 'songs.json')

# 루트 URL('/')에 접속했을 때 실행될 함수
@app.route('/')
def home():
    # index.html 파일을 렌더링하여 보여줌
    return render_template('index.html')

@app.route('/api/songs')
def get_songs():
    with open(json_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)

    mood = request.args.get('mood')
    time = request.args.get('time')

    filtered_songs = songs

    if mood:
        filtered_songs = [song for song in filtered_songs if mood in song['mood']]
    
    if time:
        filtered_songs = [song for song in filtered_songs if time in song['time']]

    return jsonify(filtered_songs)

@app.route('/api/playlist/<playlist_name>')
def get_playlist(playlist_name):
    with open(json_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)

    playlist_with_positions = {}
    for song in songs:
        if playlist_name in song.get('howabout', {}):
            positions = song['howabout'][playlist_name]
            for pos in positions:
                playlist_with_positions[pos] = song

    # Sort the playlist by position and get the song objects
    sorted_playlist = [playlist_with_positions[k] for k in sorted(playlist_with_positions.keys())]

    return jsonify(sorted_playlist)

# 이 파일이 직접 실행될 때만 서버를 실행
if __name__ == '__main__':
    # Render.com 환경에서는 gunicorn을 사용하므로,
    # 로컬 테스트용으로만 app.run을 사용합니다.
    app.run(host='0.0.0.0', port=8800, debug=True)