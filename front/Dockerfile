FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i --legacy-peer-deps

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY src ./src

RUN npm i --legacy-peer-deps

