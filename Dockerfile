FROM 607705927749.dkr.ecr.eu-north-1.amazonaws.com/base/cicd-container-base-images/nginx-ubi9:20250424-0904

# Copy built frontend assets
COPY dist/ /opt/app/static

# Copy Nginx config files
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types

# Copy the entrypoint script
COPY scripts/entrypoint.sh /opt/app/bin/entrypoint

# Set the user to root for permission changes
USER root

# Change ownership of the app directory
RUN chown -R nginx:nginx /opt/app/

# Make the start script executable
RUN chmod u+x,g+x /opt/app/bin/entrypoint

# Set the user to nginx for running the application
USER nginx

# Use entrypoint script to start the container
CMD /opt/app/bin/entrypoint

# Expose port 8080 for the application
EXPOSE 8080