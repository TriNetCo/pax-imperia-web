FROM liquibase/liquibase:4.19.0

# Root level setup
RUN mkdir /liquibase/jdbc
WORKDIR /liquibase/jdbc

USER root

ADD liquibase.properties .
ADD changelogs/ ./changelogs/

RUN apt-get update && apt-get install -y netcat

#RUN apt-get update && \
#      apt-get install -y vim tmux git mysql-client

USER liquibase

COPY entrypoint.sh /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
