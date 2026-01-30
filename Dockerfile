FROM node:24-alpine AS base

RUN apk add --no-cache bash shadow su-exec

ARG LOG_DIR

ENV LOG_DIR=$LOG_DIR
RUN mkdir -p "$LOG_DIR"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .


