from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from oauth2client.client import flow_from_clientsecrets, FlowExchangeError
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import json
import os

# Flask 앱 생성
app = Flask(__name__, static_folder='static', template_folder='.')
app.secret_key = 'super_secret_key'  # Change this to a random secret key

# Get the absolute path to the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Join the directory with the filename to get the absolute path to songs.json
json_path = os.path.join(script_dir, 'songs.json')

@app.route('/authorize')
def authorize():
    flow = flow_from_clientsecrets(
        os.path.join(script_dir, 'client_secrets.json'),
        scope='https://www.googleapis.com/auth/youtube.force-ssl',
        redirect_uri=url_for('exchange', _external=True)
    )
    auth_uri = flow.step1_get_authorize_url()
    return redirect(auth_uri)

@app.route('/exchange')
def exchange():
    try:
        # Get the authorization code from the request
        auth_code = request.args.get('code')

        # Exchange the authorization code for an access token
        flow = flow_from_clientsecrets(
            os.path.join(script_dir, 'client_secrets.json'),
            scope='https://www.googleapis.com/auth/youtube.force-ssl',
            redirect_uri=url_for('exchange', _external=True)
        )
        credentials = flow.step2_exchange(auth_code)

        # Store the credentials in the session
        session['credentials'] = credentials.to_json()

        return redirect(url_for('youtube_playlist'))
    except FlowExchangeError:
        return 'Failed to exchange authorization code.'

@app.route('/create_playlist', methods=['POST'])
def create_playlist():
    if 'credentials' not in session:
        return jsonify({'success': False, 'error': 'User not authenticated.'})

    credentials = Credentials.from_authorized_user_info(json.loads(session['credentials']))
    youtube = build('youtube', 'v3', credentials=credentials)

    try:
        # Create the playlist
        playlist_title = 'like you better playlist'
        playlist_description = 'This is a playlist created by the YouTube Playlist Creator.'
        playlist_request = youtube.playlists().insert(
            part="snippet,status",
            body={
                "snippet": {
                    "title": playlist_title,
                    "description": playlist_description
                },
                "status": {
                    "privacyStatus": "private"
                }
            }
        )
        playlist_response = playlist_request.execute()
        playlist_id = playlist_response['id']

        # Add videos to the playlist
        with open(json_path, 'r', encoding='utf-8') as f:
            songs = json.load(f)
        
        # Create a dictionary to store the songs with their positions
        playlist_with_positions = {}
        for song in songs:
            if 'likeyoubetter' in song.get('howabout', {}):
                positions = song['howabout']['likeyoubetter']
                for pos in positions:
                    playlist_with_positions[pos] = song

        # Sort the playlist by position and get the video IDs
        sorted_video_ids = [playlist_with_positions[k]['youtubeId'] for k in sorted(playlist_with_positions.keys())]

        for video_id in sorted_video_ids:
            youtube.playlistItems().insert(
                part="snippet",
                body={
                    "snippet": {
                        "playlistId": playlist_id,
                        "resourceId": {
                            "kind": "youtube#video",
                            "videoId": video_id
                        }
                    }
                }
            ).execute()

        return jsonify({'success': True, 'playlist_id': playlist_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

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

@app.route('/is_authenticated')
def is_authenticated():
    if 'credentials' in session:
        return jsonify({'authenticated': True})
    else:
        return jsonify({'authenticated': False})



# 이 파일이 직접 실행될 때만 서버를 실행
if __name__ == '__main__':
    # Render.com 환경에서는 gunicorn을 사용하므로,
    # 로컬 테스트용으로만 app.run을 사용합니다.
    app.run(host='0.0.0.0', port=8800, debug=True)