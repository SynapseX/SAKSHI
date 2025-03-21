# Use the official Python image as a base
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI application code
COPY . /app/backend

# Expose the application port (default FastAPI port is 8000)
EXPOSE 8000

# Command to run the FastAPI application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]