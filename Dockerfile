"FROM python:3.9-slim" 
"WORKDIR /app" 
"COPY . /app" 
"RUN pip install -r backend/requirements.txt" 
"EXPOSE 8000" 
"CMD ['uvicorn', 'backend.api.main:app', '--host', '0.0.0.0', '--port', '8000']" 
