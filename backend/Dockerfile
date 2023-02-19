FROM golang:1.20.1 as build

WORKDIR /backend
ADD . /backend/

COPY go.mod go.sum ./
RUN go mod verify

WORKDIR /backend/cmd
RUN go build -v -o pax


#
# Runtime Container
#

FROM gcr.io/distroless/base
COPY --from=build /backend/cmd/pax /

ENV PORT=3001
ENV LISTEN_ADDRESS='0.0.0.0'
ENV DB_USER=root
ENV DB_PASS=password

CMD ["/pax"]
