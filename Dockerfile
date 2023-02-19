FROM node:19.6.1 as ui-build

# This is just load balancer container used to serve the frontend (and proxy auth stuff)

ARG REACT_APP_PAX_APP_ENV local
ARG REACT_APP_PAX_SOCKET_URL ws://localhost:3001/websocket
ARG REACT_APP_PAX_BACKEND_URL http://localhost:3001
ARG REACT_APP_AUTH_DOMAIN localhost:3000
ARG REACT_APP_PAX_GOOGLE_PROJECT_ID
ARG REACT_APP_PAX_FIREBASE_API_KEY

ENV REACT_APP_PAX_APP_ENV=$REACT_APP_PAX_APP_ENV
ENV REACT_APP_PAX_SOCKET_URL=$REACT_APP_PAX_SOCKET_URL
ENV REACT_APP_PAX_BACKEND_URL=$REACT_APP_PAX_BACKEND_URL
ENV REACT_APP_AUTH_DOMAIN=$REACT_APP_AUTH_DOMAIN
ENV REACT_APP_PAX_GOOGLE_PROJECT_ID=$REACT_APP_PAX_GOOGLE_PROJECT_ID
ENV REACT_APP_PAX_FIREBASE_API_KEY=$REACT_APP_PAX_FIREBASE_API_KEY

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app
COPY ./react-frontend/ /app/react-frontend/
COPY ./pax-imperia-js/ /app/pax-imperia-js/
WORKDIR /app/react-frontend

RUN npm ci
RUN npm run build

# server environment
FROM nginx:1.23.3-alpine

COPY react-frontend/nginx.conf /etc/nginx/conf.d/configfile.template
COPY --from=ui-build /app/react-frontend/build /usr/share/nginx/html
ENV PORT 8080
ENV HOST 0.0.0.0
EXPOSE 8080
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
