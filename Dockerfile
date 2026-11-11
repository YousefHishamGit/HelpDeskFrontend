FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g npm@11.2.0
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/help-desk/browser /usr/share/nginx/html
EXPOSE 80