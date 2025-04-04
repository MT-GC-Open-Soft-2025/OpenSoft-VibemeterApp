


# Use an official Python runtime as a parent image
FROM python:3.11

# Set the working directory in the container
WORKDIR /usr/src/app

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy only the dependencies file to the working directory
COPY requirements.txt .

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source code
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variables for Uvicorn configuration
ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=8000
ENV UVICORN_WORKERS=5

# Run the application
CMD uvicorn server:app --host $UVICORN_HOST --port $UVICORN_PORT --workers $UVICORN_WORKERS


# Optional: Add a health check (check every 30s with a timeout of 5s, starting after 5s)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
 CMD curl -f http://localhost:8000/ || exit 1
