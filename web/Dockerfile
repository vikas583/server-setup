# Step 1: Build the React app
FROM node:20.17.0-slim AS build

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL


COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Step 2: Serve the React app using nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
