FROM node:latest as ui-build

# Unfortunatemly, this is just the frontend container which shouldn't even exist

RUN mkdir /app
WORKDIR /app
COPY . ./
WORKDIR /app/react-frontend

# setting default values for arguments
ARG VITE_PAX_ENV=local
ARG SOCKET_URL=ws://localhost:3001/websocket
ARG BACKEND_URL=http://localhost:3001
# assigning values provided in build command
ENV VITE_PAX_ENV=$VITE_PAX_ENV
ENV VITE_SOCKET_URL=$SOCKET_URL
ENV VITE_BACKEND_URL=$BACKEND_URL
ENV NODE_ENV=production

RUN ls ..
RUN npm i
RUN npm run build

# server environment
FROM nginx:alpine
COPY react-frontend/nginx.conf /etc/nginx/conf.d/configfile.template
COPY --from=ui-build /app/react-frontend/build /usr/share/nginx/html
ENV PORT 8080
ENV HOST 0.0.0.0
EXPOSE 8080
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
