# # Step 1: Start from an official Node.js Long-Term Support (LTS) image
# FROM node:18-slim

# # Step 2: Install only the extra tools we need (Python and sudo)
# # Node.js and npm are already included in this base image.
# RUN apt-get update && apt-get install -y \
#     python3 \
#     sudo \
#     && apt-get clean

# # Step 3: Set up the working environment
# WORKDIR /app

# # Step 4: Copy package files and install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy the rest of your application code
# COPY . .

# # Step 5: Expose the application port
# EXPOSE 3000

# # Step 6: Define the command to run when the container starts
# CMD ["node", "index.js"]





# Start from the official Node.js image
FROM node:18-slim

# Install Python and sudo
RUN apt-get update && apt-get install -y \
    python3 \
    sudo \
    && apt-get clean

# Create a non-root user to run the application
RUN useradd -m appuser

# Add our user to the sudo group and allow it to run sudo commands without a password
RUN usermod -aG sudo appuser
RUN echo "appuser ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
# We chown here to ensure appuser owns the files, not root
COPY --chown=appuser:appuser package*.json ./
RUN npm install

# Copy the rest of your application code
COPY --chown=appuser:appuser . .

# Switch to the non-root user
USER appuser

# Expose the application port
EXPOSE 3000

