import threading
import time

from backend.app.services.session_manager import SessionManager


class SessionWatcher:
    def __init__(self):
        self.sessionmanager = None
        self.sessions = []
        self.session_manager = SessionManager()


    def watch_sessions(self):
        while True:
            # Add your session watching logic here
            for session in self.sessions:
                if session['status'] == 'active':
                    if session['expires_at'] < time.time():
                        self.sessionmanager.completed_session(session['id'])
                        self.sessions.remove(session)
                        print(f"Session {session['id']} has expired and is removed.")
                    if session['status'] == 'completed':
                        self.sessionmanager.completed_session(session['id'])
                        self.sessions.remove(session)
                        print(f"Session {session['id']} has been marked as completed and is removed.")
            print("Watching sessions:", self.sessions)
            time.sleep(5)  # Sleep for 5 seconds before checking again

    def add_session(self, session):
        self.sessions.append(session)

def start_watching():
    watcher = SessionWatcher()
    watcher_thread = threading.Thread(target=watcher.watch_sessions)
    watcher_thread.daemon = True  # Daemonize thread
    watcher_thread.start()
    return watcher